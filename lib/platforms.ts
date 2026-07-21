export type PlatformMode = "handle" | "url" | "email";

export type Platform = {
  key: string;
  label: string;
  mode: PlatformMode;
  placeholder: string;
  handlePrefix?: string;
  handleSuffix?: string;
  buildUrl?: (handle: string) => string;
};

export const PLATFORMS: Platform[] = [
  {
    key: "instagram",
    label: "Instagram",
    mode: "handle",
    handlePrefix: "instagram.com/",
    placeholder: "yourname",
    buildUrl: (h) => `https://instagram.com/${h}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    mode: "handle",
    handlePrefix: "tiktok.com/@",
    placeholder: "yourname",
    buildUrl: (h) => `https://tiktok.com/@${h}`,
  },
  {
    key: "x",
    label: "X (Twitter)",
    mode: "handle",
    handlePrefix: "x.com/",
    placeholder: "yourname",
    buildUrl: (h) => `https://x.com/${h}`,
  },
  {
    key: "youtube",
    label: "YouTube",
    mode: "handle",
    handlePrefix: "youtube.com/@",
    placeholder: "yourname",
    buildUrl: (h) => `https://youtube.com/@${h}`,
  },
  {
    key: "twitch",
    label: "Twitch",
    mode: "handle",
    handlePrefix: "twitch.tv/",
    placeholder: "yourname",
    buildUrl: (h) => `https://twitch.tv/${h}`,
  },
  {
    key: "discord",
    label: "Discord",
    mode: "handle",
    handlePrefix: "discord.gg/",
    placeholder: "invite code",
    buildUrl: (h) => `https://discord.gg/${h}`,
  },
  {
    key: "spotify",
    label: "Spotify",
    mode: "handle",
    handlePrefix: "open.spotify.com/artist/",
    placeholder: "artist ID",
    buildUrl: (h) => `https://open.spotify.com/artist/${h}`,
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    mode: "handle",
    handlePrefix: "soundcloud.com/",
    placeholder: "yourname",
    buildUrl: (h) => `https://soundcloud.com/${h}`,
  },
  {
    key: "bandcamp",
    label: "Bandcamp",
    mode: "handle",
    handleSuffix: ".bandcamp.com",
    placeholder: "yourname",
    buildUrl: (h) => `https://${h}.bandcamp.com`,
  },
  {
    key: "github",
    label: "GitHub",
    mode: "handle",
    handlePrefix: "github.com/",
    placeholder: "yourname",
    buildUrl: (h) => `https://github.com/${h}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    mode: "handle",
    handlePrefix: "linkedin.com/in/",
    placeholder: "yourname",
    buildUrl: (h) => `https://linkedin.com/in/${h}`,
  },
  {
    key: "threads",
    label: "Threads",
    mode: "handle",
    handlePrefix: "threads.net/@",
    placeholder: "yourname",
    buildUrl: (h) => `https://threads.net/@${h}`,
  },
  {
    key: "email",
    label: "Email",
    mode: "email",
    placeholder: "you@example.com",
  },
  {
    key: "website",
    label: "Website",
    mode: "url",
    placeholder: "https://yoursite.com",
  },
];

const PLATFORM_BY_KEY = new Map(PLATFORMS.map((p) => [p.key, p]));

export function getPlatform(key: string): Platform | undefined {
  return PLATFORM_BY_KEY.get(key);
}

export function getPlatformLabel(key: string): string {
  return PLATFORM_BY_KEY.get(key)?.label ?? key;
}

export function isKnownPlatform(key: string): boolean {
  return PLATFORM_BY_KEY.has(key);
}

export function resolveLinkUrl(platformKey: string, rawValue: string): string {
  const value = rawValue.trim();
  const platform = getPlatform(platformKey);
  if (!platform || !value) return value;

  if (platform.mode === "url") {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }
  if (platform.mode === "email") {
    return /^mailto:/i.test(value) ? value : `mailto:${value}`;
  }

  // Handle mode: always route through buildUrl so the destination can never
  // diverge from the platform the link claims to be (no arbitrary URL passthrough).
  const handle = value.replace(/^@+/, "").replace(/^https?:\/\/\S+$/i, "");
  return platform.buildUrl ? platform.buildUrl(handle) : value;
}
