"use client";

import { useFormStatus } from "react-dom";

import { deleteHousehold } from "./actions";

function RemoveSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 w-full items-center justify-center border border-red-300 bg-red-50 px-4 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-60"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}

type RemoveHouseholdFormProps = {
  weddingId: string;
  householdId: string;
};

export default function RemoveHouseholdForm({ weddingId, householdId }: RemoveHouseholdFormProps) {
  return (
    <form action={deleteHousehold}>
      <input type="hidden" name="wedding_id" value={weddingId} />
      <input type="hidden" name="household_id" value={householdId} />
      <RemoveSubmitButton />
    </form>
  );
}
