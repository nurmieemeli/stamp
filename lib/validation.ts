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
  return null;
}
