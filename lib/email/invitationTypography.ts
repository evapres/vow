/**
 * Sans stack for invitation HTML email (all major clients).
 * Keep PNG/SVG raster text visually aligned via {@link INVITATION_SANS_SVG_RASTER}.
 */
export const INVITATION_SANS_EMAIL =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif' as const;

/**
 * Same Helvetica/Arial family as the email, ordered for Sharp/librsvg on Linux servers.
 * Omits `-apple-system` / `BlinkMacSystemFont` (no fontconfig match → tofu on typical deploys).
 * Use with `font-weight` 400 in SVG — weight 300 often has no glyph table and shows boxes.
 */
export const INVITATION_SANS_SVG_RASTER =
  'Helvetica, "Helvetica Neue", Arial, "Liberation Sans", "DejaVu Sans", sans-serif' as const;
