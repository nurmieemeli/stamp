import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { AdminInviteGenerator } from "@/components/AdminInviteGenerator";
import { AdminInviteDelete } from "@/components/AdminInviteDelete";

export default async function AdminInvitesPage() {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/");

  const invites = await db.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { usedByUser: { select: { username: true } } },
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
          <h2>Invites</h2>
        </div>

        <AdminInviteGenerator />

        <div className="panel">
          <p className="panel-title">All codes</p>
          {invites.length === 0 ? (
            <p className="hint">No invite codes yet.</p>
          ) : (
            invites.map((invite) => (
              <div className="invite-row" key={invite.id}>
                <span className="code">{invite.code}</span>
                <span className="meta">
                  {invite.usedAt
                    ? `Used by ${invite.usedByUser ? `@${invite.usedByUser.username}` : "a deleted account"}`
                    : `Created ${invite.createdAt.toLocaleDateString()} by ${invite.createdByEmail}`}
                </span>
                <span className={`invite-status${invite.usedAt ? " used" : ""}`}>
                  {invite.usedAt ? "Used" : "Available"}
                </span>
                {!invite.usedAt ? <AdminInviteDelete id={invite.id} /> : null}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
