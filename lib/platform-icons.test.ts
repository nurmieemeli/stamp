import { describe, expect, it } from "vitest";
import { PLATFORMS } from "./platforms";
import { SOCIAL_ICON_PATHS } from "./platform-icons";

// PlatformIcon.tsx renders these three from hand-built markup instead of a
// brand path — LinkedIn's mark isn't available upstream, email/website
// aren't brands at all.
const HANDLED_WITHOUT_A_PATH = new Set(["linkedin", "email", "website"]);

describe("SOCIAL_ICON_PATHS", () => {
  it("has a non-empty path for every platform that isn't handled separately", () => {
    for (const platform of PLATFORMS) {
      if (HANDLED_WITHOUT_A_PATH.has(platform.key)) continue;
      expect(SOCIAL_ICON_PATHS[platform.key], `missing icon path for "${platform.key}"`).toBeTruthy();
    }
  });

  it("doesn't carry paths for platforms that no longer exist", () => {
    const knownKeys = new Set(PLATFORMS.map((p) => p.key));
    for (const key of Object.keys(SOCIAL_ICON_PATHS)) {
      expect(knownKeys.has(key), `SOCIAL_ICON_PATHS has an orphaned key "${key}"`).toBe(true);
    }
  });
});
