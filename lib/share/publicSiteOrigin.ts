/** Production origin used when share links must be public HTTPS (Messenger, Instagram, etc.). */
export const DEFAULT_PUBLIC_SITE_ORIGIN = "https://thevow.vip";

/** Messenger / Instagram require a public HTTPS URL — not localhost or LAN dev hosts. */
export function isPublicHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return (
      u.protocol === "https:" &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      !host.endsWith(".local") &&
      !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    );
  } catch {
    return false;
  }
}

export function normalizeSiteOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

export function firstPublicSiteOrigin(...candidates: Array<string | undefined | null>): string {
  for (const candidate of candidates) {
    const normalized = normalizeSiteOrigin(candidate ?? "");
    if (normalized && isPublicHttpsUrl(normalized)) return normalized;
  }
  return DEFAULT_PUBLIC_SITE_ORIGIN;
}
