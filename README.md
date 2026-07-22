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
- `/admin`, `/admin/[username]` — badge grants, gated by `ADMIN_EMAILS`
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

This is an early-stage build. Not yet handled: audio file uploads (the "now spinning" field is text-only), OAuth login, an owner-facing analytics dashboard beyond the raw view count, and pagination on `/admin`'s member list. Rate limiting on auth is a simple in-memory limiter (`lib/rate-limit.ts`) — fine for a single process, not for a multi-instance deployment. Avatar/database storage is local disk — back it up yourself; there's no managed persistence.
