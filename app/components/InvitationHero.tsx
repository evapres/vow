import type { ComponentProps } from "react";

import InvitationHeroBody, { inviteHeroDefaultSrc } from "./InvitationHeroBody";

export { inviteHeroDefaultSrc };

export default function InvitationHero(props: ComponentProps<typeof InvitationHeroBody>) {
  return <InvitationHeroBody {...props} />;
}
