"use client";

import { useState } from "react";

import OutlineSilkButton from "@/app/components/OutlineSilkButton";
import SolidSilkButton from "@/app/components/SolidSilkButton";

import { createHousehold } from "./actions";

type AddGuestFormProps = {
  weddingId: string;
};

export default function AddGuestForm({ weddingId }: AddGuestFormProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <OutlineSilkButton
        type="button"
        onClick={() => setOpen(true)}
        wrapperClassName="h-10 w-fit"
        buttonClassName="px-4 whitespace-nowrap text-[#1A1A1A] hover:text-[#1A1A1A]"
      >
        Add guest
      </OutlineSilkButton>
    );
  }

  return (
    <div className="w-full min-w-[280px] max-w-md border border-[#1A1A1A]/20 bg-transparent p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
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
            className="mt-2 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
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
            Stored in Supabase. This app does not send the invitation email yet—after saving, copy the invite link from the banner and send it yourself (or add Resend / similar later).
          </p>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="guest@example.com"
            className="mt-2 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
          />
        </div>

        <div>
          <label
            htmlFor="invite_token"
            className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70"
          >
            Invite token
          </label>
          <p className="mt-1 text-[11px] text-[#1A1A1A]/55">
            Optional. Leave blank to generate a unique link token. Used in <code className="text-xs">/invite/…</code>.
          </p>
          <input
            id="invite_token"
            name="invite_token"
            type="text"
            placeholder="Or enter a custom token"
            className="mt-2 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <SolidSilkButton
            type="submit"
            wrapperClassName="h-10 w-fit"
            buttonClassName="px-5 whitespace-nowrap"
          >
            Save to Supabase
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
  );
}
