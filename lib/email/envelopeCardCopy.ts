/** First line above the envelope art (HTML text, not baked into an image). */
export const ENVELOPE_INVITE_LINE = "You are invited";

/** Public asset served from the site root (blank card area on template). */
export const ENVELOPE_TEMPLATE_FILENAME = "email-invite-envelope-template.png";

export function envelopeTemplateImageAbsoluteUrl(siteOrigin: string): string | undefined {
  const o = siteOrigin.trim().replace(/\/$/, "");
  if (!o) return undefined;
  return `${o}/${ENVELOPE_TEMPLATE_FILENAME}`;
}

/** `YYYY-MM-DD...` -> `DD MM YYYY` (spaced), for the line under "You are invited" on the card. */
export function formatEnvelopeCardDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const [, y, mo, day] = m;
  return `${day} ${mo} ${y}`;
}
