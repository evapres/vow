import {
  Body,
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
  border: "1px solid #e8e4dc",
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

const viewCard = {
  fontFamily: sans,
  fontSize: "11px",
  fontWeight: 600 as const,
  letterSpacing: "0.22em",
  color: "#111111",
  textDecoration: "underline",
  textTransform: "uppercase" as const,
};

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
  coupleNames = "Nestor & Evangelia",
  backgroundImageAbsoluteUrl,
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

          <Section style={{ textAlign: "center", margin: "0 0 8px" }}>
            <Link href={inviteUrl} style={viewCard}>
              VIEW THE CARD
            </Link>
          </Section>

          <Section style={heroWrap}>
            {heroSrc ? (
              <Img
                src={heroSrc}
                width={480}
                alt={`Save the Date — ${coupleNames}`}
                style={heroImg}
              />
            ) : (
              <Text
                style={{
                  ...heroImg,
                  fontFamily: serif,
                  fontSize: "22px",
                  padding: "48px 24px",
                  backgroundColor: "#f3f0ea",
                  color: "#222",
                  textAlign: "center" as const,
                }}
              >
                {coupleNames}
              </Text>
            )}
          </Section>

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
