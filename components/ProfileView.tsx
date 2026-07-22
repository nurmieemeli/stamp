import type { CSSProperties } from "react";
import Link from "next/link";
import { DeviceFrame } from "@/components/DeviceFrame";
import { StampBadge } from "@/components/StampBadge";
import { IndexLink } from "@/components/IndexLink";
import { NowSpinning } from "@/components/NowSpinning";
import { getPalette, paletteCssVars } from "@/lib/palettes";
import type { ProfileData } from "@/lib/types";

export function ProfileView({ profile }: { profile: ProfileData }) {
  const palette = getPalette(profile.paletteKey);
  const style = paletteCssVars(palette.tokens) as CSSProperties;

  return (
    <div className="window" style={style}>
      <div className="titlebar">
        <div className="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="path">
          visiting <b>{profile.username}</b>
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
            <p className="id-role">
              {profile.eyebrow ? `${profile.eyebrow} · ` : ""}since {profile.joinYear}
            </p>
          </div>
        </section>

        {profile.bio ? <p className="bio">{profile.bio}</p> : null}
        {profile.bioSecondary ? <p className="bio">{profile.bioSecondary}</p> : null}

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

        {profile.badges.length > 0 ? (
          <div className="stamps">
            {profile.badges.map((badge) => (
              <StampBadge key={badge.key} label={badge.label} />
            ))}
          </div>
        ) : null}
      </div>

      <footer className="statusbar">
        <span className="statusbar-path">stamp://{profile.username}</span>
        <a href="mailto:report@stamp.rip?subject=Report%20profile">report</a>
        <Link href="/signup">claim your handle</Link>
        <span className="cursor" aria-hidden="true"></span>
      </footer>
    </div>
  );
}
