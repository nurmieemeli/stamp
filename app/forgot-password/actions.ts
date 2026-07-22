"use server";

import { db } from "@/lib/db";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { baseUrl } from "@/lib/url";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export type ForgotPasswordState = { error: string; submitted: boolean };

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const captchaToken = formData.get("cf-turnstile-response");

  const ip = await clientIp();
  const withinLimit =
    rateLimit(`forgot:email:${email}`, 3, 15 * 60 * 1000) && rateLimit(`forgot:ip:${ip}`, 8, 15 * 60 * 1000);
  if (!withinLimit) {
    return { error: "Too many attempts. Try again in a few minutes.", submitted: false };
  }

  if (!(await verifyTurnstile(typeof captchaToken === "string" ? captchaToken : null, ip))) {
    return { error: "Verification failed. Please try again.", submitted: false };
  }

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address.", submitted: false };
  }

  const user = await db.user.findUnique({ where: { email }, include: { profile: true } });
  if (user && user.profile) {
    const { token, tokenHash } = generateResetToken();
    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    const origin = await baseUrl();
    const resetUrl = `${origin}/reset-password/${token}`;
    const avatarUrl = user.profile.avatarUrl ? `${origin}${user.profile.avatarUrl}` : null;
    // Failures are logged but not surfaced to the caller — the response
    // below stays identical whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails. Check server
    // logs (not the UI) if members report not receiving reset emails.
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      displayName: user.profile.displayName || user.username,
      avatarUrl,
      reason: "self",
    }).catch((err) => {
      console.error("forgot-password: failed to send reset email", err);
    });
  }

  return { error: "", submitted: true };
}
