import type { CSSProperties } from "react";

/** Full-page canvas behind the invitation card — matches `InvitationFrame` outer shell. */
export const invitationPageCanvasStyle: CSSProperties = {
  backgroundImage: "url(/invite-bg-light.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

/**
 * Page image only, painted in normal document flow (no `fixed` attachment).
 * Use for strips inside the invitation card so the texture isn’t doubled or misaligned with the shell.
 */
export const invitationPageCanvasStripStyle: CSSProperties = {
  backgroundImage: "url(/invite-bg-light.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

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
