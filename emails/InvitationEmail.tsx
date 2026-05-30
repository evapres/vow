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

import { ENVELOPE_INVITE_LINE } from "@/lib/email/envelopeCardCopy";
import { INVITATION_SANS_EMAIL } from "@/lib/email/invitationTypography";
import { splitDetailsDateTimeLines } from "@/lib/invitationDisplay";

const sans = INVITATION_SANS_EMAIL;
const serif = 'Georgia, "Times New Roman", Times, serif' as const;

/** Design width for envelope hero — keeps % padding in sync with `background-size: 100% auto`. */
const ENVELOPE_DISPLAY_W = 520;

/**
 * Gmail often ignores max-width on the wrapping `<a>`, so the card grew to full content width (~600px+).
 * % padding-top/bottom then explode. Cap `.inv-envelope-card` (and wrappers) at {@link ENVELOPE_DISPLAY_W}.
 */
/** Envelope layout: desktop Gmail uses % top padding on the inner `<td>`; mobile uses its own block. */
const INVITATION_ENVELOPE_MOBILE_CSS = `
.inv-envelope-card {
  max-width: ${ENVELOPE_DISPLAY_W}px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
@media only screen and (min-width: 601px) {
  .inv-envelope-card-cell {
    /* Desktop / webmail — matches Gmail; % is vs. cell width (capped at ${ENVELOPE_DISPLAY_W}px). */
    padding-top: 50% !important;
  }
}
@media only screen and (max-width: 600px) {
  .inv-email-shell {
    padding-left: 16px !important;
    padding-right: 16px !important;
    max-width: 100% !important;
  }
  .inv-envelope-outer {
    max-width: ${ENVELOPE_DISPLAY_W}px !important;
    width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  .inv-envelope-link {
    box-sizing: border-box !important;
    max-width: ${ENVELOPE_DISPLAY_W}px !important;
    width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  .inv-envelope-card {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: ${ENVELOPE_DISPLAY_W}px !important;
    min-height: 0 !important;
    background-size: 100% auto !important;
    background-repeat: no-repeat !important;
    background-position: center top !important;
    text-align: center !important;
  }
  .inv-envelope-card-cell {
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    /* Padding on <td> — Gmail honors this more reliably than padding on the outer <table>. */
    padding-top: 70% !important;
    padding-left: 5% !important;
    padding-right: 5% !important;
    padding-bottom: 30% !important;
    text-align: center !important;
    vertical-align: top !important;
  }
  .inv-envelope-oncard,
  .inv-envelope-date {
    font-size: 10px !important;
    line-height: 1.35 !important;
    word-wrap: break-word !important;
    overflow-wrap: anywhere !important;
    text-shadow: 0 0 1px rgba(252, 250, 247, 0.95), 0 1px 1px rgba(252, 250, 247, 0.6) !important;
  }
  .inv-envelope-date {
    letter-spacing: 0.05em !important;
  }
  .inv-envelope-couple {
    font-size: 10px !important;
    line-height: 13px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-weight: 400 !important;
    color: #f5efe8 !important;
    text-align: center !important;
    margin-top: 20% !important;
    margin-right: auto !important;
    margin-bottom: 0 !important;
    margin-left: auto !important;
    max-width: 96% !important;
    letter-spacing: 0.02em !important;
    word-wrap: break-word !important;
    overflow-wrap: anywhere !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45) !important;
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

/** Envelope hero block height (HTML overlay over `email-invite-envelope-template.png`). */
const ENVELOPE_BLOCK_MIN_HEIGHT_PX = 600;

/** Top padding so invite + date sit on the beige card (px). */
const ENVELOPE_CARD_PADDING_TOP_PX = 180;

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
  margin: "0 auto 4px",
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
  backgroundSize: "100% auto",
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "center top",
  textAlign: "center" as const,
} as const;

/** Inner `<td>` — all inset spacing so desktop Gmail matches preview browsers. */
const envelopeCardCell = {
  paddingTop: `${ENVELOPE_CARD_PADDING_TOP_PX}px`,
  paddingLeft: "28px",
  paddingRight: "28px",
  paddingBottom: "20px",
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

const envelopeOnFlapCouple = {
  fontFamily: sans,
  fontSize: "16px",
  fontWeight: 400 as const,
  color: "#f5efe8",
  textAlign: "center" as const,
  marginTop: "100px",
  marginRight: "0",
  marginBottom: "-30px",
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
  margin: "4px 0 22px",
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
  /** Saved invitation monogram on the red envelope flap (e.g. "N & E"). Omitted when unset. */
  envelopeMonogramDisplay?: string;
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
  envelopeMonogramDisplay,
}: InvitationEmailProps = {}) {
  const forAddressee = (householdName?.trim() || coupleNames).trim();
  const previewText = `Save the Date — ${coupleNames}`;

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
  const envelopeMonogram = envelopeMonogramDisplay?.trim() || "";

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
      <Body style={bodyStyle}>
        <Container className="inv-email-shell" style={shellStyle}>
          <Text style={forGuest}>For: {forAddressee}</Text>

          <Section className="inv-envelope-outer" style={envelopeHeroWrap}>
            {envelopeSrc ? (
              <Section style={envelopeStack}>
                <Link href={inviteUrl} style={openCardCta}>
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
                        {envelopeMonogram ? (
                          <Text className="inv-envelope-couple" style={envelopeOnFlapCouple}>
                            {envelopeMonogram}
                          </Text>
                        ) : null}
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

          <Text style={headline}>Save the Date</Text>
          <Text style={detail}>{dateLine}</Text>
          {timeLine ? <Text style={detail}>{timeLine}</Text> : null}

          <Section style={{ textAlign: "center", margin: "10px 0 0" }}>
            <Link href={calendarUrl} style={linkMuted}>
              Add to calendar
            </Link>
          </Section>

          <Text style={rsvpLine}>{rsvpDeadlineText}</Text>

          {venueTitle ? <Text style={venueBold}>{venueTitle}</Text> : null}
          {venueAddr ? <Text style={venueTitle ? addressLine : venueBold}>{venueAddr}</Text> : null}

          {mapHref ? (
            <Section style={{ textAlign: "center", margin: "4px 0 0" }}>
              <Link href={mapHref} style={linkMuted}>
                View map
              </Link>
            </Section>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
