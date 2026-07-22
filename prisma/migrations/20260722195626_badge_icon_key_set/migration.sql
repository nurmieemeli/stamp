-- RedefineTables
-- Badge.icon switches from freeform text (emoji/symbol) to a key into a
-- curated icon set (lib/badge-icons.ts) — remaps the old literal "✓"
-- default to the new "check" key so existing badges keep rendering the
-- same checkmark, and updates the column default to match.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6FCF7F',
    "icon" TEXT NOT NULL DEFAULT 'check'
);
INSERT INTO "new_Badge" ("id", "key", "label", "color", "icon")
SELECT "id", "key", "label", "color", CASE WHEN "icon" = '✓' THEN 'check' ELSE "icon" END
FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
