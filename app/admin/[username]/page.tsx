import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { AdminBadgeEditor } from "@/components/AdminBadgeEditor";

type Params = { username: string };

export default async function AdminUserPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/");

  const user = await db.user.findUnique({
    where: { username },
    omit: { passwordHash: true },
    include: { profile: { include: { badges: { include: { badge: true } } } } },
  });
  if (!user || !user.profile) notFound();

  const allBadges = await db.badge.findMany({ orderBy: { label: "asc" } });

  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark">
          Stamp
        </Link>
        <nav>
          <Link href="/admin">All members</Link>
        </nav>
      </header>
      <main className="site-main">
        <h2>{user.profile.displayName || user.username}</h2>
        <p className="hint" style={{ marginBottom: 24 }}>
          @{user.username}
        </p>
        <AdminBadgeEditor
          username={user.username}
          allBadges={allBadges.map((b) => ({ key: b.key, label: b.label }))}
          initialBadgeKeys={user.profile.badges.map((b) => b.badge.key)}
        />
      </main>
    </>
  );
}
