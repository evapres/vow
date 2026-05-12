/**
 * Sans stack for invitation HTML email (all major clients).
 * Envelope PNG text is drawn as SVG paths from bundled Roboto at {@link INVITATION_RSVP_LINE_FONT_PX}
 * (same size as the RSVP line) so Gmail always gets readable pixels.
 */
export const INVITATION_SANS_EMAIL =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif' as const;

/**
 * Same pixel size as `rsvpLine` in InvitationEmail ("Please RSVP before ...").
 */
export const INVITATION_RSVP_LINE_FONT_PX = 14;

