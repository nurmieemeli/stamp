import type { CSSProperties } from "react";
import Link from "next/link";
import { DeviceFrame } from "@/components/DeviceFrame";
import { StampBadge } from "@/components/StampBadge";
import { IndexLink } from "@/components/IndexLink";
import { NowSpinning } from "@/components/NowSpinning";
import { getPalette, paletteCssVars } from "@/lib/palettes";
import { contrastInk } from "@/lib/color";
import { isHexColor } from "@/lib/validation";
import type { ProfileData } from "@/lib/types";

export function ProfileView({ profile }: { profile: ProfileData }) {
  const palette = getPalette(profile.paletteKey);
  const vars = paletteCssVars(palette.tokens);

  // Pro-only accent override — replaces just --accent/--accent-ink on top of
  // whichever base palette is selected, everything else stays untouched.
  if (profile.isPro && isHexColor(profile.customAccent)) {
    vars["--accent"] = profile.customAccent;
    vars["--accent-ink"] = contrastInk(profile.customAccent);
  }
  const style = vars as CSSProperties;

  return (
    <div className="window" style={style}>
      <div className="titlebar">
        <div className="path">
          <b>{profile.username}</b>
        </div>
        <div className="live">
          <i></i>
          views {profile.viewCount.toLocaleString()}
        </div>
      </div>

      <div className="window-body">
        <section className="identity">
          <DeviceFrame
            initial={profile.displayName.charAt(0).toUpperCase() || "?"}
            avatarUrl={profile.avatarUrl}
          />
          <div className="identity-meta">
            <p className="id-name">{profile.displayName || profile.username}</p>
            <span className="id-handle">@{profile.username}</span>
          </div>
        </section>

        {profile.badges.length > 0 ? (
          <div className="stamps">
            {profile.badges.map((badge) => (
              <StampBadge key={badge.key} label={badge.label} color={badge.color} icon={badge.icon} />
            ))}
          </div>
        ) : null}

        {profile.bio ? <p className="bio">{profile.bio}</p> : null}

        <NowSpinning
          trackTitle={profile.trackTitle}
          trackArtist={profile.trackArtist}
          trackPreviewUrl={profile.trackPreviewUrl}
          trackArtworkUrl={profile.trackArtworkUrl}
          trackUrl={profile.trackUrl}
        />

        <nav className="index" aria-label="Links">
          <p className="index-head">Links</p>
          {profile.links.length > 0 ? (
            profile.links.map((link, i) => (
              <IndexLink
                key={link.id}
                n={i + 1}
                platform={link.platform}
                label={link.label}
                sub={link.sub}
                url={link.url}
              />
            ))
          ) : (
            <p className="index-empty">No links yet.</p>
          )}
        </nav>
      </div>

      <footer className="statusbar">
        <span className="statusbar-path">
          <b>{profile.username}</b>
        </span>
        <a href="mailto:report@stamp.rip?subject=Report%20profile">report</a>
        {!profile.isPro ? <Link href="/signup">claim your handle</Link> : null}
      </footer>
    </div>
  );
}
