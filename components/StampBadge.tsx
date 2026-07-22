import type { CSSProperties } from "react";
import { BadgeIcon } from "@/components/BadgeIcon";

export function StampBadge({ label, color, icon }: { label: string; color: string; icon: string }) {
  return (
    <span className="stamp" style={{ "--stamp-color": color } as CSSProperties}>
      <BadgeIcon icon={icon} />
      {label}
    </span>
  );
}
