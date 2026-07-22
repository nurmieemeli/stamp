"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { isKnownPlatform } from "@/lib/platforms";
import { isValidPalette, isProPalette, DEFAULT_PALETTE } from "@/lib/palettes";
import { AVATAR_DIR, deleteAvatarFile } from "@/lib/avatar-storage";
import { validateCleanText, isHttpsUrl, isHexColor } from "@/lib/validation";
import { searchTracks, type TrackResult } from "@/lib/music-search";
import { rateLimit } from "@/lib/rate-limit";
import { exceedsLinkCap, FREE_LINK_LIMIT, PRO_LINK_LIMIT } from "@/lib/limits";
import { stripe } from "@/lib/stripe";
import { PRO_PRICE_CENTS, PRO_PRICE_CURRENCY } from "@/lib/pro-price";
import { baseUrl } from "@/lib/url";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const AVATAR_DIMENSION = 800;

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type SaveProfilePayload = {
  displayName: string;
  bio: string;
  trackTitle: string;
  trackArtist: string;
  trackPreviewUrl: string;
  trackArtworkUrl: string;
  trackUrl: string;
  palette: string;
  customAccent: string;
  links: { platform: string; value: string }[];
};

export type SaveState = { error: string; savedAt: number | null };

export async function saveProfileAction(payload: SaveProfilePayload): Promise<SaveState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", savedAt: null };
  }

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPro: true, profile: { select: { id: true } } },
  });
  if (!user || !user.profile) {
    return { error: "Profile not found.", savedAt: null };
  }
  const isPro = user.isPro;
  const profileId = user.profile.id;

  const displayName = payload.displayName.trim();
  if (!displayName) {
    return { error: "Display name can't be empty.", savedAt: null };
  }

  const links = payload.links
    .filter((l) => isKnownPlatform(l.platform) && l.value.trim())
    .map((l) => ({ platform: l.platform, value: l.value.trim() }));

  const textFields: [string, string][] = [
    ["Display name", displayName],
    ["Bio", payload.bio],
    ["Now spinning", payload.trackTitle],
    ...links.map((l): [string, string] => ["A link", l.value]),
  ];
  for (const [label, value] of textFields) {
    const error = validateCleanText(label, value);
    if (error) return { error, savedAt: null };
  }

  // The dashboard only ever submits URLs that came back from a real search
  // (lib/music-search.ts), but a direct server-action call could submit
  // anything — reject anything that isn't a plain https URL (or empty).
  const trackUrls = [payload.trackPreviewUrl, payload.trackArtworkUrl, payload.trackUrl];
  if (trackUrls.some((url) => !isHttpsUrl(url))) {
    return { error: "Now playing data looks invalid — try searching again.", savedAt: null };
  }

  if (isProPalette(payload.palette) && !isPro) {
    return { error: "That palette is a Pro perk — upgrade to use it.", savedAt: null };
  }
  const palette = isValidPalette(payload.palette) ? payload.palette : DEFAULT_PALETTE;

  const customAccent = payload.customAccent.trim();
  if (customAccent) {
    if (!isPro) {
      return { error: "Custom accent colors are a Pro perk — upgrade to use one.", savedAt: null };
    }
    if (!isHexColor(customAccent)) {
      return { error: "Custom accent must be a hex color, like #6fcf7f.", savedAt: null };
    }
  }

  const currentLinkCount = await db.link.count({ where: { profileId } });
  if (exceedsLinkCap(isPro, links.length, currentLinkCount)) {
    const cap = isPro ? PRO_LINK_LIMIT : FREE_LINK_LIMIT;
    const upsell = isPro ? "" : " Upgrade to Pro for more.";
    return { error: `You're limited to ${cap} links on your current plan.${upsell}`, savedAt: null };
  }

  await db.$transaction(async (tx) => {
    const profile = await tx.profile.update({
      where: { userId },
      data: {
        displayName,
        bio: payload.bio.trim(),
        trackTitle: payload.trackTitle.trim(),
        trackArtist: payload.trackArtist.trim(),
        trackPreviewUrl: payload.trackPreviewUrl.trim(),
        trackArtworkUrl: payload.trackArtworkUrl.trim(),
        trackUrl: payload.trackUrl.trim(),
        palette,
        customAccent,
      },
    });

    await tx.link.deleteMany({ where: { profileId: profile.id } });
    if (links.length > 0) {
      await tx.link.createMany({
        data: links.map((l, i) => ({ ...l, profileId: profile.id, order: i })),
      });
    }
  });

  revalidatePath(`/${session.user.username}`);

  return { error: "", savedAt: Date.now() };
}

export type CheckoutState = { error: string; url: string | null };

export async function createProCheckoutAction(): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", url: null };
  }

  if (!stripe) {
    return { error: "Payments aren't configured yet.", url: null };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { error: "Account not found.", url: null };
  }
  if (user.isPro) {
    return { error: "You're already Pro.", url: null };
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const origin = await baseUrl();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: PRO_PRICE_CURRENCY,
          unit_amount: PRO_PRICE_CENTS,
          product_data: { name: "Stamp Pro — lifetime upgrade" },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id },
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/dashboard?upgrade_cancelled=1`,
  });

  if (!checkoutSession.url) {
    return { error: "Couldn't start checkout. Try again.", url: null };
  }

  return { error: "", url: checkoutSession.url };
}

export type AvatarState = { error: string; avatarUrl: string | null };

export async function uploadAvatarAction(formData: FormData): Promise<AvatarState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", avatarUrl: null };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload.", avatarUrl: null };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be smaller than 8MB.", avatarUrl: null };
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .rotate() // bake in EXIF orientation before metadata is stripped below
      .resize(AVATAR_DIMENSION, AVATAR_DIMENSION, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { error: "That file isn't a readable image.", avatarUrl: null };
  }

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return { error: "Profile not found.", avatarUrl: null };
  }

  const filename = `${randomUUID()}.webp`;
  await mkdir(AVATAR_DIR, { recursive: true });
  await writeFile(path.join(AVATAR_DIR, filename), outputBuffer);

  const avatarUrl = `/uploads/avatars/${filename}`;
  await db.profile.update({ where: { id: profile.id }, data: { avatarUrl } });
  await deleteAvatarFile(profile.avatarUrl);

  revalidatePath(`/${session.user.username}`);
  revalidatePath("/dashboard");

  return { error: "", avatarUrl };
}

export async function removeAvatarAction(): Promise<AvatarState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", avatarUrl: null };
  }

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return { error: "Profile not found.", avatarUrl: null };
  }

  await db.profile.update({ where: { id: profile.id }, data: { avatarUrl: "" } });
  await deleteAvatarFile(profile.avatarUrl);

  revalidatePath(`/${session.user.username}`);
  revalidatePath("/dashboard");

  return { error: "", avatarUrl: "" };
}

export type TrackSearchState = { error: string; results: TrackResult[] };

export async function searchTracksAction(query: string): Promise<TrackSearchState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", results: [] };
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { error: "", results: [] };
  }

  if (!rateLimit(`track-search:user:${session.user.id}`, 30, 60 * 1000)) {
    return { error: "Too many searches — slow down a bit.", results: [] };
  }

  try {
    const results = await searchTracks(trimmed);
    return { error: "", results };
  } catch (err) {
    console.error("track search failed", err);
    return { error: "Search failed. Try again.", results: [] };
  }
}
