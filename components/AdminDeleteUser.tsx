"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/app/admin/actions";

export function AdminDeleteUser({ username }: { username: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    const confirmed = window.confirm(
      `Delete @${username}’s account? This permanently removes their profile, links, badges, and avatar. This can’t be undone.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteUserAction(username);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin");
    });
  }

  return (
    <div className="panel">
      <p className="panel-title">Danger zone</p>
      <p className="hint">Permanently deletes this account and everything attached to it. There&rsquo;s no undo.</p>
      <button
        className="button-danger button-small"
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{ marginTop: 16 }}
      >
        {isPending ? "Deleting…" : "Delete this account"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
