"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";
import { normalizeUsername, validateUsername, validateCleanText } from "@/lib/validation";
import { normalizeInviteCode } from "@/lib/invite-code";
import { generateVerificationCode, VERIFICATION_CODE_TTL_MS } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";
import { Prisma } from "@/app/generated/prisma/client";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export type SignupState = { error: string };

class InviteCodeError extends Error {}

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const session = await auth();
  if (session?.user) {
    return { error: "You're already logged in — log out first to create another account." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const username = normalizeUsername(String(formData.get("username") || ""));
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim() || username;
  const inviteCode = normalizeInviteCode(String(formData.get("inviteCode") || ""));
  const captchaToken = formData.get("cf-turnstile-response");

  const ip = await clientIp();
  if (!rateLimit(`signup:ip:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many accounts created from this connection. Try again later." };
  }

  if (!(await verifyTurnstile(typeof captchaToken === "string" ? captchaToken : null, ip))) {
    return { error: "Verification failed. Please try again." };
  }

  if (!inviteCode) {
    return { error: "Enter your invite code." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  const usernameError = validateUsername(username);
  if (usernameError) {
    return { error: usernameError };
  }

  const displayNameError = validateCleanText("Display name", displayName);
  if (displayNameError) {
    return { error: displayNameError };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const [emailTaken, usernameTaken] = await Promise.all([
    db.user.findUnique({ where: { email } }),
    db.user.findUnique({ where: { username } }),
  ]);
  if (emailTaken) return { error: "An account with that email already exists." };
  if (usernameTaken) return { error: "That handle is already taken." };

  const passwordHash = await bcrypt.hash(password, 12);
  const { code: verificationCode, codeHash } = generateVerificationCode();

  let userId: string;
  try {
    userId = await db.$transaction(async (tx) => {
      // Atomic claim: only one concurrent signup can flip usedAt away from
      // null for a given code, so this is race-safe without extra locking.
      const claim = await tx.inviteCode.updateMany({
        where: { code: inviteCode, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claim.count === 0) {
        throw new InviteCodeError("Invalid or already-used invite code.");
      }

      const user = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          emailVerifiedAt: null,
          profile: { create: { displayName } },
        },
      });

      await tx.inviteCode.updateMany({ where: { code: inviteCode }, data: { usedByUserId: user.id } });

      await tx.emailVerificationToken.create({
        data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS) },
      });

      return user.id;
    });
  } catch (err) {
    if (err instanceof InviteCodeError) {
      return { error: err.message };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(",") ?? "";
      if (target.includes("username")) {
        return { error: "That handle is already taken." };
      }
      if (target.includes("email")) {
        return { error: "An account with that email already exists." };
      }
      return { error: "That handle or email is already taken." };
    }
    throw err;
  }

  try {
    await sendVerificationEmail({ to: email, displayName, code: verificationCode });
  } catch (err) {
    console.error("signup: failed to send verification email", err);
    // Don't leave an account behind that can never be verified — undo the
    // user and free the invite code so the person can try again once
    // email sending is fixed.
    await db.user.delete({ where: { id: userId } }).catch((cleanupErr) => {
      console.error("signup: failed to roll back user after email-send failure", cleanupErr);
    });
    await db.inviteCode
      .updateMany({ where: { code: inviteCode }, data: { usedAt: null, usedByUserId: null } })
      .catch((cleanupErr) => {
        console.error("signup: failed to release invite code after email-send failure", cleanupErr);
      });
    return { error: "Couldn't send your verification email. Please try again shortly." };
  }

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });

  return { error: "" };
}
