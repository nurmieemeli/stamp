import { describe, expect, it } from "vitest";
import { generateInviteCode, normalizeInviteCode } from "./invite-code";

describe("generateInviteCode", () => {
  it("produces a code in the XXXXX-XXXXX format", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/);
  });

  it("excludes visually confusable characters", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode();
      expect(code).not.toMatch(/[01OIL]/);
    }
  });

  it("produces different codes on successive calls", () => {
    const a = generateInviteCode();
    const b = generateInviteCode();
    expect(a).not.toBe(b);
  });
});

describe("normalizeInviteCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeInviteCode("  abcde-fghjk  ")).toBe("ABCDE-FGHJK");
  });
});
