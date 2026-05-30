import "server-only";

import { inviteOgImagePath } from "./inviteOgImagePath";
import { resolveInviteOgSiteOrigin } from "./resolveInviteOgSiteOrigin";

export { inviteOgImagePath } from "./inviteOgImagePath";

export async function inviteOgImageAbsoluteUrl(token: string): Promise<string> {
  const origin = await resolveInviteOgSiteOrigin();
  return `${origin.replace(/\/$/, "")}${inviteOgImagePath(token)}`;
}
