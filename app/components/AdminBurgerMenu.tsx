"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

type AdminBurgerMenuProps = {
  className?: string;
};

function M3MenuIcon() {
  return (
    <svg className="m3-icon-btn__glyph" viewBox="0 -960 960 960" aria-hidden>
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
    </svg>
  );
}

export default function AdminBurgerMenu({ className }: AdminBurgerMenuProps) {
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
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className={`m3-admin-form relative ${className ?? ""}`.trim()}>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="m3-icon-btn"
      >
        <M3MenuIcon />
      </button>

      {open ? (
        <div className="m3-menu-popup" role="menu">
          <nav className="flex flex-col py-1">
            <Link
              href="/admin/invitations"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="m3-menu-popup__item"
            >
              Invitations
            </Link>
            <Link
              href="/admin/new"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="m3-menu-popup__item"
            >
              Create invitation
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="m3-menu-popup__item m3-menu-popup__item--danger"
            >
              Log out
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
