"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { normalizeUsername, validateUsername, validateCleanText } from "@/lib/validation";
import { Prisma } from "@/app/generated/prisma/client";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export type SignupState = { error: string };

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const username = normalizeUsername(String(formData.get("username") || ""));
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim() || username;
  const captchaToken = formData.get("cf-turnstile-response");

  const ip = await clientIp();
  if (!rateLimit(`signup:ip:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many accounts created from this connection. Try again later." };
  }

  if (!(await verifyTurnstile(typeof captchaToken === "string" ? captchaToken : null, ip))) {
    return { error: "Verification failed. Please try again." };
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

  try {
    await db.user.create({
      data: {
        email,
        username,
        passwordHash,
        profile: {
          create: { displayName },
        },
      },
    });
  } catch (err) {
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

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });

  return { error: "" };
}
