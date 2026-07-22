import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { VerifyEmailForm } from "@/components/VerifyEmailForm";
import { signOutAction } from "@/app/dashboard/actions";

export default async function VerifyEmailPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id }, omit: { passwordHash: true } });
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) redirect("/dashboard");

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p className="lede">
          We sent a 6-digit code to <b>{user.email}</b>. Enter it below to finish setting up your page.
        </p>
        <VerifyEmailForm />
        <form action={signOutAction} style={{ marginTop: 18 }}>
          <button className="button-ghost button-small" type="submit">
            Not you? Log out
          </button>
        </form>
      </div>
    </div>
  );
}
