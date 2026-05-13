import { Resend } from "resend";

import type { InvitationEmailProps } from "../../emails/InvitationEmail";
import { renderInvitationEmailHtml } from "@/lib/email/renderInvitationEmail";

export type SendInvitationEmailInput = {
  to: string;
  /** Same props as `/dev/email-preview/embed` (built with {@link buildInvitationEmailProps}). */
  emailProps: InvitationEmailProps;
};

/**
 * Sends the invitation email using the same HTML as the dashboard preview
 * ({@link renderInvitationEmailHtml} + {@link InvitationEmail}).
 */
export async function sendInvitationEmail({ to, emailProps }: SendInvitationEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local for local dev (see https://resend.com/api-keys), or set it in your Vercel/hosting project environment variables.",
    );
  }

  const html = await renderInvitationEmailHtml(emailProps);
  const couple = (emailProps.coupleNames ?? "").trim() || "Couple";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "VOW <invitations@thevow.vip>",
    to: to.trim(),
    subject: `You’re invited — ${couple}`,
    html,
  });

  if (error) {
    throw new Error(error.message ?? "Resend failed to send invitation email");
  }
}
