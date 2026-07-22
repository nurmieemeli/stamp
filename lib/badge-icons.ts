// A small curated set of generic pictograms admins pick from for badges —
// deliberately not freeform text/emoji, so every badge renders a crisp icon
// at any size instead of whatever glyph coverage the visitor's font happens
// to have.
export const BADGE_ICONS = [
  { key: "check", label: "Check" },
  { key: "star", label: "Star" },
  { key: "shield", label: "Shield" },
  { key: "crown", label: "Crown" },
  { key: "heart", label: "Heart" },
  { key: "bolt", label: "Bolt" },
  { key: "flag", label: "Flag" },
  { key: "sparkle", label: "Sparkle" },
] as const;

export type BadgeIconKey = (typeof BADGE_ICONS)[number]["key"];

const BADGE_ICON_KEYS = new Set<string>(BADGE_ICONS.map((i) => i.key));

export function isBadgeIconKey(value: string): value is BadgeIconKey {
  return BADGE_ICON_KEYS.has(value);
}

export const DEFAULT_BADGE_ICON: BadgeIconKey = "check";
