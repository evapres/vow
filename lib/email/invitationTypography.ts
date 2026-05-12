/**
 * Sans stack for invitation HTML email (all major clients).
 * Envelope/card PNG text uses the same pixel size via {@link INVITATION_DETAIL_FONT_PX} (bundled Roboto paths).
 */
export const INVITATION_SANS_EMAIL =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif' as const;

/** Same as `detail` in InvitationEmail — date and time lines (“Saturday…”, “3:00 AM”). */
export const INVITATION_DETAIL_FONT_PX = 15;
