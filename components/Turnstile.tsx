"use client";

import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Renders Cloudflare's Turnstile challenge inside whatever <form> encloses
 * it. The widget script injects its own "cf-turnstile-response" hidden
 * field, so no extra wiring is needed on submit. Renders nothing when no
 * site key is configured (e.g. local dev) — lib/turnstile.ts's server-side
 * check is disabled to match.
 */
export function Turnstile() {
  if (!SITE_KEY) return null;

  return (
    <div className="turnstile-field">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="dark" />
    </div>
  );
}
