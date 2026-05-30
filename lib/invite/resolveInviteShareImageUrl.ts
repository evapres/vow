import "server-only";

import { publicHeroImageUrlForShare } from "./heroImageForShare";
import { inviteOgImageAbsoluteUrl } from "./inviteOgImageUrl";

/** Public image URL for OG tags — couple image when uploaded, otherwise generated preview. */
export async function resolveInviteShareImageUrl(args: {
  token: string;
  heroImageUrl: string | null | undefined;
}): Promise<string> {
  const hero = publicHeroImageUrlForShare(args.heroImageUrl);
  if (hero) return hero;
  return inviteOgImageAbsoluteUrl(args.token);
}
