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
      className="m3-btn m3-btn--danger m3-btn--compact"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
