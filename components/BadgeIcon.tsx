import type { JSX } from "react";
import { DEFAULT_BADGE_ICON, isBadgeIconKey, type BadgeIconKey } from "@/lib/badge-icons";

function CheckGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrownGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" fill="currentColor" />
    </svg>
  );
}

function HeartGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-6.716-4.35-9.428-8.03C.858 10.42 1.5 6.5 5 5c2.1-.9 4.2 0 5.5 1.8C11.8 5 13.9 4.1 16 5c3.5 1.5 4.142 5.42 2.428 7.97C18.716 16.65 12 21 12 21z"
        fill="currentColor"
      />
    </svg>
  );
}

function BoltGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-13h-7l1-7z" fill="currentColor" />
    </svg>
  );
}

function FlagGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="6" y1="3" x2="6" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 4c3-2 6 1 9-1v9c-3 2-6-1-9 1V4z" fill="currentColor" />
    </svg>
  );
}

function SparkleGlyph() {
  return (
    <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="currentColor" />
    </svg>
  );
}

const GLYPHS: Record<BadgeIconKey, () => JSX.Element> = {
  check: CheckGlyph,
  star: StarGlyph,
  shield: ShieldGlyph,
  crown: CrownGlyph,
  heart: HeartGlyph,
  bolt: BoltGlyph,
  flag: FlagGlyph,
  sparkle: SparkleGlyph,
};

export function BadgeIcon({ icon }: { icon: string }) {
  const key = isBadgeIconKey(icon) ? icon : DEFAULT_BADGE_ICON;
  const Glyph = GLYPHS[key];
  return <Glyph />;
}
