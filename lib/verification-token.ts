import { randomInt, createHash } from "node:crypto";

export const VERIFICATION_CODE_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const VERIFICATION_CODE_LENGTH = 6;

// Only the hash is ever stored — same rationale as lib/reset-token.ts.
export function hashVerificationCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function generateVerificationCode(): { code: string; codeHash: string } {
  const code = String(randomInt(0, 10 ** VERIFICATION_CODE_LENGTH)).padStart(VERIFICATION_CODE_LENGTH, "0");
  return { code, codeHash: hashVerificationCode(code) };
}
