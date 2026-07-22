"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { validateCleanText, slugify } from "@/lib/validation";
import { Prisma } from "@/app/generated/prisma/client";

const MAX_KEY_ATTEMPTS = 20;

export type BadgeActionState = { error: string };

export async function createBadgeAction(label: string): Promise<BadgeActionState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized." };
  }

  const trimmed = label.trim();
  if (!trimmed) {
    return { error: "Badge label can't be empty." };
  }
  const textError = validateCleanText("Badge label", trimmed);
  if (textError) return { error: textError };

  const baseKey = slugify(trimmed);
  if (!baseKey) {
    return { error: "That label needs at least one letter or number." };
  }

  for (let attempt = 0; attempt < MAX_KEY_ATTEMPTS; attempt++) {
    const key = attempt === 0 ? baseKey : `${baseKey}-${attempt + 1}`;
    try {
      await db.badge.create({ data: { key, label: trimmed } });
      revalidatePath("/admin/badges");
      return { error: "" };
    } catch (err) {
      // Collision on the unique key (e.g. two labels that slugify the same) —
      // retry with a numbered suffix rather than failing outright.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }

  return { error: "Couldn't generate a unique badge key. Try a different label." };
}

export async function updateBadgeLabelAction(id: string, label: string): Promise<BadgeActionState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized." };
  }

  const trimmed = label.trim();
  if (!trimmed) {
    return { error: "Badge label can't be empty." };
  }
  const textError = validateCleanText("Badge label", trimmed);
  if (textError) return { error: textError };

  const badge = await db.badge.findUnique({ where: { id } });
  if (!badge) {
    return { error: "Badge not found." };
  }

  await db.badge.update({ where: { id }, data: { label: trimmed } });
  revalidatePath("/admin/badges");
  revalidatePath("/admin");

  return { error: "" };
}

export async function deleteBadgeAction(id: string): Promise<BadgeActionState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized." };
  }

  const badge = await db.badge.findUnique({ where: { id } });
  if (!badge) {
    return { error: "Badge not found." };
  }

  // Cascades to ProfileBadge via the FK constraint in the schema — any
  // member currently wearing this badge just loses it.
  await db.badge.delete({ where: { id } });
  revalidatePath("/admin/badges");
  revalidatePath("/admin");

  return { error: "" };
}
