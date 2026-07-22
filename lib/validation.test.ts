import { describe, expect, it } from "vitest";
import { normalizeUsername, validateUsername, validateCleanText } from "./validation";

describe("normalizeUsername", () => {
  it("trims and lowercases", () => {
    expect(normalizeUsername("  Rhea  ")).toBe("rhea");
  });
});

describe("validateUsername", () => {
  it("accepts a normal handle", () => {
    expect(validateUsername("rhea")).toBeNull();
    expect(validateUsername("rhea-solano")).toBeNull();
  });

  it("rejects handles shorter than 3 characters", () => {
    expect(validateUsername("ab")).not.toBeNull();
  });

  it("rejects handles longer than 20 characters", () => {
    expect(validateUsername("a".repeat(21))).not.toBeNull();
  });

  it("normalizes case before validating, so mixed-case input is fine", () => {
    expect(validateUsername("Rhea")).toBeNull();
  });

  it("rejects symbols other than hyphens", () => {
    expect(validateUsername("rhea!")).not.toBeNull();
    expect(validateUsername("rhea_solano")).not.toBeNull();
  });

  it("rejects leading/trailing hyphens", () => {
    expect(validateUsername("-rhea")).not.toBeNull();
    expect(validateUsername("rhea-")).not.toBeNull();
  });

  it("rejects reserved handles", () => {
    expect(validateUsername("admin")).not.toBeNull();
    expect(validateUsername("dashboard")).not.toBeNull();
    expect(validateUsername("reset-password")).not.toBeNull();
    expect(validateUsername("forgot-password")).not.toBeNull();
  });

  it("rejects handles containing slurs or profanity", () => {
    expect(validateUsername("fuckyou")).not.toBeNull();
    expect(validateUsername("n1gger")).not.toBeNull();
  });
});

describe("validateCleanText", () => {
  it("accepts ordinary text", () => {
    expect(validateCleanText("Bio", "Field recordings dubbed to cassette.")).toBeNull();
  });

  it("rejects text containing slurs or profanity", () => {
    expect(validateCleanText("Bio", "you're a retard")).not.toBeNull();
  });

  it("includes the field label in the error", () => {
    expect(validateCleanText("Display name", "fuck")).toContain("Display name");
  });
});
