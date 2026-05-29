"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import M3FilledTextField from "@/app/components/m3/M3FilledTextField";

import { createHousehold } from "./actions";

type AddGuestFormProps = {
  weddingId: string;
};

export default function AddGuestForm({ weddingId }: AddGuestFormProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const modal =
    open && mounted ? (
      <div className="m3-modal-overlay m3-admin-form">
        <button type="button" className="m3-modal-scrim" aria-label="Close" onClick={() => setOpen(false)} />
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="m3-modal-dialog">
          <h2 id={titleId} className="m3-modal-dialog__title">
            New guest household
          </h2>
          <form action={createHousehold} className="space-y-4">
            <input type="hidden" name="wedding_id" value={weddingId} />

            <M3FilledTextField
              id="household_name"
              name="household_name"
              label="Household name"
              required
              placeholder="e.g. The Smith family"
            />

            <M3FilledTextField
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              label="Guest email"
              placeholder="guest@example.com"
              supportingText="Optional. Use Send invitation on their row after saving an email."
            />

            <M3FilledTextField
              id="invited_count"
              name="invited_count"
              type="number"
              min={1}
              defaultValue={1}
              inputMode="numeric"
              label="Invited guests"
              supportingText="How many people are invited in this household."
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" className="m3-btn m3-btn--filled">
                Add guest
              </button>
              <button type="button" className="m3-btn m3-btn--outlined" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button type="button" className="m3-btn m3-btn--filled m3-btn--compact" onClick={() => setOpen(true)}>
        Add guest
      </button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
