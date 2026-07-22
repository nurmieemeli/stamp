import type { CSSProperties } from "react";

export function StampBadge({ label, color, icon }: { label: string; color: string; icon: string }) {
  return (
    <span className="stamp" style={{ "--stamp-color": color } as CSSProperties}>
      <span className="stamp-icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}
