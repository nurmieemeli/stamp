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

        <section className="feature-grid">
          <div>
            <span className="n">01</span>
            <h3>Monospace, on purpose</h3>
            <p>One typeface for everything — precise and legible, with nothing flashing or trailing your cursor.</p>
          </div>
          <div>
            <span className="n">02</span>
            <h3>Verified, not decorated</h3>
            <p>Founding Member, Verified, Supporter — plain status tags the Stamp team grants, not a shelf of trophies.</p>
          </div>
          <div>
            <span className="n">03</span>
            <h3>A real link list</h3>
            <p>Instagram, Bandcamp, GitHub, and the rest — numbered and listed, not stacked as a wall of icons.</p>
          </div>
          <div>
            <span className="n">04</span>
            <h3>Now playing, quietly</h3>
            <p>Show what&rsquo;s on repeat. Nothing plays until someone taps it.</p>
          </div>
          <div>
            <span className="n">05</span>
            <h3>Five palettes, one you</h3>
            <p>Amber, Nord, Dracula, Forest, or Paper for anyone who wants light. Your page, your colors.</p>
          </div>
        </section>
      </main>
    </>
  );
}
