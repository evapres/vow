const DEFAULT_NEXT = "/admin/invitations";

export function safeAuthNextPath(next: string | null | undefined): string {
  const path = (next ?? DEFAULT_NEXT).trim();
  if (!path.startsWith("/") || path.startsWith("//")) return DEFAULT_NEXT;
  return path;
}

/**
 * Magic-link return URL built from the current browser origin.
 * Always uses window.location.origin so local → localhost, production → thevow.vip.
 * NEXT_PUBLIC_SITE_URL is intentionally NOT used here (it would force production on local dev).
 */
export function buildAuthCallbackUrl(next?: string | null): string {
  const origin = window.location.origin;
  const safeNext = safeAuthNextPath(next);
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
