import path from "node:path";

// Deliberately outside public/ — next start does not dynamically serve files
// added to public/ after the server boots (next dev does, which is why this
// worked in every dev-mode test but 404'd in production). Files here are
// served through app/uploads/avatars/[filename]/route.ts instead, which
// reads from disk on every request.
export const AVATAR_DIR = path.join(process.cwd(), "storage", "avatars");

const FILENAME_RE = /^[a-f0-9-]+\.webp$/i;

export function isValidAvatarFilename(filename: string): boolean {
  return FILENAME_RE.test(filename);
}
