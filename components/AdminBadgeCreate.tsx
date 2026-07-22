"use client";

import { useState, useTransition } from "react";
import { createBadgeAction } from "@/app/admin/badges/actions";

export function AdminBadgeCreate() {
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate() {
    setError("");
    startTransition(async () => {
      const result = await createBadgeAction(label);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLabel("");
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
      <button className="button" type="button" onClick={handleCreate} disabled={isPending || !label.trim()}>
        {isPending ? "Creating…" : "Create badge"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
