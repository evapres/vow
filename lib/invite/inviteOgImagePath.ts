/** Path to the dynamic share-preview PNG (fabric + envelope + details). Safe for client components. */
export function inviteOgImagePath(token: string): string {
  return `/api/og/invite/${encodeURIComponent(token.trim())}`;
}
