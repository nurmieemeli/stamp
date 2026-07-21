import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

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
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
