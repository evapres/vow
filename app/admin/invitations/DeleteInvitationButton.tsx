"use client";

import { useFormStatus } from "react-dom";

import { deleteWedding } from "@/app/admin/actions";

type DeleteInvitationButtonProps = {
  weddingId: string;
  coupleNames: string;
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="m3-btn m3-btn--danger m3-btn--compact">
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export default function DeleteInvitationButton({ weddingId, coupleNames }: DeleteInvitationButtonProps) {
  const displayLabel = coupleNames.trim() || "this invitation";

  return (
    <form
      action={deleteWedding}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete "${displayLabel}"? This permanently removes the invitation, all guest households, and RSVPs.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="wedding_id" value={weddingId} />
      <DeleteSubmitButton />
    </form>
  );
}
