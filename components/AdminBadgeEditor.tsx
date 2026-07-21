"use client";

import { useState, useTransition } from "react";
import { setUserBadgesAction, type AdminSaveState } from "@/app/admin/actions";

export function AdminBadgeEditor({
  username,
  allBadges,
  initialBadgeKeys,
}: {
  username: string;
  allBadges: { key: string; label: string }[];
  initialBadgeKeys: string[];
}) {
  const [badgeKeys, setBadgeKeys] = useState<string[]>(initialBadgeKeys);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<AdminSaveState>({ error: "", savedAt: null });

  function toggleBadge(key: string) {
    setBadgeKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await setUserBadgesAction(username, badgeKeys);
      setStatus(result);
    });
  }

  return (
    <div className="panel">
      <p className="panel-title">Badges</p>
      <div className="badge-picker">
        {allBadges.map((badge) => (
          <label key={badge.key} className={`badge-option${badgeKeys.includes(badge.key) ? " checked" : ""}`}>
            <input
              type="checkbox"
              checked={badgeKeys.includes(badge.key)}
              onChange={() => toggleBadge(badge.key)}
            />
            {badge.label}
          </label>
        ))}
      </div>
      <button className="button" type="button" onClick={handleSave} disabled={isPending} style={{ marginTop: 20 }}>
        {isPending ? "Saving…" : "Save badges"}
      </button>
      {status.error ? <p className="field-error">{status.error}</p> : null}
      {status.savedAt && !status.error ? (
        <p className="hint" style={{ marginTop: 12 }}>
          Saved.
        </p>
      ) : null}
    </div>
  );
}
