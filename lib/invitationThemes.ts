import type { CSSProperties } from "react";

import {
  invitationHeroTextureStyle,
  invitationPageCanvasStripStyle,
  invitationPageCanvasStripStyleFor,
  invitationPageCanvasStyle,
  invitationPageCanvasStyleFor,
  invitationRsvpBandStyle,
} from "@/app/components/invitationDarkBandStyle";

const SILK_PAGE_BG = "/invite-bg-silk.png";

export const INVITATION_THEME_IDS = ["classic", "silk"] as const;
export type InvitationThemeId = (typeof INVITATION_THEME_IDS)[number];

export const DEFAULT_INVITATION_THEME: InvitationThemeId = "classic";

export type InvitationThemeDefinition = {
  id: InvitationThemeId;
  label: string;
  description: string;
  /** Small swatch for the admin theme picker */
  swatchStyle: CSSProperties;
  pageCanvas: CSSProperties;
  pageCanvasStrip: CSSProperties;
  heroTexture: CSSProperties;
  rsvpBand: CSSProperties;
  rsvpSolidButtonBg: string;
  rsvpSolidButtonBorder: string;
};

const coverBg = {
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
} as const;

/** Theme 1 — cream page shell with draped brown hero (current default). */
const classicTheme: InvitationThemeDefinition = {
  id: "classic",
  label: "Classic cream",
  description: "Light fabric page with rich brown invitation header and RSVP band",
  swatchStyle: {
    backgroundImage: "url(/invite-bg-light.png)",
    ...coverBg,
  },
  pageCanvas: invitationPageCanvasStyle,
  pageCanvasStrip: invitationPageCanvasStripStyle,
  heroTexture: invitationHeroTextureStyle,
  rsvpBand: invitationRsvpBandStyle,
  rsvpSolidButtonBg: "#6F5248",
  rsvpSolidButtonBorder: "#E6D1D0",
};

const silkTheme: InvitationThemeDefinition = {
  id: "silk",
  label: "Silk taupe",
  description: "Blush silk page with deep taupe invitation and darker RSVP band",
  swatchStyle: {
    backgroundImage: `url(${SILK_PAGE_BG})`,
    ...coverBg,
  },
  pageCanvas: invitationPageCanvasStyleFor(SILK_PAGE_BG),
  pageCanvasStrip: invitationPageCanvasStripStyleFor(SILK_PAGE_BG),
  heroTexture: {
    backgroundImage: "url(/invite-silk-details-bg.png)",
    ...coverBg,
  },
  rsvpBand: {
    backgroundColor: "rgba(48, 25, 20, 0.85)",
  },
  rsvpSolidButtonBg: "#68504D",
  rsvpSolidButtonBorder: "#E6D1D0",
};

export const INVITATION_THEMES: Record<InvitationThemeId, InvitationThemeDefinition> = {
  classic: classicTheme,
  silk: silkTheme,
};

export const INVITATION_THEME_LIST = INVITATION_THEME_IDS.map((id) => INVITATION_THEMES[id]);

export function parseInvitationThemeId(value: unknown): InvitationThemeId {
  const s = typeof value === "string" ? value.trim() : "";
  if (s === "silk") return "silk";
  return DEFAULT_INVITATION_THEME;
}

export function getInvitationTheme(id: unknown): InvitationThemeDefinition {
  return INVITATION_THEMES[parseInvitationThemeId(id)];
}
