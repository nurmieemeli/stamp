import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";
import { generateInviteCode } from "../lib/invite-code";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const db = new PrismaClient({ adapter });

const BADGES = [
  { key: "founding", label: "Founding Member" },
  { key: "verified", label: "Verified" },
  { key: "supporter", label: "Supporter" },
  { key: "early", label: "Early Adopter" },
];

async function main() {
  for (const badge of BADGES) {
    await db.badge.upsert({
      where: { key: badge.key },
      update: { label: badge.label },
      create: badge,
    });
  }

  // Signup is invite-only, so a brand-new deployment has no way to create
  // its first account without a bootstrap code — mint one if none exist yet.
  // Re-running the seed is a no-op once at least one code exists.
  const inviteCount = await db.inviteCode.count();
  if (inviteCount === 0) {
    const code = generateInviteCode();
    await db.inviteCode.create({ data: { code, createdByEmail: "seed" } });
    console.log("\nNo invite codes existed yet — created a bootstrap code for your first signup:");
    console.log(`  ${code}\n`);
    console.log("Generate more from /admin/invites once you're logged in.\n");
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
