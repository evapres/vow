export type InviteSharePayload = {
  title: string;
  text: string;
  url: string;
};

export function buildInviteShareUrl(inviteBaseUrl: string | undefined, inviteToken: string): string {
  const token = inviteToken.trim();
  const base = inviteBaseUrl?.replace(/\/$/, "") ?? "";
  if (base) return `${base}/invite/${token}`;
  return `/invite/${token}`;
}

export function buildInviteSharePayload(args: {
  inviteUrl: string;
  coupleNames?: string | null;
  householdName?: string | null;
}): InviteSharePayload {
  const couple = args.coupleNames?.trim() || "We";
  const guest = args.householdName?.trim();
  const greeting = guest ? `${guest}, you're invited` : "You're invited";
  const text = `${greeting} to ${couple}'s wedding.\n\n${args.inviteUrl}`;

  return {
    title: `${couple} — Wedding invitation`,
    text,
    url: args.inviteUrl,
  };
}

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function copyInviteSharePayload(payload: InviteSharePayload): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(payload.text);
    return true;
  } catch {
    return false;
  }
}

export async function webShareInvite(payload: InviteSharePayload): Promise<void> {
  await navigator.share({
    title: payload.title,
    text: payload.text,
    url: payload.url,
  });
}

/** Mobile Messenger app deep link (share link in a chat). */
export function messengerAppShareHref(inviteUrl: string): string {
  return `fb-messenger://share?link=${encodeURIComponent(inviteUrl)}`;
}

/** Opens Instagram direct inbox when the app is installed (user pastes from clipboard). */
export function instagramDirectInboxHref(): string {
  return "instagram://direct-inbox";
}

/** Facebook Send dialog when `NEXT_PUBLIC_FACEBOOK_APP_ID` is configured. */
export function facebookMessengerSendDialogUrl(
  inviteUrl: string,
  appId: string,
  redirectUri: string,
): string {
  const params = new URLSearchParams({
    app_id: appId,
    link: inviteUrl,
    redirect_uri: redirectUri,
  });
  return `https://www.facebook.com/dialog/send?${params.toString()}`;
}

export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
