"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { generateInviteCode } from "@/lib/invite-code";
import { Prisma } from "@/app/generated/prisma/client";

const MAX_GENERATE_ATTEMPTS = 5;

export type GenerateInviteState = { error: string; code: string | null };

export async function generateInviteCodeAction(): Promise<GenerateInviteState> {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized.", code: null };
  }
  const createdByEmail = session.user.email;

  for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
    const code = generateInviteCode();
    try {
      await db.inviteCode.create({
        data: { code, createdByEmail },
      });
      revalidatePath("/admin/invites");
      return { error: "", code };
    } catch (err) {
      // Collision on the unique code — astronomically unlikely, but retry
      // with a freshly generated code rather than failing outright.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }

  return { error: "Couldn't generate a unique code. Try again.", code: null };
}

export type DeleteInviteState = { error: string };

export async function deleteInviteCodeAction(id: string): Promise<DeleteInviteState> {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return { error: "Not authorized." };
  }

  const invite = await db.inviteCode.findUnique({ where: { id } });
  if (!invite) {
    return { error: "Invite code not found." };
  }
  if (invite.usedAt) {
    return { error: "Can't delete a code that's already been used." };
  }

  await db.inviteCode.delete({ where: { id } });
  revalidatePath("/admin/invites");

  return { error: "" };
}
