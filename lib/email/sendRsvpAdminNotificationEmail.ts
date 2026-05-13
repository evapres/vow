import { Resend } from "resend";

import { renderRsvpAdminNotificationEmailHtml } from "@/lib/email/renderRsvpAdminNotificationEmail";

export type SendRsvpAdminNotificationEmailInput = {
  to: string;
  coupleNames: string;
  householdName: string;
  guestEmail?: string;
  attending: boolean;
  attendingCount: number | null;
  notes: string;
  dashboardUrl: string;
};

/**
 * Notifies the wedding owner that a household submitted an RSVP.
 * Uses the same Resend API key as invitation sends; no-ops when the key is missing.
 */
export async function sendRsvpAdminNotificationEmail(input: SendRsvpAdminNotificationEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    return;
  }

  const to = input.to.trim();
  if (!to) return;

  const household = (input.householdName ?? "").trim() || "Guest";
  const html = await renderRsvpAdminNotificationEmailHtml({
    coupleNames: input.coupleNames,
    householdName: household,
    guestEmail: input.guestEmail?.trim() || undefined,
    attending: input.attending,
    attendingCount: input.attendingCount,
    notes: input.notes,
    dashboardUrl: input.dashboardUrl.trim(),
  });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "VOW <invitations@thevow.vip>",
    to,
    subject: `New RSVP — ${household}`,
    html,
  });

  if (error) {
    throw new Error(error.message ?? "Resend failed to send RSVP notification");
  }
}
