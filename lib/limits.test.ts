import { describe, expect, it } from "vitest";
import { exceedsLinkCap, FREE_LINK_LIMIT, PRO_LINK_LIMIT } from "./limits";

describe("exceedsLinkCap", () => {
  it("allows a free user under the cap", () => {
    expect(exceedsLinkCap(false, FREE_LINK_LIMIT - 1, 3)).toBe(false);
  });

  it("allows a free user exactly at the cap", () => {
    expect(exceedsLinkCap(false, FREE_LINK_LIMIT, 3)).toBe(false);
  });

  it("blocks a free user growing past the cap from under it", () => {
    expect(exceedsLinkCap(false, FREE_LINK_LIMIT + 1, FREE_LINK_LIMIT - 1)).toBe(true);
  });

  it("grandfathers an already-over-cap free user editing without growing", () => {
    const already = FREE_LINK_LIMIT + 3;
    expect(exceedsLinkCap(false, already, already)).toBe(false);
  });

  it("still blocks an already-over-cap free user from growing further", () => {
    const already = FREE_LINK_LIMIT + 3;
    expect(exceedsLinkCap(false, already + 1, already)).toBe(true);
  });

  it("allows an already-over-cap free user trimming back down", () => {
    const already = FREE_LINK_LIMIT + 3;
    expect(exceedsLinkCap(false, already - 1, already)).toBe(false);
  });

  it("uses the higher Pro cap", () => {
    expect(exceedsLinkCap(true, PRO_LINK_LIMIT, 3)).toBe(false);
    expect(exceedsLinkCap(true, PRO_LINK_LIMIT + 1, PRO_LINK_LIMIT - 1)).toBe(true);
  });
});
