/** Max data-URL length embedded in RSC props (larger heroes are served via API). */
const MAX_INLINE_HERO_DATA_URL_CHARS = 200_000;

/**
 * Hero URL safe to pass into client components on the admin edit page.
 * Large base64 values are served from `/api/admin/wedding/[id]/hero` instead.
 */
export function heroImageUrlForAdminEdit(
  weddingId: string,
  heroImageUrl: string | null | undefined,
): string | null {
  const u = heroImageUrl?.trim();
  if (!u) return null;
  if (!u.startsWith("data:")) return u;
  if (u.length <= MAX_INLINE_HERO_DATA_URL_CHARS) return u;
  return `/api/admin/wedding/${weddingId}/hero`;
}

export function isMissingInvitationThemeColumn(error: {
  message?: string;
  code?: string;
  details?: string;
}): boolean {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return text.includes("invitation_theme") || error.code === "PGRST204";
}
