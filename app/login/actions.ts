"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export type LoginState = { error: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const captchaToken = formData.get("cf-turnstile-response");

  const ip = await clientIp();
  const withinLimit =
    rateLimit(`login:email:${email}`, 5, 15 * 60 * 1000) && rateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!withinLimit) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  if (!(await verifyTurnstile(typeof captchaToken === "string" ? captchaToken : null, ip))) {
    return { error: "Verification failed. Please try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Incorrect email or password." };
    }
    throw err;
  }

  return { error: "" };
}
