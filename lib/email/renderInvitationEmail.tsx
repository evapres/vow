import { render } from "@react-email/render";

import InvitationEmail, { type InvitationEmailProps } from "../../emails/InvitationEmail";

/** Server-side HTML for Resend (or any provider). */
export async function renderInvitationEmailHtml(props: InvitationEmailProps): Promise<string> {
  return render(<InvitationEmail {...props} />);
}
