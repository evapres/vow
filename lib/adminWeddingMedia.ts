import { createClient } from "@/lib/supabase/server";

export type AdminWeddingMediaKind = "hero" | "music";

const COLUMN_BY_KIND: Record<AdminWeddingMediaKind, "hero_image_url" | "invitation_music_url"> = {
  hero: "hero_image_url",
  music: "invitation_music_url",
};

/**
 * Never embed `data:` URLs in admin edit RSC props — they exceed Vercel response limits
 * and cause "This page couldn't load" after save.
 */
export function adminMediaUrlForEdit(
  weddingId: string,
  url: string | null | undefined,
  kind: AdminWeddingMediaKind,
): string | null {
  const u = url?.trim();
  if (!u) return null;
  if (u.startsWith("data:")) {
    return `/api/admin/wedding/${weddingId}/${kind}`;
  }
  return u;
}

export function isMissingInvitationThemeColumn(error: {
  message?: string;
  code?: string;
  details?: string;
}): boolean {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return text.includes("invitation_theme") || error.code === "PGRST204";
}

export async function loadOwnedWeddingMedia(
  weddingId: string,
  kind: AdminWeddingMediaKind,
): Promise<{ bytes: Buffer; contentType: string } | { redirect: string } | null> {
  const id = weddingId.trim();
  if (!id) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const column = COLUMN_BY_KIND[kind];
  const { data, error } = await supabase
    .from("weddings")
    .select(column)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  const raw = String((data as Record<string, string | null>)[column] ?? "").trim();
  if (!raw) return null;

  if (raw.startsWith("data:")) {
    const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(raw);
    if (!match) return null;
    return {
      bytes: Buffer.from(match[2], "base64"),
      contentType: match[1],
    };
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return { redirect: raw };
  }

  return null;
}
