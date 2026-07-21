import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    omit: { passwordHash: true },
    include: { profile: { include: { badges: { include: { badge: true } } } } },
  });

  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark">
          Stamp
        </Link>
        <nav>
          <Link href="/dashboard">My page</Link>
        </nav>
      </header>
      <main className="site-main">
        <h2>Members</h2>
        <div className="panel">
          {users.length === 0 ? (
            <p className="hint">No members yet.</p>
          ) : (
            users.map((u) => (
              <Link key={u.id} href={`/admin/${u.username}`} className="admin-row">
                <span className="admin-row-name">{u.profile?.displayName || u.username}</span>
                <span className="admin-row-handle">@{u.username}</span>
                <span className="admin-row-badges">
                  {u.profile && u.profile.badges.length > 0
                    ? u.profile.badges.map((b) => b.badge.label).join(" · ")
                    : "No badges"}
                </span>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}
