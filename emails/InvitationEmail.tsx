import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const sans =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif' as const;
const serif = 'Georgia, "Times New Roman", Times, serif' as const;

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

/** Clickable envelope + card art (no extra CSS background — image carries the design). */
const envelopeCardLink = {
  display: "inline-block",
  margin: "14px auto 0",
  textDecoration: "none",
  color: "#111111",
  border: "0",
  borderStyle: "none",
  outline: "none",
  boxShadow: "none",
} as const;

const envelopeCardImg = {
  display: "block",
  margin: "0 auto",
  maxWidth: "100%",
  height: "auto",
  border: "0",
  outline: "none",
} as const;

const envelopeHeroWrap = {
  textAlign: "center" as const,
  margin: "0 auto 24px",
  maxWidth: "520px",
} as const;

const openCardButton = {
  display: "inline-block",
  fontFamily: sans,
  fontSize: "14px",
  fontWeight: 300 as const,
  lineHeight: "1.4",
  color: "#ffffff",
  backgroundColor: "#2a1818",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 32px",
  borderRadius: "4px",
  border: "1px solid #2a1818",
} as const;

/** Pulls the button over the top / open flap of the envelope art (works in table-based email HTML). */
const openCardButtonOnFlap = {
  ...openCardButton,
  position: "relative" as const,
  zIndex: 2,
  marginTop: "8px",
  marginBottom: "-56px",
} as const;

const heroWrap = {
  textAlign: "center" as const,
  margin: "28px 0 36px",
};

const heroImg = {
  display: "block",
  margin: "0 auto",
  maxWidth: "100%",
  height: "auto",
  border: "0",
};

const headline = {
  fontFamily: serif,
  fontSize: "36px",
  fontWeight: 400 as const,
  color: "#111111",
  textAlign: "center" as const,
  margin: "0 0 28px",
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
  /**
   * `src` for the clickable envelope + card image: composited PNG at
   * `/api/email-invite-card?…` (HTTPS, email-client safe) or omitted when no site origin.
   */
  envelopeCardImageSrc?: string;
  /** Full absolute URL to the hero image (required for most inboxes). */
  heroImageAbsoluteUrl?: string;
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
};

function splitDateAndTime(combined: string): { date: string; time: string } {
  const m = combined.trim().match(/^(.+?)\s+at\s+(.+)$/i);
  if (m) return { date: m[1].trim(), time: m[2].trim() };
  return { date: combined.trim(), time: "6:00PM EEST" };
}

function defaultMapUrl(venueName: string, venueAddress: string): string {
  const q = [venueName, venueAddress].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function InvitationEmail({
  householdName,
  coupleNames = "Couple",
  backgroundImageAbsoluteUrl,
  envelopeCardImageSrc,
  heroImageAbsoluteUrl,
  weddingDate = "Saturday, June 14",
  weddingDateLine,
  weddingTimeLine,
  calendarUrl = "https://calendar.google.com/calendar",
  rsvpDeadlineText = "Please RSVP before May 15th, 10:30PM",
  venueName,
  venueAddress,
  mapUrl,
  location,
  inviteUrl = "https://example.com/invite/your-token",
}: InvitationEmailProps = {}) {
  const forAddressee = (householdName?.trim() || coupleNames).trim();
  const previewText = `Save the Date — ${coupleNames}`;

  const dateLine =
    weddingDateLine ??
    (weddingDate.includes("at") ? splitDateAndTime(weddingDate).date : weddingDate);
  const timeLine =
    weddingTimeLine ??
    (weddingDate.includes("at") ? splitDateAndTime(weddingDate).time : "6:00PM EEST");

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

  const heroSrc = heroImageAbsoluteUrl?.trim();
  const bgUrl = backgroundImageAbsoluteUrl?.trim();
  const envelopeSrc = envelopeCardImageSrc?.trim();

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
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={shellStyle}>
          <Text style={forGuest}>For: {forAddressee}</Text>

          <Section style={envelopeHeroWrap}>
            {envelopeSrc ? (
              <Section style={{ margin: 0, padding: 0, textAlign: "center" }}>
                <Button href={inviteUrl} style={openCardButtonOnFlap}>
                  Open Card
                </Button>
                <Link href={inviteUrl} style={{ ...envelopeCardLink, marginTop: 0 }}>
                  <Img
                    src={envelopeSrc}
                    width={520}
                    alt={`Open invitation — ${coupleNames}`}
                    style={envelopeCardImg}
                  />
                </Link>
              </Section>
            ) : (
              <Link href={inviteUrl} style={{ ...envelopeCardLink, fontFamily: sans, fontSize: "14px" }}>
                View invitation
              </Link>
            )}
          </Section>

          {heroSrc ? (
            <Section style={heroWrap}>
              <Img
                src={heroSrc}
                width={480}
                alt={`Save the Date — ${coupleNames}`}
                style={heroImg}
              />
            </Section>
          ) : null}

          <Text style={headline}>Save the Date</Text>
          <Text style={detail}>{dateLine}</Text>
          <Text style={detail}>{timeLine}</Text>

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
