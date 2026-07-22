import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Claim your page</h1>
        <p className="lede">stamp.rip/yourname — yours in under a minute.</p>
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
        <p className="switch">
          Already have a page? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
