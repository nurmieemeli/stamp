import { afterEach, describe, expect, it, vi } from "vitest";

async function loadIsAdminEmail(adminEmails: string) {
  vi.resetModules();
  vi.stubEnv("ADMIN_EMAILS", adminEmails);
  const mod = await import("./admin");
  return mod.isAdminEmail;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isAdminEmail", () => {
  it("matches an email in the allowlist", async () => {
    const isAdminEmail = await loadIsAdminEmail("admin@stamp.page");
    expect(isAdminEmail("admin@stamp.page")).toBe(true);
  });

  it("is case-insensitive", async () => {
    const isAdminEmail = await loadIsAdminEmail("admin@stamp.page");
    expect(isAdminEmail("Admin@Stamp.Page")).toBe(true);
  });

  it("rejects an email not in the allowlist", async () => {
    const isAdminEmail = await loadIsAdminEmail("admin@stamp.page");
    expect(isAdminEmail("rhea@undertow.tapes")).toBe(false);
  });

  it("handles multiple comma-separated admins", async () => {
    const isAdminEmail = await loadIsAdminEmail("a@stamp.page, b@stamp.page");
    expect(isAdminEmail("b@stamp.page")).toBe(true);
  });

  it("rejects everything when unset or null/undefined", async () => {
    const isAdminEmail = await loadIsAdminEmail("");
    expect(isAdminEmail("anyone@example.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
