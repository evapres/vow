import type { CSSProperties } from "react";

/** Renders the invite at this logical width, then scales down to fit the preview panel. */
export const ADMIN_PREVIEW_REFERENCE_WIDTH_PX = 480;

/** Matches `InvitationFrame` — 15.5rem floor is why the couple photo reads large on the real invite. */
const POLAROID_MIN_PX = 248;
const POLAROID_MAX_PX = 450;

/** Same ratios as the live invitation (1920 / 1440 reference artboards). */
export function proportionalInvitationVars(
  contentWidthPx: number = ADMIN_PREVIEW_REFERENCE_WIDTH_PX,
): CSSProperties {
  const w = contentWidthPx;
  const gutter = Math.max(12, (96 * w) / 1920);
  const polaroid = Math.min(
    POLAROID_MAX_PX,
    Math.max(POLAROID_MIN_PX, (450 * w) / 1920),
  );
  const heroDetailsGap = Math.max(12, (80 * w) / 1920);
  const blockEdge = Math.max(12, (104 * w) / 1440);

  const rsvpTitle = Math.max(24, (40 * w) / 1920);
  const rsvpGap = Math.max(10, (16 * w) / 1920);

  return {
    "--invite-gutter": `${gutter}px`,
    "--invite-polaroid": `${polaroid}px`,
    "--invite-hero-details-gap": `${heroDetailsGap}px`,
    "--invite-block-edge": `${blockEdge}px`,
    "--invite-preview-rsvp-title": `${rsvpTitle}px`,
    "--invite-preview-rsvp-gap": `${rsvpGap}px`,
  };
}
