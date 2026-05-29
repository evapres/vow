import type { CSSProperties } from "react";

import { APP_SHELL_BACKGROUND } from "@/lib/appShell";

/** Native page-bg asset size (classic cream); silk blush uses the same dimensions + CSS. */
export const INVITATION_PAGE_BG_WIDTH_PX = 1015;
export const INVITATION_PAGE_BG_HEIGHT_PX = 1024;

/** Full-page canvas behind the invitation card — matches `InvitationFrame` outer shell. */
export function invitationPageCanvasStyleFor(imagePath: string): CSSProperties {
  return {
    backgroundImage: `url(${imagePath})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };
}

/**
 * Page image only, painted in normal document flow (no `fixed` attachment).
 * Use for strips inside the invitation card so the texture isn’t doubled or misaligned with the shell.
 */
export function invitationPageCanvasStripStyleFor(imagePath: string): CSSProperties {
  return {
    backgroundImage: `url(${imagePath})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export const invitationPageCanvasStyle = invitationPageCanvasStyleFor("/invite-bg-light.png");

/** App shell canvas (no fabric) — admin, dashboard, and other non-invitation pages. */
export const invitationPageCanvasMonochromeStyle: CSSProperties = {
  backgroundColor: APP_SHELL_BACKGROUND,
  backgroundImage: "none",
};

export const invitationPageCanvasStripStyle =
  invitationPageCanvasStripStyleFor("/invite-bg-light.png");

/** RSVP band: dark brown (~#301a14), 85% opacity — solid color only. */
export const invitationRsvpBandStyle: CSSProperties = {
  backgroundColor: "rgba(48, 26, 20, 0.85)",
};

/** Draped fabric — header, hero row, and “Celebrate with us” (`InvitationHero`, image only, no overlay). */
export const invitationHeroTextureStyle: CSSProperties = {
  backgroundImage: "url(/invite-hero-fabric.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

export const invitationPolaroidPaperStyle: CSSProperties = {
  backgroundColor: "#F6EDE5",
  backgroundImage: "url(/invite-polaroid-paper.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

/** Preview fallback texture (image only). */
export const invitationDarkBandStyle: CSSProperties = {
  backgroundImage: "url(/invite-bg-dark.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
};
