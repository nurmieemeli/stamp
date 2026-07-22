const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile response token server-side. When
 * TURNSTILE_SECRET_KEY isn't set (e.g. local dev without Cloudflare keys),
 * the challenge is treated as disabled and this always passes — the widget
 * itself is also skipped client-side in that case, so this only matters if
 * someone posts to the form directly.
 */
export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Cloudflare unreachable — fail closed rather than let a network blip
    // through as an unverified submission.
    return false;
  }
}
