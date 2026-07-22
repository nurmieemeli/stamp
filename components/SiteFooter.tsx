export function SiteFooter() {
  const discordUrl = process.env.DISCORD_INVITE_URL;

  return (
    <footer className="site-footer">
      {discordUrl ? (
        <span className="site-footer-meta">
          Need support?{" "}
          <a href={discordUrl} target="_blank" rel="noopener noreferrer">
            Join our discord!
          </a>
        </span>
      ) : null}
    </footer>
  );
}
