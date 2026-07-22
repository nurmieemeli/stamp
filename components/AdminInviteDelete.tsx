"use client";

import { useTransition } from "react";
import { deleteInviteCodeAction } from "@/app/admin/invites/actions";

export function AdminInviteDelete({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      deleteInviteCodeAction(id);
    });
  }

  return (
    <button type="button" className="button-ghost button-small" onClick={handleClick} disabled={isPending}>
      {isPending ? "…" : "Delete"}
    </button>
  );
}
