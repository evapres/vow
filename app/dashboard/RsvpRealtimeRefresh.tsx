"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  weddingId: string;
};

export default function RsvpRealtimeRefresh({ weddingId }: Props) {
  const router = useRouter();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const id = weddingId.trim();
    if (!id) return;

    const refreshSoon = () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        router.refresh();
      }, 250);
    };

    const channel = supabase
      .channel(`wedding-${id}-rsvps`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps", filter: `wedding_id=eq.${id}` },
        () => refreshSoon(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "households", filter: `wedding_id=eq.${id}` },
        () => refreshSoon(),
      )
      .subscribe();

    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [router, weddingId]);

  return null;
}

