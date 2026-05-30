import { buildYouAreInvitedTitle } from "@/lib/coupleNamesForm";
import { inviteOgImagePath } from "@/lib/invite/inviteOgImagePath";

export type InviteSharePayload = {
  title: string;
  /** Short message without the URL (URL is passed separately for previews). */
  text: string;
  url: string;
  /** Absolute HTTPS couple image — attached when sharing if provided. */
  shareImageUrl?: string;
};

export function buildInviteShareUrl(inviteBaseUrl: string | undefined, inviteToken: string): string {
  const token = inviteToken.trim();
  const base = inviteBaseUrl?.replace(/\/$/, "") ?? "";
  if (base) return `${base}/invite/${token}`;
  if (typeof window !== "undefined") return `${window.location.origin}/invite/${token}`;
  return `/invite/${token}`;
}

export function buildInviteSharePayload(args: {
  inviteUrl: string;
  coupleNames: string;
  shareImageUrl?: string | null;
}): InviteSharePayload {
  const shareImageUrl = args.shareImageUrl?.trim() || undefined;
  const title = buildYouAreInvitedTitle(args.coupleNames);
  return {
    title,
    text: title,
    url: args.inviteUrl,
    shareImageUrl,
  };
}

export function inviteShareClipboardText(payload: InviteSharePayload): string {
  return `${payload.text}\n\n${payload.url}`;
}

export function canUseWebShare(payload?: InviteSharePayload): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (!payload) return true;

  const candidates: ShareData[] = [
    { title: payload.title, text: payload.text, url: payload.url },
    { title: payload.title, url: payload.url },
    { url: payload.url },
  ];

  if (typeof navigator.canShare !== "function") return true;

  return candidates.some((data) => {
    try {
      return navigator.canShare(data);
    } catch {
      return false;
    }
  });
}

export async function copyInviteSharePayload(payload: InviteSharePayload): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(inviteShareClipboardText(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Native share sheet — attaches the couple image when available, else the generated preview PNG.
 */
export async function webShareInvite(
  payload: InviteSharePayload,
  inviteToken?: string,
): Promise<void> {
  const imageCandidates: string[] = [];
  if (payload.shareImageUrl) imageCandidates.push(payload.shareImageUrl);
  if (inviteToken?.trim()) {
    imageCandidates.push(new URL(inviteOgImagePath(inviteToken), payload.url).href);
  }

  for (const imageUrl of imageCandidates) {
    try {
      const res = await fetch(imageUrl, { cache: "no-store" });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.size) continue;
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const file = new File([blob], `wedding-invitation.${ext}`, {
        type: blob.type || "image/jpeg",
      });
      const withFile: ShareData = {
        files: [file],
        title: payload.title,
        text: payload.text,
        url: payload.url,
      };
      if (typeof navigator.canShare !== "function" || navigator.canShare(withFile)) {
        await navigator.share(withFile);
        return;
      }
    } catch {
      // Try next image source.
    }
  }

  const attempts: ShareData[] = [
    { title: payload.title, text: payload.text, url: payload.url },
    { title: payload.title, url: payload.url },
    { url: payload.url },
  ];

  for (const data of attempts) {
    if (typeof navigator.canShare === "function") {
      try {
        if (!navigator.canShare(data)) continue;
      } catch {
        continue;
      }
    }
    await navigator.share(data);
    return;
  }

  await navigator.share({ url: payload.url });
}

export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Opens Messenger with the invite link — mobile deep link or desktop send dialog. */
export function messengerShareUrl(inviteUrl: string): string {
  if (isMobileUserAgent()) {
    return `fb-messenger://share?link=${encodeURIComponent(inviteUrl)}`;
  }
  return `https://www.facebook.com/dialog/send?link=${encodeURIComponent(inviteUrl)}&redirect_uri=${encodeURIComponent(inviteUrl)}`;
}

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

/** WhatsApp — URL in body so clients show the link preview card. */
export function whatsappShareUrl(inviteUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(inviteUrl)}`;
}

export function mailtoShareUrl(payload: InviteSharePayload): string {
  const subject = encodeURIComponent(payload.title);
  const body = encodeURIComponent(inviteShareClipboardText(payload));
  return `mailto:?subject=${subject}&body=${body}`;
}

/** Desktop/web Messenger send dialog (no app id required). */
export function messengerWebShareUrl(inviteUrl: string): string {
  const params = new URLSearchParams({
    link: inviteUrl,
    redirect_uri: inviteUrl,
  });
  return `https://www.facebook.com/dialog/send?${params.toString()}`;
}

export function instagramDirectInboxHref(): string {
  return "instagram://direct-inbox";
}
