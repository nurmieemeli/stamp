"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export type AdminSaveState = { error: string; savedAt: number | null };

export async function setUserBadgesAction(username: string, badgeKeys: string[]): Promise<AdminSaveState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized.", savedAt: null };
  }

  const user = await db.user.findUnique({
    where: { username },
    omit: { passwordHash: true },
    include: { profile: true },
  });
  if (!user || !user.profile) {
    return { error: "Member not found.", savedAt: null };
  }

  const badges = await db.badge.findMany({ where: { key: { in: badgeKeys } } });
  const profileId = user.profile.id;

  await db.$transaction([
    db.profileBadge.deleteMany({ where: { profileId } }),
    ...(badges.length > 0
      ? [db.profileBadge.createMany({ data: badges.map((b) => ({ profileId, badgeId: b.id })) })]
      : []),
  ]);

  revalidatePath(`/${username}`);
  revalidatePath(`/admin/${username}`);
  revalidatePath("/admin");

  return { error: "", savedAt: Date.now() };
}
