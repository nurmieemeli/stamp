import { describe, expect, it } from "vitest";
import { generateResetToken, hashResetToken } from "./reset-token";

describe("generateResetToken", () => {
  it("produces a token whose hash matches the returned tokenHash", () => {
    const { token, tokenHash } = generateResetToken();
    expect(hashResetToken(token)).toBe(tokenHash);
  });

  it("produces unpredictable, non-empty tokens", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a.token).not.toBe(b.token);
    expect(a.token.length).toBeGreaterThan(20);
  });
});

describe("hashResetToken", () => {
  it("is deterministic", () => {
    expect(hashResetToken("same-input")).toBe(hashResetToken("same-input"));
  });

  it("differs for different inputs", () => {
    expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
  });
});
