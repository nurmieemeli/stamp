"use client";

import { useState, useTransition } from "react";
import { adminResetPasswordAction, type AdminResetPasswordState } from "@/app/admin/actions";

export function AdminPasswordReset({ username }: { username: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<AdminResetPasswordState>({ error: "", sentTo: null });

  function handleClick() {
    startTransition(async () => {
      const result = await adminResetPasswordAction(username);
      setStatus(result);
    });
  }

  return (
    <div className="panel">
      <p className="panel-title">Password</p>
      <p className="hint">Sends the member a one-time link to set a new password. Expires in one hour.</p>
      <button
        className="button-ghost button-small"
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{ marginTop: 16 }}
      >
        {isPending ? "Sending…" : "Send password reset"}
      </button>
      {status.error ? <p className="field-error">{status.error}</p> : null}
      {status.sentTo && !status.error ? (
        <p className="hint" style={{ marginTop: 12 }}>
          Reset link sent to {status.sentTo}.
        </p>
      ) : null}
    </div>
  );
}
