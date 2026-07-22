# Stamp

A bio-link platform in the spirit of guns.lol, rebuilt with a dark, technical, monospace-driven visual language instead of neon/glitch. Next.js (App Router) + TypeScript, Prisma on SQLite, NextAuth credentials auth.

## Setup

```bash
npm install
```

Create `.env` (see `.env` in the repo for the current local values):

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<random secret — regenerate before any real deployment>"
ADMIN_EMAILS="admin@stamp.rip"   # comma-separated; these accounts get access to /admin

# Optional — CAPTCHA on login/signup (Cloudflare Turnstile). Leave unset locally;
# the widget and server-side check are both skipped when these aren't set.
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# Required — signup emails every new account a verification code before
# their dashboard unlocks, so without this nobody can actually finish
# signing up. Also used for password reset emails. Get an API key at
# resend.com; RESEND_FROM_EMAIL needs a domain verified there (falls back
# to Resend's shared onboarding@resend.dev sender if unset, which is fine
# for local testing but shouldn't be used in production).
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Stamp <noreply@stamp.rip>"
```

Set up the database:

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts   # seeds the badge catalog + a bootstrap invite code
```

Signup is invite-only (see Project shape below) — the seed command above prints a one-time invite code to the console the first time it runs, since a fresh database has no members yet to hand one out. Use that code for your first signup, then generate more from `/admin/invites` once you're in.

Run the dev server:

```bash
npm run dev
```

## Project shape

- `/` — landing page
- `/signup` — invite-only: requires a valid unused invite code, then emails a 6-digit verification code before the account can be used
- `/verify-email` — where a freshly signed-up member enters that code; the dashboard redirects here until it's done
- `/login` — credentials auth
- `/dashboard` — the logged-in member's editor (identity, links, badges are read-only here) — inaccessible until email verification is complete
- `/[username]` — public profile page
- `/admin`, `/admin/[username]` — member account/profile editing, badge grants, triggering password reset emails, and deleting accounts, gated by `ADMIN_EMAILS`; the member list is paginated (25/page)
- `/admin/invites` — generate invite codes and see which are used/unused/by whom
- `/forgot-password` — self-service: a member requests their own reset link by email
- `/reset-password/[token]` — where a member lands after a reset email (self-requested or admin-triggered); sets a new password
- `lib/platforms.ts` — the fixed catalog of link platforms and how each one's URL is built from a handle
- `lib/palettes.ts` — the five color palettes (Amber, Nord, Dracula, Forest, Paper) members pick for their public page; applied as CSS custom properties scoped to the profile `.window`, independent of the app's own fixed dark chrome
- `lib/music-search.ts` — "now playing" track search against iTunes' free, unauthenticated search API; only returns results with a real 30-second preview URL, which is what makes the play button on a profile actually play something
- `components/ProfileView.tsx` — the single render used by both the public page and the dashboard's live preview

## Commands

```bash
npm run dev       # start the dev server
npm run build     # production build
npm run lint      # eslint
npx tsc --noEmit  # type check
npm test          # unit tests (vitest)
```

## Deploying to your own server (nginx + persistent disk)

This only works on a host with a persistent, writable filesystem — SQLite (`dev.db`) and uploaded avatars (`storage/avatars/`) both live on disk. It will **not** work as-is on a serverless/ephemeral platform (Vercel, etc.); that needs a hosted Postgres and object storage instead.

Full step-by-step walkthrough (server prep, Node install, PM2, nginx, TLS, backups, troubleshooting): **[DEPLOYMENT.md](DEPLOYMENT.md)**. Quick summary:

```bash
git clone <your-repo> && cd <your-repo>
npm ci
# .env with a freshly generated AUTH_SECRET — see DEPLOYMENT.md step 6
npx prisma migrate deploy
npx tsx prisma/seed.ts   # prints a bootstrap invite code — save it, you'll need it
npm run build
pm2 start ecosystem.config.js && pm2 save
# copy deploy/nginx.conf.example into place, then:
sudo certbot --nginx -d stamp.rip
```

Auth won't work without HTTPS (the session cookie is marked `Secure` in production), so get the certificate before testing login.

## Known gaps

This is an early-stage build. Not yet handled: OAuth login, and an owner-facing analytics dashboard beyond the raw view count (no per-link click tracking yet). Rate limiting on auth is a simple in-memory limiter (`lib/rate-limit.ts`) — fine for a single process, not for a multi-instance deployment. Avatar/database storage is local disk — back it up yourself; there's no managed persistence. Password reset tokens are single-use and expire after an hour but existing logged-in sessions aren't revoked on reset (JWT sessions are stateless, so there's nothing server-side to invalidate). Deleting a member from `/admin` is permanent and immediate — no soft-delete or recovery window. Invite codes never expire (only single-use); email verification codes expire after 30 minutes but a member can request a new one from `/verify-email` any time. If `RESEND_API_KEY` isn't configured, signup fails outright rather than creating an unverifiable account — set it up before expecting signups to work at all, not just password reset. View-count deduplication is a first-party cookie (24h sliding window), not a durable per-visitor record — clearing cookies, private browsing, or switching devices all count as a new view; that's a deliberate tradeoff to avoid storing IP addresses. "Now playing" search depends on Apple's public iTunes Search API being reachable — no API key needed, but also nothing to configure if it's ever down; search just fails gracefully and existing selections keep working.
