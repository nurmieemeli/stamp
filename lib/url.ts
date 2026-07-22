import { headers } from "next/headers";

/**
 * Mirrors the trust placed in the Host header for NextAuth (see lib/auth.ts's
 * trustHost) so links we build (e.g. password reset URLs) match whatever
 * domain the request actually arrived on, behind nginx or otherwise.
 */
export async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}
