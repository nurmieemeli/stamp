import { containsProfanity } from "./content-filter";

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,18}[a-z0-9])?$/;

const RESERVED = new Set([
  "admin",
  "api",
  "dashboard",
  "login",
  "signup",
  "settings",
  "stamp",
  "www",
  "help",
  "support",
  "report",
  "auth",
  "reset-password",
  "forgot-password",
  "verify-email",
]);

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function validateUsername(rawUsername: string): string | null {
  const username = normalizeUsername(rawUsername);
  if (!USERNAME_RE.test(username)) {
    return "3–20 characters: lowercase letters, numbers, and hyphens only.";
  }
  if (RESERVED.has(username)) {
    return "That handle is reserved.";
  }
  if (containsProfanity(username)) {
    return "That handle isn't allowed.";
  }
  return null;
}

/** Screens free-text profile fields (display name, bio, etc.) for slurs and profanity. */
export function validateCleanText(label: string, value: string): string | null {
  if (containsProfanity(value)) {
    return `${label} contains language that isn't allowed.`;
  }
  return null;
}
