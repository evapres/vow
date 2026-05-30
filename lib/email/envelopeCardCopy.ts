import { parseWeddingStoredForDisplay, WEDDING_EVENT_TIME_ZONE } from "../weddingDateParse";

/** First line above the envelope art (HTML text, not baked into an image). */
export const ENVELOPE_INVITE_LINE = "You are invited";

/** Public asset served from the site root (blank card area on template). */
export const ENVELOPE_TEMPLATE_FILENAME = "email-invite-envelope-template.png";

/** Pixel size of {@link ENVELOPE_TEMPLATE_FILENAME} (keep in sync with the file in `/public`). */
export const ENVELOPE_TEMPLATE_WIDTH_PX = 736;
export const ENVELOPE_TEMPLATE_HEIGHT_PX = 981;

/** Reference width for envelope HTML overlay (% padding and clamp fonts). */
export const ENVELOPE_LAYOUT_DESIGN_WIDTH_PX = 520;

/** Scales the envelope PNG in the email block (1 = full width; below 1 = shorter/smaller art). */
export const ENVELOPE_ART_SCALE = 0.9;

/** `background-size` for the envelope hero — width % must match {@link ENVELOPE_ART_SCALE}. */
export const ENVELOPE_BACKGROUND_SIZE = `${Math.round(ENVELOPE_ART_SCALE * 100)}% auto` as const;

/** Trims empty transparent pixels below the art in the PNG (reduces gap before “Save the Date”). */
export const ENVELOPE_BLOCK_HEIGHT_TRIM = 0.88;

/** Min block height when the art is scaled to layout width × {@link ENVELOPE_ART_SCALE}. */
export const ENVELOPE_BLOCK_MIN_HEIGHT_PX = Math.round(
  ((ENVELOPE_LAYOUT_DESIGN_WIDTH_PX * ENVELOPE_ART_SCALE * ENVELOPE_TEMPLATE_HEIGHT_PX) /
    ENVELOPE_TEMPLATE_WIDTH_PX) *
    ENVELOPE_BLOCK_HEIGHT_TRIM,
);

/** Inset before “You are invited” — % of envelope cell width (`.inv-envelope-card-cell`). */
export const ENVELOPE_CARD_TEXT_PADDING_TOP_PCT = 34;

/** Same inset in px at {@link ENVELOPE_LAYOUT_DESIGN_WIDTH_PX} (OG image overlay). */
export const ENVELOPE_CARD_TEXT_PADDING_TOP_PX = Math.round(
  (ENVELOPE_LAYOUT_DESIGN_WIDTH_PX * ENVELOPE_CARD_TEXT_PADDING_TOP_PCT) / 100,
);

/** Gap from date line to initials on the burgundy flap (px at design width). */
export const ENVELOPE_FLAP_MONOGRAM_MARGIN_TOP_PX = 98;

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
