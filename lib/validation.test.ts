import { describe, expect, it } from "vitest";
import { normalizeUsername, validateUsername } from "./validation";

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
  });
});
