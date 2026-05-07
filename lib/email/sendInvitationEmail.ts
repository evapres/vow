import { Resend } from "resend";

import type { InvitationEmailProps } from "../../emails/InvitationEmail";
import { formatDetailsDateTime } from "@/lib/invitationDisplay";
import { renderInvitationEmailHtml } from "@/lib/email/renderInvitationEmail";

export type SendInvitationEmailProps = {
  to: string;
  /** Guest household label — shown after “For:”. */
  householdName?: string | null;
  coupleNames: string;
  weddingDate?: string;
  location?: string;
  inviteUrl: string;
};

/** Split formatted date/time lines (English " at …" or Greek " ΣΤΙΣ …"). */
function splitCombinedDateTime(combined: string): { dateLine: string; timeLine: string } {
  const trimmed = combined.trim();
  const at = trimmed.match(/^(.+?)\s+at\s+(.+)$/i);
  if (at) return { dateLine: at[1].trim(), timeLine: at[2].trim() };
  const stis = trimmed.match(/^(.+?)\s+ΣΤΙΣ\s+(.+)$/i);
  if (stis) return { dateLine: stis[1].trim(), timeLine: stis[2].trim() };
  return { dateLine: trimmed, timeLine: "" };
}

function siteOriginFromInviteUrl(inviteUrl: string): string {
  try {
    return new URL(inviteUrl.trim()).origin;
  } catch {
    return "";
  }
}

function buildEmailProps(input: SendInvitationEmailProps): InvitationEmailProps {
  const names = input.coupleNames.trim() || "Couple";
  const inviteUrl = input.inviteUrl.trim();
  const loc = input.location?.trim();

  let weddingDateLine: string | undefined;
  let weddingTimeLine: string | undefined;
  let weddingDate: string | undefined;

  if (input.weddingDate?.trim()) {
    const combined = formatDetailsDateTime(input.weddingDate.trim()).trim();
    if (combined.length > 0) {
      const { dateLine, timeLine } = splitCombinedDateTime(combined);
      weddingDate = combined;
      weddingDateLine = dateLine;
      weddingTimeLine = timeLine || "";
    }
  }

  const origin = siteOriginFromInviteUrl(inviteUrl);
  const backgroundImageAbsoluteUrl = origin ? `${origin}/email-fabric-background.png` : undefined;

  return {
    householdName: input.householdName?.trim() || undefined,
    coupleNames: names,
    inviteUrl,
    backgroundImageAbsoluteUrl,
    weddingDate,
    weddingDateLine,
    weddingTimeLine,
    venueAddress: loc || undefined,
    location: loc || undefined,
    calendarUrl: "https://calendar.google.com/calendar",
    rsvpDeadlineText: "Please RSVP using the link in this email.",
  };
}

/**
 * Sends the invitation email using the existing React Email template (via {@link renderInvitationEmailHtml}).
 */
export async function sendInvitationEmail(props: SendInvitationEmailProps): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const html = await renderInvitationEmailHtml(buildEmailProps(props));

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "VOW <invitations@thevow.vip>",
    to: props.to.trim(),
    subject: `You’re invited — ${props.coupleNames.trim() || "Couple"}`,
    html,
  });

  if (error) {
    throw new Error(error.message ?? "Resend failed to send invitation email");
  }
}
