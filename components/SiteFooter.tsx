import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Link href="/" className="wordmark">
        Stamp
      </Link>
      <span className="site-footer-meta">
        &copy; {year} Stamp &middot; <a href="mailto:report@stamp.rip">report@stamp.rip</a>
      </span>
    </footer>
  );
}
