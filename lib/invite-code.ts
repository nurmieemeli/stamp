import { randomInt } from "node:crypto";

// Excludes visually confusable characters (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const GROUP_LENGTH = 5;
const GROUPS = 2;

/** Generates a human-shareable invite code like "7XK9M-QR3ZT". */
export function generateInviteCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUPS; g++) {
    let group = "";
    for (let i = 0; i < GROUP_LENGTH; i++) {
      group += ALPHABET[randomInt(0, ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join("-");
}

export function normalizeInviteCode(input: string): string {
  return input.trim().toUpperCase();
}
