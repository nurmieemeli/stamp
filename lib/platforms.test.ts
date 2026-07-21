import { describe, expect, it } from "vitest";
import { getPlatformLabel, isKnownPlatform, resolveLinkUrl } from "./platforms";

describe("resolveLinkUrl", () => {
  it("builds a path-based handle URL", () => {
    expect(resolveLinkUrl("instagram", "rhea")).toBe("https://instagram.com/rhea");
  });

  it("strips a leading @ from handles", () => {
    expect(resolveLinkUrl("x", "@rhea")).toBe("https://x.com/rhea");
  });

  it("builds a subdomain-based handle URL (bandcamp)", () => {
    expect(resolveLinkUrl("bandcamp", "undertow-tapes")).toBe("https://undertow-tapes.bandcamp.com");
  });

  it("adds https:// to a bare website domain", () => {
    expect(resolveLinkUrl("website", "undertowtapes.com")).toBe("https://undertowtapes.com");
  });

  it("leaves an already-schemed website URL untouched", () => {
    expect(resolveLinkUrl("website", "https://undertowtapes.com")).toBe("https://undertowtapes.com");
  });

  it("adds mailto: to a bare email address", () => {
    expect(resolveLinkUrl("email", "rhea@undertow.tapes")).toBe("mailto:rhea@undertow.tapes");
  });

  it("never lets a handle-mode platform link to an arbitrary URL (spoofing regression)", () => {
    // A user pasting a full URL into a handle field (e.g. "Instagram") must not
    // produce a link that leaves instagram.com — the visible label ("Instagram")
    // would otherwise lie about the destination.
    const url = resolveLinkUrl("instagram", "https://evil.example.com/phish");
    expect(url.startsWith("https://instagram.com/")).toBe(true);
    expect(url).not.toContain("evil.example.com");
  });

  it("never lets an email-mode platform resolve to a non-mailto link (spoofing regression)", () => {
    const url = resolveLinkUrl("email", "https://evil.example.com/phish");
    expect(url.startsWith("mailto:")).toBe(true);
  });
});

describe("getPlatformLabel / isKnownPlatform", () => {
  it("returns the catalog label for a known platform", () => {
    expect(getPlatformLabel("github")).toBe("GitHub");
  });

  it("falls back to the raw key for an unknown platform", () => {
    expect(getPlatformLabel("myspace")).toBe("myspace");
  });

  it("distinguishes known from unknown platform keys", () => {
    expect(isKnownPlatform("github")).toBe(true);
    expect(isKnownPlatform("myspace")).toBe(false);
  });
});
