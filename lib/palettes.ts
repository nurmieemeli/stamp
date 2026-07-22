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
  /** Pro-only palette — gated in saveProfileAction and the dashboard picker. */
  pro?: boolean;
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
  {
    key: "midnight",
    label: "Midnight",
    pageBg: "#060A10",
    pro: true,
    tokens: {
      bg: "#0A0F16",
      surface: "#10161F",
      surfaceRaised: "#161D28",
      line: "#232C38",
      lineSoft: "#1B222C",
      text: "#DCE6F0",
      textMuted: "#7C8FA6",
      textFaint: "#46586C",
      accent: "#4FD1E8",
      accentInk: "#001318",
      ok: "#6FCF7F",
    },
  },
  {
    key: "rosewood",
    label: "Rosewood",
    pageBg: "#100609",
    pro: true,
    tokens: {
      bg: "#160A0F",
      surface: "#1F1116",
      surfaceRaised: "#28161C",
      line: "#3C232B",
      lineSoft: "#2C1B20",
      text: "#EEDFE2",
      textMuted: "#9A7F86",
      textFaint: "#664A52",
      accent: "#E0708F",
      accentInk: "#1F0510",
      ok: "#7FD9A0",
    },
  },
  {
    key: "mono",
    label: "Mono",
    pageBg: "#050505",
    pro: true,
    tokens: {
      bg: "#0A0A0A",
      surface: "#121212",
      surfaceRaised: "#1A1A1A",
      line: "#2C2C2C",
      lineSoft: "#212121",
      text: "#EDEDED",
      textMuted: "#8A8A8A",
      textFaint: "#525252",
      accent: "#FFFFFF",
      accentInk: "#0A0A0A",
      ok: "#6FCF7F",
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

export function isProPalette(key: string): boolean {
  return PALETTE_BY_KEY.get(key)?.pro === true;
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
