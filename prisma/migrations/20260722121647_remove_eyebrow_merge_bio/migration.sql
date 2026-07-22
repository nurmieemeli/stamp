-- RedefineTables
-- Drops Profile.eyebrow entirely, and merges Profile.bioSecondary into
-- Profile.bio (joined by a newline) before dropping bioSecondary, so
-- existing two-line bios keep both lines instead of losing the second one.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_Profile" ("id", "userId", "displayName", "bio", "trackTitle", "trackArtist", "trackPreviewUrl", "trackArtworkUrl", "trackUrl", "avatarUrl", "palette", "viewCount")
SELECT
    "id",
    "userId",
    "displayName",
    CASE
        WHEN "bioSecondary" = '' THEN "bio"
        WHEN "bio" = '' THEN "bioSecondary"
        ELSE "bio" || char(10) || "bioSecondary"
    END,
    "trackTitle",
    "trackArtist",
    "trackPreviewUrl",
    "trackArtworkUrl",
    "trackUrl",
    "avatarUrl",
    "palette",
    "viewCount"
FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
