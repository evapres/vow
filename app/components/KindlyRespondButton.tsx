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
      className={`invite-float inline-flex items-center justify-center gap-2 border-0 bg-transparent px-2 py-2 font-sans text-[10px] font-semibold uppercase tracking-[1.5px] text-[#FAF6F2]/85 transition-colors hover:text-[#FAF6F2] sm:gap-3 sm:px-3 sm:text-[12px] sm:tracking-[2px] ${className ?? ""}`.trim()}
    >
      {children}
    </button>
  );
}
