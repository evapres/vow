"use client";

import { useTransition } from "react";

import { deleteWedding } from "@/app/admin/actions";

type DeleteInvitationButtonProps = {
  weddingId: string;
  coupleNames: string;
};

export default function DeleteInvitationButton({ weddingId, coupleNames }: DeleteInvitationButtonProps) {
  const [pending, startTransition] = useTransition();
  const label = coupleNames.trim() || "this invitation";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Delete "${label}"? This permanently removes the invitation, all guest households, and RSVPs.`,
          )
        ) {
          return;
        }
        startTransition(() => {
          const fd = new FormData();
          fd.set("wedding_id", weddingId);
          void deleteWedding(fd);
        });
      }}
      className="inline-flex h-9 items-center justify-center border border-red-200/90 bg-white/50 px-3 text-xs font-medium text-red-900/90 hover:bg-red-50/90 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
