"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { isKnownPlatform } from "@/lib/platforms";
import { isValidPalette, DEFAULT_PALETTE } from "@/lib/palettes";
import { AVATAR_DIR, deleteAvatarFile } from "@/lib/avatar-storage";
import { validateCleanText } from "@/lib/validation";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const AVATAR_DIMENSION = 800;

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type SaveProfilePayload = {
  displayName: string;
  eyebrow: string;
  bio: string;
  bioSecondary: string;
  trackTitle: string;
  palette: string;
  links: { platform: string; value: string }[];
};

export type SaveState = { error: string; savedAt: number | null };

export async function saveProfileAction(payload: SaveProfilePayload): Promise<SaveState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", savedAt: null };
  }

  const displayName = payload.displayName.trim();
  if (!displayName) {
    return { error: "Display name can't be empty.", savedAt: null };
  }

  const links = payload.links
    .filter((l) => isKnownPlatform(l.platform) && l.value.trim())
    .map((l) => ({ platform: l.platform, value: l.value.trim() }));

  const textFields: [string, string][] = [
    ["Display name", displayName],
    ["Role / location", payload.eyebrow],
    ["Bio", payload.bio],
    ["Bio, line two", payload.bioSecondary],
    ["Now spinning", payload.trackTitle],
    ...links.map((l): [string, string] => ["A link", l.value]),
  ];
  for (const [label, value] of textFields) {
    const error = validateCleanText(label, value);
    if (error) return { error, savedAt: null };
  }

  const palette = isValidPalette(payload.palette) ? payload.palette : DEFAULT_PALETTE;

  const userId = session.user.id;

  await db.$transaction(async (tx) => {
    const profile = await tx.profile.update({
      where: { userId },
      data: {
        displayName,
        eyebrow: payload.eyebrow.trim(),
        bio: payload.bio.trim(),
        bioSecondary: payload.bioSecondary.trim(),
        trackTitle: payload.trackTitle.trim(),
        palette,
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
