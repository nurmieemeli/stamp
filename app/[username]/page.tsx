import type { Metadata } from "next";
import { cache } from "react";
import { after } from "next/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProfileView } from "@/components/ProfileView";
import { getPlatformLabel, resolveLinkUrl, displayUrl } from "@/lib/platforms";
import { getPalette } from "@/lib/palettes";
import type { ProfileData } from "@/lib/types";

type Params = { username: string };

// How long a "seen this profile" cookie counts as still-the-same-visit for
// view-count purposes — refreshing (or browsing away and back) within this
// window doesn't add another view.
const SEEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

const loadProfile = cache(async (username: string) => {
  return db.user.findUnique({
    where: { username },
    omit: { passwordHash: true },
    include: {
      profile: {
        include: {
          links: { orderBy: { order: "asc" } },
          badges: { include: { badge: true } },
        },
      },
    },
  });
});

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  const user = await loadProfile(username);
  if (!user || !user.profile) {
    return { title: "Not found · Stamp" };
  }
  return {
    title: `${user.profile.displayName || user.username} · stamp.rip`,
    description: user.profile.bio.split("\n")[0] || `${user.username}'s page on Stamp.`,
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  const user = await loadProfile(username);
  if (!user || !user.profile) notFound();

  const profile = user.profile;

  // A visitor who already has this cookie was counted within the last 24h —
  // refreshing or re-visiting shouldn't inflate the count. The cookie itself
  // is (re)set client-side below, since Server Components can only read
  // cookies, not write them.
  const seenCookieName = `stamp_seen_${profile.id}`;
  const alreadySeen = (await cookies()).has(seenCookieName);

  // Count the view without making every visitor wait on a SQLite write.
  if (!alreadySeen) {
    after(async () => {
      await db.profile.update({
        where: { id: profile.id },
        data: { viewCount: { increment: 1 } },
      });
    });
  }

  const profileData: ProfileData = {
    username: user.username,
    displayName: profile.displayName,
    bio: profile.bio,
    trackTitle: profile.trackTitle,
    trackArtist: profile.trackArtist,
    trackPreviewUrl: profile.trackPreviewUrl,
    trackArtworkUrl: profile.trackArtworkUrl,
    trackUrl: profile.trackUrl,
    avatarUrl: profile.avatarUrl,
    paletteKey: profile.palette,
    customAccent: profile.customAccent,
    isPro: user.isPro,
    viewCount: alreadySeen ? profile.viewCount : profile.viewCount + 1,
    badges: profile.badges.map((pb) => ({
      key: pb.badge.key,
      label: pb.badge.label,
      color: pb.badge.color,
      icon: pb.badge.icon,
    })),
    links: profile.links.map((l) => {
      const url = resolveLinkUrl(l.platform, l.value);
      return { id: l.id, platform: l.platform, label: getPlatformLabel(l.platform), sub: displayUrl(url), url };
    }),
  };

  const pageBg = getPalette(profile.palette).pageBg;

  return (
    <div className="profile-page" style={{ background: pageBg }}>
      <ProfileView profile={profileData} />
      <script
        // Refreshes the seen-cookie's expiry on every visit (sliding 24h
        // window) regardless of whether this request counted as a new view.
        dangerouslySetInnerHTML={{
          __html: `document.cookie = ${JSON.stringify(
            `${seenCookieName}=1; max-age=${SEEN_COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`,
          )};`,
        }}
      />
    </div>
  );
}
