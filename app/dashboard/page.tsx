import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { DashboardEditor } from "@/components/DashboardEditor";
import { signOutAction } from "./actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, profile] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, omit: { passwordHash: true } }),
    db.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        links: { orderBy: { order: "asc" } },
        badges: { include: { badge: true } },
      },
    }),
  ]);

  if (!user || !profile) redirect("/login");
  if (!user.emailVerifiedAt) redirect("/verify-email");

  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark">
          Stamp
        </Link>
        <nav>
          {isAdminEmail(user.email) ? <Link href="/admin">Admin</Link> : null}
          <a href={`/${user.username}`} target="_blank" rel="noopener noreferrer">
            View live page
          </a>
          <form action={signOutAction}>
            <button className="button-ghost button-small" type="submit">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <main className="site-main">
        <h2>Edit your page</h2>
        <DashboardEditor
          username={user.username}
          initialProfile={{
            displayName: profile.displayName,
            bio: profile.bio,
            trackTitle: profile.trackTitle,
            trackArtist: profile.trackArtist,
            trackPreviewUrl: profile.trackPreviewUrl,
            trackArtworkUrl: profile.trackArtworkUrl,
            trackUrl: profile.trackUrl,
            avatarUrl: profile.avatarUrl,
            palette: profile.palette,
            viewCount: profile.viewCount,
            links: profile.links.map((l) => ({
              id: l.id,
              platform: l.platform,
              value: l.value,
            })),
            badges: profile.badges.map((b) => ({
              key: b.badge.key,
              label: b.badge.label,
              color: b.badge.color,
              icon: b.badge.icon,
            })),
          }}
        />
      </main>
    </>
  );
}
