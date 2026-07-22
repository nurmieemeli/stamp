import { describe, expect, it } from "vitest";
import { DEFAULT_PALETTE, getPalette, isProPalette, isValidPalette, PALETTES, paletteCssVars } from "./palettes";

describe("palette catalog", () => {
  it("has eight distinct palettes", () => {
    const keys = PALETTES.map((p) => p.key);
    expect(keys.length).toBe(8);
    expect(new Set(keys).size).toBe(8);
  });

  it("has exactly three Pro palettes", () => {
    expect(PALETTES.filter((p) => p.pro).length).toBe(3);
  });

  it("treats the five original palettes as free, not Pro", () => {
    for (const key of ["amber", "nord", "dracula", "forest", "paper"]) {
      expect(isProPalette(key)).toBe(false);
    }
  });

  it("treats the new palettes as Pro-only", () => {
    for (const key of ["midnight", "rosewood", "mono"]) {
      expect(isProPalette(key)).toBe(true);
    }
  });

  it("still recognizes Pro palette keys as valid (gating is separate from validity)", () => {
    expect(isValidPalette("mono")).toBe(true);
  });

  it("includes the default palette", () => {
    expect(isValidPalette(DEFAULT_PALETTE)).toBe(true);
  });

  it("falls back to the default for an unknown key", () => {
    expect(getPalette("nonexistent").key).toBe(DEFAULT_PALETTE);
  });

  it("returns the matching palette for a known key", () => {
    expect(getPalette("nord").key).toBe("nord");
  });

  it("every palette defines all required tokens", () => {
    const requiredKeys = [
      "bg",
      "surface",
      "surfaceRaised",
      "line",
      "lineSoft",
      "text",
      "textMuted",
      "textFaint",
      "accent",
      "accentInk",
      "ok",
    ] as const;
    for (const palette of PALETTES) {
      for (const key of requiredKeys) {
        expect(palette.tokens[key]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("keeps the semantic ok color distinct from the accent (Forest is the tight case)", () => {
    const forest = getPalette("forest");
    expect(forest.tokens.ok.toLowerCase()).not.toBe(forest.tokens.accent.toLowerCase());
  });

  it("maps tokens to the expected CSS custom property names", () => {
    const vars = paletteCssVars(getPalette("amber").tokens);
    expect(vars["--accent"]).toBe("#E8A33D");
    expect(vars["--accent-ink"]).toBe("#1A1300");
    expect(Object.keys(vars)).toHaveLength(11);
  });
});
