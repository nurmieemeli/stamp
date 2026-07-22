"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashVerificationCode, generateVerificationCode, VERIFICATION_CODE_TTL_MS } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type VerifyEmailState = { error: string; verified: boolean };

export async function verifyEmailAction(_prev: VerifyEmailState, formData: FormData): Promise<VerifyEmailState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", verified: false };
  }

  const code = String(formData.get("code") || "").trim();
  if (!code) {
    return { error: "Enter the code from your email.", verified: false };
  }

  const ip = await clientIp();
  const withinLimit =
    rateLimit(`verify-email:user:${session.user.id}`, 8, 15 * 60 * 1000) &&
    rateLimit(`verify-email:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!withinLimit) {
    return { error: "Too many attempts. Try again in a few minutes.", verified: false };
  }

  const codeHash = hashVerificationCode(code);
  const token = await db.emailVerificationToken.findFirst({
    where: { userId: session.user.id, codeHash, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return { error: "That code is incorrect or has expired.", verified: false };
  }

  await db.$transaction([
    db.user.update({ where: { id: session.user.id }, data: { emailVerifiedAt: new Date() } }),
    db.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    // A successful verification invalidates any other outstanding codes.
    db.emailVerificationToken.deleteMany({
      where: { userId: session.user.id, id: { not: token.id }, usedAt: null },
    }),
  ]);

  return { error: "", verified: true };
}

export type ResendState = { error: string; sent: boolean };

export async function resendVerificationCodeAction(): Promise<ResendState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Your session expired. Please log in again.", sent: false };
  }

  const ip = await clientIp();
  const withinLimit =
    rateLimit(`verify-email-resend:user:${session.user.id}`, 3, 60 * 60 * 1000) &&
    rateLimit(`verify-email-resend:ip:${ip}`, 8, 60 * 60 * 1000);
  if (!withinLimit) {
    return { error: "Too many resend requests. Try again later.", sent: false };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, include: { profile: true } });
  if (!user || !user.profile) {
    return { error: "Account not found.", sent: false };
  }
  if (user.emailVerifiedAt) {
    return { error: "Your email is already verified.", sent: false };
  }

  const { code, codeHash } = generateVerificationCode();
  await db.emailVerificationToken.create({
    data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS) },
  });

  try {
    await sendVerificationEmail({ to: user.email, displayName: user.profile.displayName, code });
  } catch (err) {
    console.error("resend-verification: failed to send email", err);
    return { error: "Couldn't send the email — try again shortly.", sent: false };
  }

  return { error: "", sent: true };
}
