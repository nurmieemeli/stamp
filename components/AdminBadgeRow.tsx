"use client";

import { useState, useTransition } from "react";
import { updateBadgeLabelAction, deleteBadgeAction } from "@/app/admin/badges/actions";

export function AdminBadgeRow({
  id,
  badgeKey,
  initialLabel,
  memberCount,
}: {
  id: string;
  badgeKey: string;
  initialLabel: string;
  memberCount: number;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);

  function handleSave() {
    setError("");
    startSave(async () => {
      const result = await updateBadgeLabelAction(id, label);
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
          disabled={isSaving || label.trim() === initialLabel.trim() || !label.trim()}
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
