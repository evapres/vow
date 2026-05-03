"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

type AdminBurgerMenuProps = {
  weddingId?: string | null;
  className?: string;
};

export default function AdminBurgerMenu({ weddingId, className }: AdminBurgerMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const dashboardHref = weddingId ? `/dashboard/${weddingId}` : "/admin";

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`.trim()}>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center border border-[#181818]/20 bg-white/70 text-[#181818] backdrop-blur-[2px] hover:bg-white/85"
      >
        <span className="sr-only">Open menu</span>
        <div className="flex flex-col gap-1">
          <span className="h-px w-5 bg-[#181818]/80" />
          <span className="h-px w-5 bg-[#181818]/80" />
          <span className="h-px w-5 bg-[#181818]/80" />
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden border border-[#181818]/20 bg-white/90 text-[#181818] shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop-blur-[4px]">
          <nav className="flex flex-col">
            <Link
              href="/admin/invitations"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium hover:bg-[#181818]/[0.04]"
            >
              Invitations
            </Link>
            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium hover:bg-[#181818]/[0.04]"
            >
              Dashboard
            </Link>
            <Link
              href="/admin?new=1"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium hover:bg-[#181818]/[0.04]"
            >
              Create more invitations
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-3 text-left text-sm font-medium text-[#7A1F1F] hover:bg-[#181818]/[0.04]"
            >
              Log out
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

