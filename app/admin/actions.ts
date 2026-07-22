"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { normalizeUsername, validateUsername } from "@/lib/validation";
import { isValidPalette, DEFAULT_PALETTE } from "@/lib/palettes";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { baseUrl } from "@/lib/url";
import { deleteAvatarFile } from "@/lib/avatar-storage";
import { Prisma } from "@/app/generated/prisma/client";

export type AdminSaveState = { error: string; savedAt: number | null };

export async function setUserBadgesAction(username: string, badgeKeys: string[]): Promise<AdminSaveState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized.", savedAt: null };
  }

  const user = await db.user.findUnique({
    where: { username },
    omit: { passwordHash: true },
    include: { profile: true },
  });
  if (!user || !user.profile) {
    return { error: "Member not found.", savedAt: null };
  }

  const badges = await db.badge.findMany({ where: { key: { in: badgeKeys } } });
  const profileId = user.profile.id;

  await db.$transaction([
    db.profileBadge.deleteMany({ where: { profileId } }),
    ...(badges.length > 0
      ? [db.profileBadge.createMany({ data: badges.map((b) => ({ profileId, badgeId: b.id })) })]
      : []),
  ]);

  revalidatePath(`/${username}`);
  revalidatePath(`/admin/${username}`);
  revalidatePath("/admin");

  return { error: "", savedAt: Date.now() };
}

export type AdminUserUpdatePayload = {
  username: string; // original handle — identifies which account to update
  newUsername: string;
  email: string;
  displayName: string;
  eyebrow: string;
  bio: string;
  bioSecondary: string;
  trackTitle: string;
  palette: string;
};

export type AdminUserUpdateState = { error: string; savedUsername: string | null };

export async function updateUserDetailsAction(payload: AdminUserUpdatePayload): Promise<AdminUserUpdateState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized.", savedUsername: null };
  }

  const user = await db.user.findUnique({ where: { username: payload.username } });
  if (!user) {
    return { error: "Member not found.", savedUsername: null };
  }

  const newUsername = normalizeUsername(payload.newUsername);
  const usernameError = validateUsername(newUsername);
  if (usernameError) {
    return { error: usernameError, savedUsername: null };
  }

  const email = payload.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address.", savedUsername: null };
  }

  const displayName = payload.displayName.trim();
  if (!displayName) {
    return { error: "Display name can't be empty.", savedUsername: null };
  }

  const palette = isValidPalette(payload.palette) ? payload.palette : DEFAULT_PALETTE;

  try {
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { username: newUsername, email },
      }),
      db.profile.update({
        where: { userId: user.id },
        data: {
          displayName,
          eyebrow: payload.eyebrow.trim(),
          bio: payload.bio.trim(),
          bioSecondary: payload.bioSecondary.trim(),
          trackTitle: payload.trackTitle.trim(),
          palette,
        },
      }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(",") ?? "";
      if (target.includes("username")) return { error: "That handle is already taken.", savedUsername: null };
      if (target.includes("email")) return { error: "An account with that email already exists.", savedUsername: null };
      return { error: "That handle or email is already taken.", savedUsername: null };
    }
    throw err;
  }

  revalidatePath(`/${user.username}`);
  revalidatePath(`/admin/${user.username}`);
  if (newUsername !== user.username) {
    revalidatePath(`/${newUsername}`);
    revalidatePath(`/admin/${newUsername}`);
  }
  revalidatePath("/admin");

  return { error: "", savedUsername: newUsername };
}

export type AdminResetPasswordState = { error: string; sentTo: string | null };

export async function adminResetPasswordAction(username: string): Promise<AdminResetPasswordState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized.", sentTo: null };
  }

  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Member not found.", sentTo: null };
  }

  const { token, tokenHash } = generateResetToken();
  await db.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  const resetUrl = `${await baseUrl()}/reset-password/${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error("admin reset-password: failed to send email", err);
    return { error: "Couldn't send the email — check the email service configuration.", sentTo: null };
  }

  return { error: "", sentTo: user.email };
}

export type AdminDeleteUserState = { error: string; deleted: boolean };

export async function deleteUserAction(username: string): Promise<AdminDeleteUserState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized.", deleted: false };
  }

  const user = await db.user.findUnique({ where: { username }, include: { profile: true } });
  if (!user) {
    return { error: "Member not found.", deleted: false };
  }

  if (user.email.toLowerCase() === session.user.email?.toLowerCase()) {
    return { error: "You can't delete your own account.", deleted: false };
  }

  // Cascades to Profile, Link, ProfileBadge, and PasswordResetToken via the
  // FK constraints in the schema — only the avatar file needs cleaning up
  // separately since it lives on disk, not in the database.
  await db.user.delete({ where: { id: user.id } });
  if (user.profile?.avatarUrl) {
    await deleteAvatarFile(user.profile.avatarUrl);
  }

  revalidatePath(`/${username}`);
  revalidatePath("/admin");

  return { error: "", deleted: true };
}
