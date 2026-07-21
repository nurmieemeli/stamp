import Link from "next/link";
import { DeviceFrame } from "@/components/DeviceFrame";
import { StampBadge } from "@/components/StampBadge";
import { IndexLink } from "@/components/IndexLink";
import { NowSpinning } from "@/components/NowSpinning";
import type { ProfileData } from "@/lib/types";

const ROTATIONS = [-6, 4, -2, 5, -3, 3];

export function ProfileView({ profile }: { profile: ProfileData }) {
  return (
    <div className="sheet">
      <header className="masthead-bar">
        <span className="url-chip">stamp.page/{profile.username}</span>
        <div className="meta">
          <span className="meta-item">
            Views <span className="num">{profile.viewCount.toLocaleString()}</span>
          </span>
          <span className="meta-item">
            Est. <span className="num">{profile.joinYear}</span>
          </span>
        </div>
      </header>

      <section className="identity">
        <DeviceFrame
          initial={profile.displayName.charAt(0).toUpperCase() || "?"}
          caption={`Est. ${profile.joinYear}`}
          avatarUrl={profile.avatarUrl}
        />
        <div>
          {profile.eyebrow ? <p className="eyebrow">{profile.eyebrow}</p> : null}
          <h1 className="name">{profile.displayName || profile.username}</h1>
          <p className="handle">@{profile.username}</p>
          {profile.badges.length > 0 ? (
            <div className="stamps">
              {profile.badges.map((badge, i) => (
                <StampBadge key={badge.key} label={badge.label} rotate={ROTATIONS[i % ROTATIONS.length]} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {profile.bio ? <p className="bio">{profile.bio}</p> : null}
      {profile.bioSecondary ? <p className="bio">{profile.bioSecondary}</p> : null}

      <NowSpinning trackTitle={profile.trackTitle} />

      <nav className="index" aria-label="Links">
        {profile.links.length > 0 ? (
          profile.links.map((link, i) => (
            <IndexLink key={link.id} n={i + 1} label={link.label} url={link.url} />
          ))
        ) : (
          <p className="index-empty">No links yet.</p>
        )}
      </nav>

      <footer className="colophon">
        <span>Stamp.page</span>
        <a href="mailto:report@stamp.page?subject=Report%20profile">Report this page</a>
        <Link href="/signup">Claim your handle</Link>
      </footer>
    </div>
  );
}
