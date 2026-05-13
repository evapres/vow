"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import OutlineSilkButton from "@/app/components/OutlineSilkButton";
import SolidSilkButton from "@/app/components/SolidSilkButton";

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
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        <button
          type="button"
          className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-[1px]"
          aria-label="Close"
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative z-10 max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto border border-[#1A1A1A]/20 bg-[#fcfaf7] p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:m-4 sm:rounded-sm sm:shadow-lg"
        >
          <p id={titleId} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
            New household / guest
          </p>
          <form action={createHousehold} className="mt-4 space-y-4">
            <input type="hidden" name="wedding_id" value={weddingId} />

            <div>
              <label
                htmlFor="household_name"
                className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70"
              >
                Household name <span className="text-red-700">*</span>
              </label>
              <input
                id="household_name"
                name="household_name"
                type="text"
                required
                placeholder="e.g. The Smith family"
                className="mt-2 w-full border border-[#1A1A1A]/25 bg-white px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70"
              >
                Guest email
              </label>
              <p className="mt-1 text-[11px] leading-relaxed text-[#1A1A1A]/55">
                Stored in Supabase. After adding the guest, use <span className="font-medium">Send invitation</span> on their row to email the invite when an email is saved.
              </p>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="guest@example.com"
                className="mt-2 w-full border border-[#1A1A1A]/25 bg-white px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
              />
            </div>

            <div>
              <label
                htmlFor="invited_count"
                className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70"
              >
                Invited guests
              </label>
              <p className="mt-1 text-[11px] text-[#1A1A1A]/55">
                How many people are invited in this household (including the primary guest).
              </p>
              <input
                id="invited_count"
                name="invited_count"
                type="number"
                min={1}
                defaultValue={1}
                inputMode="numeric"
                className="mt-2 w-full border border-[#1A1A1A]/25 bg-white px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <SolidSilkButton
                type="submit"
                wrapperClassName="h-10 w-fit"
                buttonClassName="px-5 whitespace-nowrap"
              >
                Add new guest
              </SolidSilkButton>
              <OutlineSilkButton
                type="button"
                onClick={() => setOpen(false)}
                wrapperClassName="h-10 w-fit"
                buttonClassName="px-5 whitespace-nowrap text-[#1A1A1A] hover:text-[#1A1A1A]"
              >
                Cancel
              </OutlineSilkButton>
            </div>
          </form>
        </div>
      </div>
    ) : null;

  return (
    <>
      <OutlineSilkButton
        type="button"
        onClick={() => setOpen(true)}
        wrapperClassName="h-10 w-fit"
        buttonClassName="px-4 whitespace-nowrap text-[#1A1A1A] hover:text-[#1A1A1A]"
      >
        Add guest
      </OutlineSilkButton>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
