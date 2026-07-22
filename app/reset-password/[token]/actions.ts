"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { hashResetToken } from "@/lib/reset-token";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type ResetPasswordState = { error: string; success: boolean };

export async function resetPasswordAction(
  token: string,
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const ip = await clientIp();
  if (!rateLimit(`reset:ip:${ip}`, 10, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Try again in a few minutes.", success: false };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", success: false };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match.", success: false };
  }

  const tokenHash = hashResetToken(token);
  const resetToken = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired.", success: false };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    // A fresh reset invalidates any other outstanding links for this user.
    db.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId, id: { not: resetToken.id } },
    }),
  ]);

  return { error: "", success: true };
}
