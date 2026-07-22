-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "bioSecondary" TEXT NOT NULL DEFAULT '',
    "trackTitle" TEXT NOT NULL DEFAULT '',
    "trackArtist" TEXT NOT NULL DEFAULT '',
    "trackPreviewUrl" TEXT NOT NULL DEFAULT '',
    "trackArtworkUrl" TEXT NOT NULL DEFAULT '',
    "trackUrl" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT NOT NULL DEFAULT '',
    "palette" TEXT NOT NULL DEFAULT 'amber',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("avatarUrl", "bio", "bioSecondary", "displayName", "eyebrow", "id", "palette", "trackTitle", "userId", "viewCount") SELECT "avatarUrl", "bio", "bioSecondary", "displayName", "eyebrow", "id", "palette", "trackTitle", "userId", "viewCount" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
