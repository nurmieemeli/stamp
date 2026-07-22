import { SOCIAL_ICON_PATHS } from "@/lib/platform-icons";

// LinkedIn's mark isn't in simple-icons (removed upstream) — rather than
// redraw their logo independently, it gets a plain monogram like everything
// else in this app's "not decorated" visual language.
function LinkedInGlyph() {
  return (
    <span className="platform-icon platform-icon-mono" aria-hidden="true">
      in
    </span>
  );
}

function EmailGlyph() {
  return (
    <svg className="platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 7l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WebsiteGlyph() {
  return (
    <svg className="platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "linkedin") return <LinkedInGlyph />;
  if (platform === "email") return <EmailGlyph />;
  if (platform === "website") return <WebsiteGlyph />;

  const path = SOCIAL_ICON_PATHS[platform];
  if (!path) return null;

  return (
    <svg className="platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  );
}
