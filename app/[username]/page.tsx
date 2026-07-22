import type { Metadata } from "next";
import { cache } from "react";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProfileView } from "@/components/ProfileView";
import { getPlatformLabel, resolveLinkUrl, displayUrl } from "@/lib/platforms";
import { getPalette } from "@/lib/palettes";
import type { ProfileData } from "@/lib/types";

type Params = { username: string };

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
    description: user.profile.bio || `${user.username}'s page on Stamp.`,
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  const user = await loadProfile(username);
  if (!user || !user.profile) notFound();

  const profile = user.profile;

  // Count the view without making every visitor wait on a SQLite write.
  after(async () => {
    await db.profile.update({
      where: { id: profile.id },
      data: { viewCount: { increment: 1 } },
    });
  });

  const profileData: ProfileData = {
    username: user.username,
    displayName: profile.displayName,
    eyebrow: profile.eyebrow,
    bio: profile.bio,
    bioSecondary: profile.bioSecondary,
    trackTitle: profile.trackTitle,
    avatarUrl: profile.avatarUrl,
    paletteKey: profile.palette,
    viewCount: profile.viewCount + 1,
    joinYear: user.createdAt.getFullYear(),
    badges: profile.badges.map((pb) => ({ key: pb.badge.key, label: pb.badge.label })),
    links: profile.links.map((l) => {
      const url = resolveLinkUrl(l.platform, l.value);
      return { id: l.id, platform: l.platform, label: getPlatformLabel(l.platform), sub: displayUrl(url), url };
    }),
  };

  const pageBg = getPalette(profile.palette).pageBg;

  return (
    <div className="profile-page" style={{ background: pageBg }}>
      <ProfileView profile={profileData} />
    </div>
  );
}
