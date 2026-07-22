import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { AdminBadgeCreate } from "@/components/AdminBadgeCreate";
import { AdminBadgeRow } from "@/components/AdminBadgeRow";

export default async function AdminBadgesPage() {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/");

  const badges = await db.badge.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { profiles: true } } },
  });

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
        <div className="panel-header-row">
          <h2>Badges</h2>
        </div>

        <AdminBadgeCreate />

        <div className="panel">
          <p className="panel-title">All badges</p>
          {badges.length === 0 ? (
            <p className="hint">No badges yet.</p>
          ) : (
            badges.map((badge) => (
              <AdminBadgeRow
                key={badge.id}
                id={badge.id}
                badgeKey={badge.key}
                initialLabel={badge.label}
                memberCount={badge._count.profiles}
              />
            ))
          )}
        </div>
      </main>
    </>
  );
}
