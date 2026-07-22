"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";
import { updateBadgeAction, deleteBadgeAction } from "@/app/admin/badges/actions";
import { BADGE_ICONS } from "@/lib/badge-icons";
import { BadgeIcon } from "@/components/BadgeIcon";

export function AdminBadgeRow({
  id,
  badgeKey,
  initialLabel,
  initialColor,
  initialIcon,
  memberCount,
}: {
  id: string;
  badgeKey: string;
  initialLabel: string;
  initialColor: string;
  initialIcon: string;
  memberCount: number;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor);
  const [icon, setIcon] = useState(initialIcon);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);

  const isDirty = label.trim() !== initialLabel.trim() || color !== initialColor || icon !== initialIcon;

  function handleSave() {
    setError("");
    startSave(async () => {
      const result = await updateBadgeAction(id, label, color, icon);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      memberCount > 0
        ? `Delete "${initialLabel}"? ${memberCount} member${memberCount === 1 ? "" : "s"} currently wearing it will lose it.`
        : `Delete "${initialLabel}"?`,
    );
    if (!confirmed) return;

    setError("");
    startDelete(async () => {
      const result = await deleteBadgeAction(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDeleted(true);
    });
  }

  if (deleted) return null;

  return (
    <div>
      <div className="invite-row">
        <span className="code">{badgeKey}</span>
        <input
          type="color"
          className="badge-row-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label={`Color for ${badgeKey}`}
        />
        <select
          className="badge-row-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          aria-label={`Icon for ${badgeKey}`}
        >
          {BADGE_ICONS.map((i) => (
            <option key={i.key} value={i.key}>
              {i.label}
            </option>
          ))}
        </select>
        <div className="badge-icon-preview" style={{ "--stamp-color": color } as CSSProperties}>
          <BadgeIcon icon={icon} />
        </div>
        <input
          className="badge-row-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          aria-label={`Label for ${badgeKey}`}
        />
        <span className="badge-row-count">
          {memberCount} member{memberCount === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          className="button-ghost button-small"
          onClick={handleSave}
          disabled={isSaving || !isDirty || !label.trim()}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="button-ghost button-small"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "…" : "Delete"}
        </button>
      </div>
      {error ? <p className="field-error" style={{ margin: "0 0 12px" }}>{error}</p> : null}
    </div>
  );
}
