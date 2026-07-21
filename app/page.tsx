import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <header className="site-header">
        <span className="wordmark">Stamp</span>
        <nav>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Claim your page</Link>
        </nav>
      </header>
      <main className="site-main">
        <section className="hero">
          <p className="eyebrow">Link-in-bio, edited down</p>
          <h1>Your links, set in type.</h1>
          <p>
            Stamp is a bio-link page for people who&rsquo;d rather be understated than loud — one
            URL, a numbered list of links, and nothing that autoplays or glows in the dark.
          </p>
          <form className="actions" action="/signup" method="get">
            <div className="claim">
              <span>stamp.page/</span>
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
            <h3>A masthead, not a mixtape</h3>
            <p>Typography does the talking. No flashing GIFs, no cursor trails, no confetti on load.</p>
          </div>
          <div>
            <span className="n">02</span>
            <h3>Stamps, not shiny badges</h3>
            <p>Founding Member, Verified, Supporter — marked like an ink stamp, not a gamer trophy.</p>
          </div>
          <div>
            <span className="n">03</span>
            <h3>An index of links</h3>
            <p>Instagram, Bandcamp, GitHub, and the rest — numbered and listed, not stacked as a wall of icons.</p>
          </div>
          <div>
            <span className="n">04</span>
            <h3>Now spinning, quietly</h3>
            <p>Show what&rsquo;s on repeat. Nothing plays until someone taps it.</p>
          </div>
        </section>
      </main>
    </>
  );
}
