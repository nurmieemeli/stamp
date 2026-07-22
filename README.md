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

# Required for admin-triggered password reset emails to actually send.
# Get an API key at resend.com; RESEND_FROM_EMAIL needs a domain verified
# there (falls back to Resend's shared onboarding@resend.dev sender if unset,
# which is fine for testing but shouldn't be used in production).
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Stamp <noreply@stamp.rip>"
```

Set up the database:

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts   # seeds the badge catalog
```

Run the dev server:

```bash
npm run dev
```

## Project shape

- `/` — landing page
- `/signup`, `/login` — credentials auth
- `/dashboard` — the logged-in member's editor (identity, links, badges are read-only here)
- `/[username]` — public profile page
- `/admin`, `/admin/[username]` — member account/profile editing, badge grants, and triggering password reset emails, gated by `ADMIN_EMAILS`
- `/reset-password/[token]` — where a member lands after clicking an admin-triggered reset email; sets a new password
- `lib/platforms.ts` — the fixed catalog of link platforms and how each one's URL is built from a handle
- `lib/palettes.ts` — the five color palettes (Amber, Nord, Dracula, Forest, Paper) members pick for their public page; applied as CSS custom properties scoped to the profile `.window`, independent of the app's own fixed dark chrome
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
npx tsx prisma/seed.ts
npm run build
pm2 start ecosystem.config.js && pm2 save
# copy deploy/nginx.conf.example into place, then:
sudo certbot --nginx -d stamp.rip
```

Auth won't work without HTTPS (the session cookie is marked `Secure` in production), so get the certificate before testing login.

## Known gaps

This is an early-stage build. Not yet handled: audio file uploads (the "now spinning" field is text-only), OAuth login, self-service ("forgot password") reset — resets are admin-triggered only, an owner-facing analytics dashboard beyond the raw view count, and pagination on `/admin`'s member list. Rate limiting on auth is a simple in-memory limiter (`lib/rate-limit.ts`) — fine for a single process, not for a multi-instance deployment. Avatar/database storage is local disk — back it up yourself; there's no managed persistence. Password reset tokens are single-use and expire after an hour but existing logged-in sessions aren't revoked on reset (JWT sessions are stateless, so there's nothing server-side to invalidate).
