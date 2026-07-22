import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

const PAGE_SIZE = 25;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/");

  const { page: pageParam } = await searchParams;
  const totalCount = await db.user.count();
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    omit: { passwordHash: true },
    include: { profile: { include: { badges: { include: { badge: true } } } } },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark">
          Stamp
        </Link>
        <nav>
          <Link href="/admin/invites">Invites</Link>
          <Link href="/dashboard">My page</Link>
        </nav>
      </header>
      <main className="site-main">
        <div className="panel-header-row">
          <h2>Members</h2>
          <Link href="/admin/invites" className="button-ghost button-small">
            Manage invites
          </Link>
        </div>
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
        {totalPages > 1 ? (
          <div className="pagination">
            {page > 1 ? (
              <Link href={`/admin?page=${page - 1}`} className="button-ghost button-small">
                Previous
              </Link>
            ) : (
              <span className="button-ghost button-small is-disabled">Previous</span>
            )}
            <span className="pagination-status">
              Page {page} of {totalPages} &middot; {totalCount} member{totalCount === 1 ? "" : "s"}
            </span>
            {page < totalPages ? (
              <Link href={`/admin?page=${page + 1}`} className="button-ghost button-small">
                Next
              </Link>
            ) : (
              <span className="button-ghost button-small is-disabled">Next</span>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}
