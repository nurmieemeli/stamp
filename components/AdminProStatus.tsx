"use client";

import { useState, useTransition } from "react";
import { setProStatusAction } from "@/app/admin/actions";

export function AdminProStatus({ username, initialIsPro }: { username: string; initialIsPro: boolean }) {
  const [isPro, setIsPro] = useState(initialIsPro);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleToggle() {
    if (isPro) {
      const confirmed = window.confirm(
        `Revoke Pro from @${username}? This also resets any Pro-only palette or custom accent color they've set back to the default.`,
      );
      if (!confirmed) return;
    }

    setError("");
    startTransition(async () => {
      const result = await setProStatusAction(username, !isPro);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.isPro !== null) setIsPro(result.isPro);
    });
  }

  return (
    <div className="panel">
      <p className="panel-title">Pro status</p>
      <p className="hint">{isPro ? "This member is Pro." : "This member is on the free plan."}</p>
      <button
        className={isPro ? "button-danger button-small" : "button button-small"}
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        style={{ marginTop: 12 }}
      >
        {isPending ? "Saving…" : isPro ? "Revoke Pro" : "Grant Pro"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
