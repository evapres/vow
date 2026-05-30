/** HTTPS couple image URL for link previews and Web Share (client-safe). */
export function publicHeroImageUrlForShare(hero: string | null | undefined): string | undefined {
  const raw = hero?.trim();
  if (!raw) return undefined;
  if (raw.startsWith("https://")) return raw;
  if (raw.startsWith("http://")) return raw.replace(/^http:\/\//i, "https://");
  return undefined;
}
