export type PaletteTokens = {
  bg: string;
  surface: string;
  surfaceRaised: string;
  line: string;
  lineSoft: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentInk: string;
  ok: string;
};

export type Palette = {
  key: string;
  label: string;
  pageBg: string;
  tokens: PaletteTokens;
};

export const PALETTES: Palette[] = [
  {
    key: "amber",
    label: "Amber",
    pageBg: "#0B0C0D",
    tokens: {
      bg: "#0F1012",
      surface: "#17181B",
      surfaceRaised: "#1D1F23",
      line: "#2A2C30",
      lineSoft: "#212327",
      text: "#E4E1D8",
      textMuted: "#82858C",
      textFaint: "#52555C",
      accent: "#E8A33D",
      accentInk: "#1A1300",
      ok: "#6FCF7F",
    },
  },
  {
    key: "nord",
    label: "Nord",
    pageBg: "#0A0D10",
    tokens: {
      bg: "#0F1418",
      surface: "#161C22",
      surfaceRaised: "#1C232B",
      line: "#28323C",
      lineSoft: "#1E2731",
      text: "#DCE4E8",
      textMuted: "#7C8A94",
      textFaint: "#4A555E",
      accent: "#6FB3E0",
      accentInk: "#0B1620",
      ok: "#8FCB8A",
    },
  },
  {
    key: "dracula",
    label: "Dracula",
    pageBg: "#0E0B12",
    tokens: {
      bg: "#141018",
      surface: "#1B1622",
      surfaceRaised: "#221C2A",
      line: "#332A3C",
      lineSoft: "#281F30",
      text: "#E8E1EE",
      textMuted: "#8C7F9A",
      textFaint: "#564A66",
      accent: "#E85FA0",
      accentInk: "#1F0F18",
      ok: "#7FD98A",
    },
  },
  {
    key: "forest",
    label: "Forest",
    pageBg: "#0A0D0B",
    tokens: {
      bg: "#0E1210",
      surface: "#151B17",
      surfaceRaised: "#1B231D",
      line: "#28322A",
      lineSoft: "#1D251F",
      text: "#DCE6DE",
      textMuted: "#7C8F80",
      textFaint: "#4A5A4E",
      accent: "#7DC98F",
      accentInk: "#0C1810",
      ok: "#D9B65B",
    },
  },
  {
    key: "paper",
    label: "Paper",
    pageBg: "#D8D6CC",
    tokens: {
      bg: "#ECEBE4",
      surface: "#F5F4EE",
      surfaceRaised: "#E2E0D6",
      line: "#C6C4B8",
      lineSoft: "#D4D2C6",
      text: "#17181A",
      textMuted: "#56564E",
      textFaint: "#86847A",
      accent: "#A63A2C",
      accentInk: "#F5EFE8",
      ok: "#3F7D4F",
    },
  },
];

const PALETTE_BY_KEY = new Map(PALETTES.map((p) => [p.key, p]));
export const DEFAULT_PALETTE = "amber";

export function getPalette(key: string): Palette {
  return PALETTE_BY_KEY.get(key) ?? PALETTE_BY_KEY.get(DEFAULT_PALETTE)!;
}

export function isValidPalette(key: string): boolean {
  return PALETTE_BY_KEY.has(key);
}

export function paletteCssVars(tokens: PaletteTokens): Record<string, string> {
  return {
    "--bg": tokens.bg,
    "--surface": tokens.surface,
    "--surface-raised": tokens.surfaceRaised,
    "--line": tokens.line,
    "--line-soft": tokens.lineSoft,
    "--text": tokens.text,
    "--text-muted": tokens.textMuted,
    "--text-faint": tokens.textFaint,
    "--accent": tokens.accent,
    "--accent-ink": tokens.accentInk,
    "--ok": tokens.ok,
  };
}
