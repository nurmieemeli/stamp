"use client";

import { useState, useTransition } from "react";
import { generateInviteCodeAction } from "@/app/admin/invites/actions";

export function AdminInviteGenerator() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setError("");
    setNewCode(null);
    setCopied(false);
    startTransition(async () => {
      const result = await generateInviteCodeAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      setNewCode(result.code);
    });
  }

  function handleCopy() {
    if (!newCode) return;
    navigator.clipboard.writeText(newCode).then(() => setCopied(true));
  }

  return (
    <div className="panel">
      <p className="panel-title">Generate an invite</p>
      <button className="button" type="button" onClick={handleGenerate} disabled={isPending}>
        {isPending ? "Generating…" : "Generate code"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
      {newCode ? (
        <p className="hint" style={{ marginTop: 16 }}>
          <span className="code" style={{ color: "var(--accent)", fontWeight: 700 }}>
            {newCode}
          </span>{" "}
          <button type="button" className="button-ghost button-small" onClick={handleCopy} style={{ marginLeft: 8 }}>
            {copied ? "Copied" : "Copy"}
          </button>
        </p>
      ) : null}
    </div>
  );
}
