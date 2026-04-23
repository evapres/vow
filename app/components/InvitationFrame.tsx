import type { CSSProperties, ReactNode } from "react";

import { invitationPageCanvasStyle } from "./invitationDarkBandStyle";

type InvitationFrameProps = {
  children: ReactNode;
  /** Renders below the invitation column (transparent over the page canvas). */
  footer?: ReactNode;
  /** When true, removes the 64px top padding on mobile only. */
  removeMobileTopPadding?: boolean;
  /**
   * When true (default), adds `px-[var(--invite-gutter)]` so invitation/RSVP modules can bleed with negative margins.
   * Set false for app-style pages (e.g. admin) so horizontal inset is only `--page-padding`, matching perceived width on `/`.
   */
  includeInviteGutter?: boolean;
};

/**
 * Gutter: 96px at 1920px — horizontal insets, RSVP, hero sides, monogram top, etc.
 * Hero–details gap: 80px at 1920px — hero bottom + Celebrate top.
 * Block edge: 104px at 1440px — Celebrate bottom only.
 */
const invitationFrameStyle = {
  "--invite-gutter": "clamp(12px, calc(96 * 100vw / 1920), 96px)",
  "--invite-hero-details-gap": "clamp(12px, calc(80 * 100vw / 1920), 80px)",
  "--invite-block-edge": "clamp(12px, calc(104 * 100vw / 1440), 104px)",
} as CSSProperties;

export default function InvitationFrame({
  children,
  footer,
  removeMobileTopPadding = false,
  includeInviteGutter = true,
}: InvitationFrameProps) {
  return (
    <section
      className={
        removeMobileTopPadding
          ? "full-width-section min-h-screen overflow-x-hidden pb-0 pt-0 text-[#181818] sm:py-16"
          : "full-width-section min-h-screen overflow-x-hidden py-16 text-[#181818]"
      }
      style={invitationPageCanvasStyle}
    >
      <div
        className="main-content box-border w-full [--page-padding:0px] sm:[--page-padding:10%]"
        style={invitationFrameStyle}
      >
        <div className="overflow-hidden bg-transparent">
          <div
            className={
              includeInviteGutter
                ? "box-border w-full px-[var(--invite-gutter)] pt-0 pb-0"
                : "box-border w-full pt-0 pb-0"
            }
          >
            {children}
          </div>
        </div>
        {footer}
      </div>
    </section>
  );
}

