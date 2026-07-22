import { describe, expect, it } from "vitest";
import { buildResetEmailHtml } from "./email";

const BASE_PARAMS = {
  displayName: "Rhea Solano",
  initial: "R",
  resetUrl: "https://stamp.rip/reset-password/abc123",
  reason: "self" as const,
};

describe("buildResetEmailHtml", () => {
  it("makes the reset link an actual anchor to the reset URL", () => {
    const html = buildResetEmailHtml({ ...BASE_PARAMS, avatarUrl: null });
    expect(html).toContain(`href="${BASE_PARAMS.resetUrl}"`);
  });

  it("renders the avatar image when a URL is provided", () => {
    const avatarUrl = "https://stamp.rip/uploads/avatars/x.webp";
    const html = buildResetEmailHtml({ ...BASE_PARAMS, avatarUrl });
    expect(html).toContain(`<img src="${avatarUrl}"`);
  });

  it("falls back to an initial-letter avatar when no URL is provided", () => {
    const html = buildResetEmailHtml({ ...BASE_PARAMS, avatarUrl: null });
    expect(html).not.toContain("<img");
    expect(html).toContain(">R<");
  });

  it("escapes HTML in the display name", () => {
    const html = buildResetEmailHtml({
      ...BASE_PARAMS,
      avatarUrl: null,
      displayName: '<script>alert(1)</script>',
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("varies the intro copy by reason", () => {
    const admin = buildResetEmailHtml({ ...BASE_PARAMS, avatarUrl: null, reason: "admin" });
    const self = buildResetEmailHtml({ ...BASE_PARAMS, avatarUrl: null, reason: "self" });
    expect(admin).toContain("An admin at Stamp started a password reset");
    expect(self).toContain("We received a request to reset your Stamp password");
  });
});
