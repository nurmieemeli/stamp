"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";
import { createBadgeAction } from "@/app/admin/badges/actions";
import { BADGE_ICONS, DEFAULT_BADGE_ICON } from "@/lib/badge-icons";
import { BadgeIcon } from "@/components/BadgeIcon";

const DEFAULT_COLOR = "#6fcf7f";

export function AdminBadgeCreate() {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState<string>(DEFAULT_BADGE_ICON);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate() {
    setError("");
    startTransition(async () => {
      const result = await createBadgeAction(label, color, icon);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLabel("");
      setColor(DEFAULT_COLOR);
      setIcon(DEFAULT_BADGE_ICON);
    });
  }

  return (
    <div className="panel">
      <p className="panel-title">Create a badge</p>
      <div className="field">
        <label htmlFor="new-badge-label">Label</label>
        <input
          id="new-badge-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Beta Tester"
        />
      </div>
      <div className="badge-create-row">
        <div className="field field-tight">
          <label htmlFor="new-badge-color">Color</label>
          <input
            id="new-badge-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div className="field field-tight">
          <label htmlFor="new-badge-icon">Icon</label>
          <select id="new-badge-icon" value={icon} onChange={(e) => setIcon(e.target.value)}>
            {BADGE_ICONS.map((i) => (
              <option key={i.key} value={i.key}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div className="badge-icon-preview" style={{ "--stamp-color": color } as CSSProperties}>
          <BadgeIcon icon={icon} />
        </div>
      </div>
      <button className="button" type="button" onClick={handleCreate} disabled={isPending || !label.trim()}>
        {isPending ? "Creating…" : "Create badge"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
