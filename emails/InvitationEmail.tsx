import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

import {
  formatCoupleMonogramDisplay,
  resolveCoupleMonogramLetters,
  type CoupleMonogramLetters,
} from "@/lib/coupleInitials";
import type { InvitationLanguage } from "@/lib/invitationDisplay";
import {
  ENVELOPE_BACKGROUND_SIZE,
  ENVELOPE_BLOCK_MIN_HEIGHT_PX,
  ENVELOPE_CARD_TEXT_PADDING_TOP_PCT,
  ENVELOPE_FLAP_MONOGRAM_MARGIN_TOP_PX,
  ENVELOPE_INVITE_LINE,
  ENVELOPE_LAYOUT_DESIGN_WIDTH_PX,
} from "@/lib/email/envelopeCardCopy";
import { INVITATION_SANS_EMAIL } from "@/lib/email/invitationTypography";
import { splitDetailsDateTimeLines } from "@/lib/invitationDisplay";

const sans = INVITATION_SANS_EMAIL;
const serif = 'Georgia, "Times New Roman", Times, serif' as const;

/** Design width for envelope hero — keeps % padding in sync with `background-size: 100% auto`. */
const ENVELOPE_DISPLAY_W = ENVELOPE_LAYOUT_DESIGN_WIDTH_PX;

/** Cream panel radius — matches site M3 form cards (`--m3-shape-corner-md`). */
const EMAIL_SHELL_BORDER_RADIUS = "12px";

/** % of envelope width — keeps card/flap text aligned when the art scales down. */
function envWidthPct(px: number): string {
  return `${((px / ENVELOPE_DISPLAY_W) * 100).toFixed(4)}%`;
}

/** vw clamp so type scales with viewport but never exceeds the 520px design. */
function envClampFont(px: number, minPx: number): string {
  const vw = ((px / ENVELOPE_DISPLAY_W) * 100).toFixed(4);
  return `clamp(${minPx}px, ${vw}vw, ${px}px)`;
}

/**
 * Gmail often ignores max-width on the wrapping `<a>`, so the card grew to full content width (~600px+).
 * Cap `.inv-envelope-card` at {@link ENVELOPE_DISPLAY_W}; spacing uses % of that width so iPhone/iPad shrink in proportion.
 */
const INVITATION_ENVELOPE_MOBILE_CSS = `
.inv-email-shell {
  border-radius: ${EMAIL_SHELL_BORDER_RADIUS} !important;
}
.inv-envelope-outer {
  width: 100% !important;
  max-width: ${ENVELOPE_DISPLAY_W}px !important;
  margin: 0 auto !important;
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
}
.inv-envelope-stack {
  margin: 0 !important;
  padding: 0 !important;
}
.inv-envelope-link {
  width: 100% !important;
  max-width: ${ENVELOPE_DISPLAY_W}px !important;
  margin: 0 auto !important;
  display: block !important;
  line-height: 0 !important;
  font-size: 0 !important;
  box-sizing: border-box !important;
}
.inv-envelope-card {
  width: 100% !important;
  max-width: ${ENVELOPE_DISPLAY_W}px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  background-size: ${ENVELOPE_BACKGROUND_SIZE} !important;
  background-repeat: no-repeat !important;
  background-position: center top !important;
  min-height: ${ENVELOPE_BLOCK_MIN_HEIGHT_PX}px !important;
  height: auto !important;
}
.inv-envelope-card-cell {
  -webkit-text-size-adjust: 100% !important;
  text-size-adjust: 100% !important;
  padding-top: ${ENVELOPE_CARD_TEXT_PADDING_TOP_PCT}% !important;
  padding-left: ${envWidthPct(28)} !important;
  padding-right: ${envWidthPct(28)} !important;
  padding-bottom: 0 !important;
  text-align: center !important;
  vertical-align: top !important;
}
.inv-envelope-oncard,
.inv-envelope-date {
  font-size: ${envClampFont(15, 9)} !important;
  line-height: 1.45 !important;
  word-wrap: break-word !important;
  overflow-wrap: anywhere !important;
  text-shadow: 0 0 1px rgba(252, 250, 247, 0.95), 0 1px 1px rgba(252, 250, 247, 0.6) !important;
}
.inv-envelope-date {
  letter-spacing: 0.08em !important;
}
/* Link wrapper sets color:#111 — flap initials must stay cream on burgundy. */
.inv-email-headline {
  margin-top: 0 !important;
  margin-bottom: 22px !important;
}
.inv-envelope-couple {
  color: #f5efe8 !important;
  font-size: ${envClampFont(16, 10)} !important;
  line-height: 1.35 !important;
  margin-top: ${envWidthPct(ENVELOPE_FLAP_MONOGRAM_MARGIN_TOP_PX)} !important;
  margin-right: auto !important;
  margin-bottom: 0 !important;
  margin-left: auto !important;
  max-width: 96% !important;
  letter-spacing: 0.02em !important;
  text-align: center !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45) !important;
}
@media only screen and (max-width: 900px) {
  .inv-email-body-wrap {
    padding: 32px 16px !important;
  }
  .inv-email-shell {
    padding: 28px 20px !important;
    max-width: 100% !important;
  }
  .inv-email-for-guest {
    font-size: ${envClampFont(13, 11)} !important;
  }
  .inv-open-card-cta {
    font-size: ${envClampFont(14, 11)} !important;
  }
  .inv-email-headline {
    font-size: ${envClampFont(36, 22)} !important;
    line-height: 1.15 !important;
  }
  .inv-email-detail,
  .inv-email-venue-bold {
    font-size: ${envClampFont(15, 11)} !important;
    line-height: 1.5 !important;
  }
  .inv-email-address,
  .inv-email-rsvp,
  .inv-email-link-muted {
    font-size: ${envClampFont(14, 11)} !important;
    line-height: 1.5 !important;
  }
}
@media only screen and (max-width: 600px) {
  .inv-email-body-wrap {
    padding: 24px 12px !important;
  }
  .inv-email-shell {
    padding: 20px 14px !important;
  }
}
`.trim();

const pageBase = {
  margin: 0,
  padding: "48px 20px",
} as const;

const shellBase = {
  maxWidth: "520px",
  margin: "0 auto",
  padding: "40px 28px",
  border: "0",
  borderStyle: "none",
  borderRadius: EMAIL_SHELL_BORDER_RADIUS,
} as const;

const shellSolid = { ...shellBase, backgroundColor: "#fcfaf7" } as const;
const shellOnFabric = {
  ...shellBase,
  backgroundColor: "rgba(252, 250, 247, 0.78)",
} as const;

const forGuest = {
  fontFamily: sans,
  fontSize: "13px",
  color: "#111111",
  textAlign: "center" as const,
  margin: "0 0 16px",
  lineHeight: "1.5",
};

/** Clickable block: fabric / shell (fallback when no envelope image). */
const envelopeCardLink = {
  display: "inline-block",
  margin: "14px auto 0",
  marginBottom: "0",
  lineHeight: 0,
  textDecoration: "none",
  color: "#111111",
  border: "0",
  borderStyle: "none",
  outline: "none",
  boxShadow: "none",
} as const;

const envelopeHeroWrap = {
  textAlign: "center" as const,
  margin: "0 auto 0",
  maxWidth: "520px",
  backgroundColor: "transparent",
} as const;

const envelopeHeroLink = {
  display: "block" as const,
  maxWidth: `${ENVELOPE_DISPLAY_W}px`,
  margin: "0 auto",
  textDecoration: "none",
  color: "#111111",
  backgroundColor: "transparent",
} as const;

/** Outer envelope `<table>` — background + size only (no padding: Gmail is inconsistent on table padding). */
const envelopeCardOuter = {
  boxSizing: "border-box" as const,
  width: "100%",
  maxWidth: `${ENVELOPE_DISPLAY_W}px`,
  marginLeft: "auto",
  marginRight: "auto",
  minHeight: `${ENVELOPE_BLOCK_MIN_HEIGHT_PX}px`,
  padding: "0",
  backgroundColor: "transparent",
  backgroundSize: ENVELOPE_BACKGROUND_SIZE,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "center top",
  textAlign: "center" as const,
} as const;

/** Inner `<td>` — inset spacing as % of envelope width so layout scales on phone/tablet. */
const envelopeCardCell = {
  paddingTop: `${ENVELOPE_CARD_TEXT_PADDING_TOP_PCT}%`,
  paddingLeft: envWidthPct(28),
  paddingRight: envWidthPct(28),
  paddingBottom: "0",
  textAlign: "center" as const,
  verticalAlign: "top" as const,
} as const;

const envelopeOnCardLine = {
  fontFamily: sans,
  fontSize: "15px",
  fontWeight: 400 as const,
  color: "#111111",
  textAlign: "center" as const,
  margin: "0 0 4px",
  lineHeight: "1.45",
} as const;

const envelopeOnCardDate = {
  ...envelopeOnCardLine,
  margin: "0",
  letterSpacing: "0.08em",
} as const;

/** Couple initials on the burgundy flap (below invite + date on the card). */
const envelopeOnFlapCouple = {
  fontFamily: sans,
  fontSize: "16px",
  fontWeight: 400 as const,
  color: "#f5efe8",
  textAlign: "center" as const,
  marginTop: envWidthPct(ENVELOPE_FLAP_MONOGRAM_MARGIN_TOP_PX),
  marginRight: "0",
  marginBottom: "0",
  marginLeft: "0",
  lineHeight: "1.35",
  letterSpacing: "0.02em",
} as const;

/** Open Card above the envelope on the light shell — dark text so it stays readable in every client. */
const openCardCta = {
  display: "inline-block",
  fontFamily: sans,
  fontSize: "14px",
  fontWeight: 500 as const,
  lineHeight: "1.4",
  color: "#1a1410",
  backgroundColor: "transparent",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "6px 4px 8px",
  border: "0",
  borderStyle: "none",
  outline: "none",
  boxShadow: "none",
  borderRadius: "2px",
  borderBottom: "1px solid rgba(26, 20, 16, 0.45)",
  marginTop: "0",
  marginBottom: "10px",
} as const;

const envelopeStack = {
  margin: 0,
  padding: 0,
  textAlign: "center" as const,
  backgroundColor: "transparent",
} as const;

const headline = {
  fontFamily: serif,
  fontSize: "36px",
  fontWeight: 400 as const,
  color: "#111111",
  textAlign: "center" as const,
  marginTop: "0",
  marginBottom: "22px",
  marginLeft: "0",
  marginRight: "0",
  lineHeight: "1.15",
  letterSpacing: "0.01em",
};

const detail = {
  fontFamily: sans,
  fontSize: "15px",
  color: "#111111",
  textAlign: "center" as const,
  margin: "0 0 6px",
  lineHeight: "1.5",
};

const linkMuted = {
  fontFamily: sans,
  fontSize: "14px",
  color: "#111111",
  textDecoration: "underline",
};

const rsvpLine = {
  fontFamily: sans,
  fontSize: "14px",
  color: "#111111",
  textAlign: "center" as const,
  margin: "28px 0 0",
  lineHeight: "1.55",
};

const venueBold = {
  fontFamily: sans,
  fontSize: "15px",
  fontWeight: 700 as const,
  color: "#111111",
  textAlign: "center" as const,
  margin: "32px 0 6px",
  lineHeight: "1.45",
};

const addressLine = {
  fontFamily: sans,
  fontSize: "14px",
  color: "#111111",
  textAlign: "center" as const,
  margin: "0 0 10px",
  lineHeight: "1.5",
};

export type InvitationEmailProps = {
  /** Shown after “For:” (guest household). Falls back to couple names if omitted. */
  householdName?: string;
  coupleNames?: string;
  /** Full absolute URL for body background (fabric texture); omit for plain white. */
  backgroundImageAbsoluteUrl?: string;
  /** Static envelope template (`/email-invite-envelope-template.png`); text is separate HTML. */
  envelopeCardImageSrc?: string;
  /** Spaced date line on the card (e.g. from ISO wedding date); omit when unknown. */
  envelopeCardDateDisplay?: string;
  /** Combined line like "Saturday, July 11, 2026 at 8:00 PM" — split into date + time when possible. */
  weddingDate?: string;
  weddingDateLine?: string;
  weddingTimeLine?: string;
  calendarUrl?: string;
  rsvpDeadlineText?: string;
  /** Bold line when paired with {@link venueAddress}; omit to show one combined location line only. */
  venueName?: string;
  /** Location copy: full line in bold when alone (church, venue, street); regular second line when {@link venueName} is set. */
  venueAddress?: string;
  mapUrl?: string;
  /** Fallback when {@link venueAddress} is empty; shown as a single line. */
  location?: string;
  inviteUrl?: string;
  /** Initials on the burgundy flap (derived from couple names when possible). */
  envelopeMonogramLetters?: CoupleMonogramLetters;
  /** Preformatted flap line (e.g. `N & E`). */
  envelopeMonogramDisplay?: string;
  coupleInitialLeft?: string | null;
  coupleInitialRight?: string | null;
  invitationLanguage?: InvitationLanguage;
  /** Wedding date for outbound subject, e.g. "11 July 2026". */
  subjectDateDisplay?: string;
};

function defaultMapUrl(venueName: string, venueAddress: string): string {
  const q = [venueName, venueAddress].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function InvitationEmail({
  householdName,
  coupleNames = "Couple",
  backgroundImageAbsoluteUrl,
  envelopeCardImageSrc,
  envelopeCardDateDisplay,
  weddingDate = "Saturday, June 14",
  weddingDateLine,
  weddingTimeLine,
  calendarUrl = "https://calendar.google.com/calendar",
  rsvpDeadlineText = "Please RSVP before June 15 2026",
  venueName,
  venueAddress,
  mapUrl,
  location,
  inviteUrl = "https://example.com/invite/your-token",
  envelopeMonogramLetters,
  envelopeMonogramDisplay,
  coupleInitialLeft,
  coupleInitialRight,
  invitationLanguage = "en",
}: InvitationEmailProps = {}) {
  const forAddressee = (householdName?.trim() || coupleNames).trim();
  const previewText = "Save the Date";

  const splitFromCombined = splitDetailsDateTimeLines(weddingDate);
  const dateLine = weddingDateLine ?? splitFromCombined.dateLine;
  const timeLine = weddingTimeLine ?? splitFromCombined.timeLine;

  const locRaw = (location ?? "").trim();
  const explicitVenue = (venueName ?? "").trim();
  const explicitAddr = (venueAddress ?? "").trim();

  let venueTitle = "";
  let venueAddr = "";
  if (explicitVenue && explicitAddr) {
    venueTitle = explicitVenue;
    venueAddr = explicitAddr;
  } else if (!explicitVenue && explicitAddr) {
    venueAddr = explicitAddr;
  } else if (explicitVenue && !explicitAddr) {
    venueTitle = explicitVenue;
  } else if (locRaw) {
    venueAddr = locRaw;
  }

  const mapHrefExplicit = mapUrl?.trim();
  const mapHref =
    mapHrefExplicit ||
    (venueTitle || venueAddr ? defaultMapUrl(venueTitle, venueAddr) : "");

  const bgUrl = backgroundImageAbsoluteUrl?.trim();
  const envelopeSrc = envelopeCardImageSrc?.trim();
  const cardDateLine = envelopeCardDateDisplay?.trim() || "—  —  —";
  const coupleNamesTrimmed = (coupleNames ?? "").trim() || "Couple";
  const monogramLetters: CoupleMonogramLetters | undefined =
    envelopeMonogramLetters ??
    resolveCoupleMonogramLetters({
      coupleNames: coupleNamesTrimmed,
      coupleInitialLeft,
      coupleInitialRight,
      language: invitationLanguage,
    });
  const flapMonogramLine =
    envelopeMonogramDisplay?.trim() ||
    (monogramLetters ? formatCoupleMonogramDisplay(monogramLetters) : "");

  const bodyStyle = {
    ...pageBase,
    minHeight: bgUrl ? "580px" : undefined,
    backgroundColor: bgUrl ? "#ebe6dc" : "#ffffff",
    ...(bgUrl
      ? {
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat" as const,
          backgroundPosition: "center center",
        }
      : {}),
  };

  const shellStyle = bgUrl ? shellOnFabric : shellSolid;

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{INVITATION_ENVELOPE_MOBILE_CSS}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body className="inv-email-body-wrap" style={bodyStyle}>
        <Container className="inv-email-shell" style={shellStyle}>
          <Text className="inv-email-for-guest" style={forGuest}>
            For: {forAddressee}
          </Text>

          <Section className="inv-envelope-outer" style={envelopeHeroWrap}>
            {envelopeSrc ? (
              <Section className="inv-envelope-stack" style={envelopeStack}>
                <Link className="inv-open-card-cta" href={inviteUrl} style={openCardCta}>
                  Open Card
                </Link>
                <Link className="inv-envelope-link" href={inviteUrl} style={envelopeHeroLink}>
                  <Section
                    className="inv-envelope-card"
                    style={{
                      ...envelopeCardOuter,
                      backgroundImage: `url(${envelopeSrc})`,
                    }}
                  >
                    <Row>
                      <Column className="inv-envelope-card-cell" style={envelopeCardCell}>
                        <Text className="inv-envelope-oncard" style={envelopeOnCardLine}>
                          {ENVELOPE_INVITE_LINE}
                        </Text>
                        <Text className="inv-envelope-date" style={envelopeOnCardDate}>
                          {cardDateLine}
                        </Text>
                        <Text className="inv-envelope-couple" style={envelopeOnFlapCouple}>
                          {flapMonogramLine}
                        </Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              </Section>
            ) : (
              <Link href={inviteUrl} style={{ ...envelopeCardLink, fontFamily: sans, fontSize: "14px" }}>
                View invitation
              </Link>
            )}
          </Section>

          <Text className="inv-email-headline" style={headline}>
            Save the Date
          </Text>
          <Text className="inv-email-detail" style={detail}>
            {dateLine}
          </Text>
          {timeLine ? (
            <Text className="inv-email-detail" style={detail}>
              {timeLine}
            </Text>
          ) : null}

          <Section style={{ textAlign: "center", margin: "10px 0 0" }}>
            <Link className="inv-email-link-muted" href={calendarUrl} style={linkMuted}>
              Add to calendar
            </Link>
          </Section>

          <Text className="inv-email-rsvp" style={rsvpLine}>
            {rsvpDeadlineText}
          </Text>

          {venueTitle ? (
            <Text className="inv-email-venue-bold" style={venueBold}>
              {venueTitle}
            </Text>
          ) : null}
          {venueAddr ? (
            <Text className={venueTitle ? "inv-email-address" : "inv-email-venue-bold"} style={venueTitle ? addressLine : venueBold}>
              {venueAddr}
            </Text>
          ) : null}

          {mapHref ? (
            <Section style={{ textAlign: "center", margin: "4px 0 0" }}>
              <Link className="inv-email-link-muted" href={mapHref} style={linkMuted}>
                View map
              </Link>
            </Section>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
