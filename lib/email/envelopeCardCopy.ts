import { parseWeddingStoredForDisplay, WEDDING_EVENT_TIME_ZONE } from "../weddingDateParse";

/** First line above the envelope art (HTML text, not baked into an image). */
export const ENVELOPE_INVITE_LINE = "You are invited";

/** Public asset served from the site root (blank card area on template). */
export const ENVELOPE_TEMPLATE_FILENAME = "email-invite-envelope-template.png";

/** Reference width for envelope HTML overlay (% padding and clamp fonts). */
export const ENVELOPE_LAYOUT_DESIGN_WIDTH_PX = 520;

/** Inset before “You are invited” — % of envelope cell width (`.inv-envelope-card-cell`). */
export const ENVELOPE_CARD_TEXT_PADDING_TOP_PCT = 55;

/** Same inset in px at {@link ENVELOPE_LAYOUT_DESIGN_WIDTH_PX} (OG image overlay). */
export const ENVELOPE_CARD_TEXT_PADDING_TOP_PX = Math.round(
  (ENVELOPE_LAYOUT_DESIGN_WIDTH_PX * ENVELOPE_CARD_TEXT_PADDING_TOP_PCT) / 100,
);

/** Gap from date line to initials on the burgundy flap (px at design width). */
export const ENVELOPE_FLAP_MONOGRAM_MARGIN_TOP_PX = 112;

export function envelopeTemplateImageAbsoluteUrl(siteOrigin: string): string | undefined {
  const o = siteOrigin.trim().replace(/\/$/, "");
  if (!o) return undefined;
  return `${o}/${ENVELOPE_TEMPLATE_FILENAME}`;
}

/**
 * Line under "You are invited" on the envelope — English month (e.g. July 11, 2026),
 * same calendar instant as {@link parseWeddingStoredForDisplay} / invitation email body.
 */
export function formatEnvelopeCardDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  const parsed = parseWeddingStoredForDisplay(iso.trim());
  if (parsed) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: WEDDING_EVENT_TIME_ZONE,
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(parsed.instant);
  }
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const [, y, mo, day] = m;
  return `${day} ${mo} ${y}`;
}
