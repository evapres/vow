const DEFAULT_NEXT = "/admin/invitations";

/** Strip whitespace — a leading space in Supabase Site URL breaks magic links (`redirect_to=%20https://…`). */
export function normalizeSiteOrigin(siteOrigin: string): string {
  return siteOrigin.trim().replace(/\/$/, "");
}

export function safeAuthNextPath(next: string | null | undefined): string {
  const path = (next ?? DEFAULT_NEXT).trim();
  if (!path.startsWith("/") || path.startsWith("//")) return DEFAULT_NEXT;
  return path;
}

/** Magic-link return URL; must be listed in Supabase → Auth → Redirect URLs. */
export function buildAuthCallbackUrl(siteOrigin: string, next?: string | null): string {
  const origin = normalizeSiteOrigin(siteOrigin);
  const safeNext = safeAuthNextPath(next);
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

/**
 * Must match the browser tab where the user clicked “Send magic link” (PKCE cookies).
 * Do not prefer NEXT_PUBLIC_SITE_URL over window.location — that breaks local dev when env points at prod.
 */
export function resolveSignInSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return normalizeSiteOrigin(window.location.origin);
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv ? normalizeSiteOrigin(fromEnv) : "http://localhost:3000";
}