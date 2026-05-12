/**
 * Absolute URL for the composited invite envelope PNG (email-safe `https://` img src).
 * Many clients block or display raw `data:image/...;base64,...` as visible “code”.
 */
export function envelopeInviteCardImageUrl(
  siteOrigin: string,
  input: { coupleNames: string; weddingDateIso: string | null | undefined },
): string {
  const origin = siteOrigin.trim().replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("couple", (input.coupleNames ?? "").trim() || "Couple");
  const d = input.weddingDateIso?.trim();
  if (d) params.set("date", d);
  return `${origin}/api/email-invite-card?${params.toString()}`;
}
