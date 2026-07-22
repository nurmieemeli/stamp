# Deploying Stamp to a dedicated server

This assumes a Debian/Ubuntu server with nginx already installed, root/sudo SSH access, and a domain name whose DNS A record already points at the server's IP (needed for TLS in step 9). Commands are for `apt` — adjust if your distro differs.

This deploy model uses local disk for everything (SQLite database, uploaded avatars), so it only works on a host with a persistent, writable filesystem — which a dedicated server is. It will not work unmodified on a serverless/ephemeral platform.

---

## 1. Update the server and install prerequisites

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git build-essential python3 curl ufw
```

`build-essential`/`python3` are there so native modules (`better-sqlite3`, `sharp`) can compile from source if a prebuilt binary isn't available for your server's architecture.

## 2. Install Node.js

Next.js itself only requires Node ≥ 20.9, but one of Prisma's sub-packages (`@prisma/streams-local`) wants ≥ 22 — installing 20.x works but prints an `EBADENGINE` warning on every `npm ci`. Install Node 22 LTS via NodeSource to avoid that:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # confirm v22.x or newer
```

## 3. Create a dedicated user to run the app (recommended)

Don't run a public-facing Node process as root.

```bash
sudo adduser --disabled-password --gecos "" stamp
sudo su - stamp
```

Run the rest of the steps as this `stamp` user unless noted otherwise.

## 4. Get the code onto the server

**Option A — git (recommended, makes future updates a one-liner):**

```bash
git clone <your-repo-url> ~/stamp
cd ~/stamp
```

**Option B — rsync from your local machine** (if you don't have a git remote set up yet), run this from your local machine, not the server:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude dev.db --exclude .env \
  ./ stamp@your-server:~/stamp/
```

## 5. Install dependencies

```bash
npm ci
```

`npm ci` uses `package-lock.json` for a reproducible install (same versions you tested locally). This also runs `prisma generate` automatically via a `postinstall` hook — if you ever see `Module not found: Can't resolve '@/app/generated/prisma/client'`, that step didn't run (e.g. `npm ci --ignore-scripts`); fix with `npx prisma generate`.

## 6. Configure environment variables

```bash
cd ~/stamp
nano .env
```

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="paste output of: openssl rand -base64 32"
ADMIN_EMAILS="you@example.com"
```

Generate the secret first:

```bash
openssl rand -base64 32
```

**Don't reuse the `AUTH_SECRET` from local development** — it's a shared dev value, not a real secret.

## 7. Set up the database

```bash
npx prisma migrate deploy    # applies migrations, no prompts, no shadow DB
npx tsx prisma/seed.ts       # seeds the badge catalog (Founding Member, Verified, etc.)
```

## 8. Build for production

```bash
npm run build
```

## 9. Check file permissions

The `stamp` user needs write access to where the SQLite file and avatar uploads live:

```bash
mkdir -p public/uploads/avatars
chmod -R u+rwX public/uploads
```

If `dev.db` already exists from the migrate step above, it's owned by `stamp` already (you ran the commands as that user) — nothing extra needed.

## 10. Run it under PM2 (keeps it alive across crashes and reboots)

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # prints a sudo command — copy/paste and run it as your admin user
```

Useful commands going forward:

```bash
pm2 status
pm2 logs stamp
pm2 restart stamp
```

## 11. Configure nginx as a reverse proxy

As your admin (sudo) user, not the `stamp` user:

```bash
sudo cp ~stamp/stamp/deploy/nginx.conf.example /etc/nginx/sites-available/stamp
sudo nano /etc/nginx/sites-available/stamp   # replace your-domain.com with your real domain
sudo ln -s /etc/nginx/sites-available/stamp /etc/nginx/sites-enabled/
sudo nginx -t                                # test the config before reloading
sudo systemctl reload nginx
```

At this point `http://your-domain.com` should load the site over plain HTTP — but **auth will not work yet** (see next step).

## 12. Get HTTPS (required before testing login/signup)

NextAuth marks its session cookie `Secure` in production, so it's silently dropped over plain HTTP — you'll be able to submit the login form but never actually get signed in.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot rewrites the nginx config to add the HTTPS block and redirect HTTP → HTTPS automatically. It also sets up auto-renewal (verify with `sudo certbot renew --dry-run`).

## 13. Lock down the firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # opens 80 and 443
sudo ufw enable
```

Port 3000 (where Next.js actually listens) is only reachable via `127.0.0.1` through the nginx proxy config — don't open it externally.

## 14. Verify the deployment

- [ ] `https://your-domain.com` loads the landing page, padlock shows valid HTTPS
- [ ] Sign up for a new account, confirm you land on `/dashboard` logged in
- [ ] Log out, log back in
- [ ] Edit profile fields and links, save, confirm the public `/username` page reflects them
- [ ] Upload an avatar, confirm it shows on both the dashboard preview and the public page
- [ ] Visit `/admin` with an account whose email is in `ADMIN_EMAILS`, confirm access; confirm a non-admin account is redirected away
- [ ] Reload the public profile page a couple of times, confirm the view count climbs
- [ ] `pm2 logs stamp` and check nginx's error log (`sudo tail -f /var/log/nginx/error.log`) for anything unexpected during the above

## 15. Redeploying after code changes

```bash
cd ~/stamp
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart stamp
```

## 16. Back up the database and uploads

There's no managed persistence here — you're responsible for backups. A simple daily cron job:

```bash
crontab -e
```

```cron
0 3 * * * cp /home/stamp/stamp/dev.db /home/stamp/backups/dev-$(date +\%F).db && tar -czf /home/stamp/backups/uploads-$(date +\%F).tar.gz -C /home/stamp/stamp/public uploads
```

(Create `/home/stamp/backups` first, and prune old backups periodically so disk doesn't fill up.)

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| nginx shows **502 Bad Gateway** | The Next.js process isn't running or isn't on port 3000 — check `pm2 status` / `pm2 logs stamp` |
| Avatar upload fails with a generic network error, no app-level message | nginx's `client_max_body_size` isn't set high enough — confirm it's in the active config (`10M` in `deploy/nginx.conf.example`) |
| Login form submits but you're never actually signed in | Site is being served over HTTP, not HTTPS — the session cookie requires `Secure`. Finish step 12 |
| `UntrustedHost` error in `pm2 logs stamp` | Shouldn't happen — `trustHost: true` is already set in `lib/auth.ts` for exactly this. If you see it, confirm you're running the code from this repo, not an older checkout |
| `EACCES: permission denied` writing to `dev.db` or `public/uploads` | The process user doesn't own those paths — re-check step 9, or that PM2 is running as the `stamp` user (`pm2 status` shows the user) |
| Port 3000 already in use | Something else is bound to it — `sudo lsof -i :3000`, or change `PORT` in `ecosystem.config.js` and update the nginx `proxy_pass` to match |
| `npm run build` fails with `Module not found: Can't resolve '@/app/generated/prisma/client'` | The generated Prisma client is missing — it's gitignored on purpose (it's build output, not source). `npm ci` regenerates it automatically via `postinstall`; if that got skipped, run `npx prisma generate` directly |
