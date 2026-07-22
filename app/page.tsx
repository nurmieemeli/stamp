import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/dashboard/actions";

export default async function LandingPage() {
  const session = await auth();

  return (
    <>
      <header className="site-header">
        <span className="wordmark">Stamp</span>
        <nav>
          {session?.user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <form action={signOutAction}>
                <button className="button-ghost button-small" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Claim your page</Link>
            </>
          )}
        </nav>
      </header>
      <main className="site-main">
        <section className="hero">
          <p className="eyebrow">Link-in-bio, stripped down</p>
          <h1>Your links. No noise.</h1>
          <p>
            Stamp is a bio-link page for people who want precision, not chaos — one clean URL, a
            real link list instead of a wall of icons, and a color palette you pick instead of one
            that&rsquo;s picked for you.
          </p>
          <form className="actions" action="/signup" method="get">
            <div className="claim">
              <span>stamp.rip/</span>
              <input
                name="u"
                placeholder="yourname"
                maxLength={20}
                aria-label="Choose your handle"
                autoComplete="off"
              />
            </div>
            <button className="button" type="submit">
              Claim it
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
