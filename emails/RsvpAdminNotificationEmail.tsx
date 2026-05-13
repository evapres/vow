import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";

import { INVITATION_SANS_EMAIL } from "@/lib/email/invitationTypography";

const sans = INVITATION_SANS_EMAIL;

export type RsvpAdminNotificationEmailProps = {
  coupleNames: string;
  householdName: string;
  guestEmail?: string;
  attending: boolean;
  attendingCount: number | null;
  notes: string;
  dashboardUrl: string;
};

export default function RsvpAdminNotificationEmail({
  coupleNames,
  householdName,
  guestEmail,
  attending,
  attendingCount,
  notes,
  dashboardUrl,
}: RsvpAdminNotificationEmailProps) {
  const couple = (coupleNames ?? "").trim() || "Couple";
  const response = attending ? "Yes — attending" : "No — not attending";
  const countLine =
    attending && attendingCount != null ? `Party size: ${attendingCount}` : null;
  const noteBlock = (notes ?? "").trim();

  return (
    <Html>
      <Head />
      <Preview>New RSVP response — {householdName}</Preview>
      <Body style={{ margin: 0, padding: "32px 20px", backgroundColor: "#f4f1ec", fontFamily: sans }}>
        <Container
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            padding: "28px 24px",
            backgroundColor: "#fcfaf7",
            border: "1px solid rgba(26, 20, 16, 0.08)",
          }}
        >
          <Text style={{ fontFamily: sans, fontSize: "18px", fontWeight: 600, color: "#1a1410", margin: "0 0 8px" }}>
            New RSVP response
          </Text>
          <Text style={{ fontFamily: sans, fontSize: "14px", color: "#444", margin: "0 0 20px", lineHeight: 1.5 }}>
            <strong>{householdName}</strong> replied for <strong>{couple}</strong>.
          </Text>

          <Section style={{ margin: "0 0 16px" }}>
            <Text style={{ fontFamily: sans, fontSize: "14px", color: "#1a1410", margin: "0 0 6px" }}>
              <strong>Response</strong>
            </Text>
            <Text style={{ fontFamily: sans, fontSize: "14px", color: "#333", margin: "0", lineHeight: 1.5 }}>
              {response}
              {countLine ? (
                <>
                  <br />
                  {countLine}
                </>
              ) : null}
            </Text>
          </Section>

          {guestEmail ? (
            <Text style={{ fontFamily: sans, fontSize: "14px", color: "#333", margin: "0 0 16px", lineHeight: 1.5 }}>
              <strong>Guest email</strong>
              <br />
              {guestEmail}
            </Text>
          ) : null}

          {noteBlock ? (
            <Section style={{ margin: "0 0 20px" }}>
              <Text style={{ fontFamily: sans, fontSize: "14px", color: "#1a1410", margin: "0 0 6px" }}>
                <strong>Note</strong>
              </Text>
              <Text
                style={{
                  fontFamily: sans,
                  fontSize: "14px",
                  color: "#333",
                  margin: "0",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {noteBlock}
              </Text>
            </Section>
          ) : null}

          {dashboardUrl ? (
            <Link
              href={dashboardUrl}
              style={{
                display: "inline-block",
                fontFamily: sans,
                fontSize: "14px",
                fontWeight: 500,
                color: "#1a1410",
                textDecoration: "underline",
              }}
            >
              Open guest dashboard
            </Link>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
