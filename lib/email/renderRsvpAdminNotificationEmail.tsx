import { render } from "@react-email/render";

import RsvpAdminNotificationEmail, { type RsvpAdminNotificationEmailProps } from "../../emails/RsvpAdminNotificationEmail";

export async function renderRsvpAdminNotificationEmailHtml(props: RsvpAdminNotificationEmailProps): Promise<string> {
  return render(<RsvpAdminNotificationEmail {...props} />);
}
