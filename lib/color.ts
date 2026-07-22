// General color-math utilities — kept separate from lib/palettes.ts, which
// owns the palette catalog/lookup, not color arithmetic.

function srgbToLinear(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Picks pure black or white — whichever gives the higher WCAG contrast
 * ratio against `hex` — for drawing text/icons on top of an arbitrary
 * user-chosen accent color. A naive (r+g+b)/3 average gets this wrong for
 * saturated primaries (e.g. pure blue reads as "dark" by luminance despite
 * looking mid-bright), so this uses the real relative-luminance formula.
 *
 * Expects a valid 6-digit "#rrggbb" hex (validate with isHexColor first).
 */
export function contrastInk(hex: string): string {
  const luminance = relativeLuminance(hex);
  const contrastWithBlack = contrastRatio(luminance, 0);
  const contrastWithWhite = contrastRatio(luminance, 1);
  return contrastWithBlack >= contrastWithWhite ? "#000000" : "#ffffff";
}
