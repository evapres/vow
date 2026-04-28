"use client";

import type { ReactNode } from "react";

type KindlyRespondButtonProps = {
  className?: string;
  children: ReactNode;
};

export default function KindlyRespondButton({ className, children }: KindlyRespondButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className={`invite-float inline-flex items-center justify-center gap-3 border-0 bg-transparent px-3 py-2 font-sans text-[12px] font-bold uppercase tracking-[2px] text-[#FAF6F2]/85 transition-colors hover:text-[#FAF6F2] ${className ?? ""}`.trim()}
    >
      {children}
    </button>
  );
}
