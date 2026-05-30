"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildInviteSharePayload,
  buildInviteShareUrl,
  canUseWebShare,
  copyInviteSharePayload,
  facebookMessengerSendDialogUrl,
  isMobileUserAgent,
  mailtoShareUrl,
  messengerShareUrl,
  messengerWebShareUrl,
  webShareInvite,
  whatsappShareUrl,
} from "@/lib/share/invitationShare";

type InviteShareActionsProps = {
  inviteToken: string;
  inviteBaseUrl?: string;
  shareHeroImageUrl?: string | null;
};

const shareBtnClass = "m3-btn m3-btn--outlined m3-btn--compact";

function openShareTarget(url: string, options?: { sameTab?: boolean }) {
  if (options?.sameTab) {
    window.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function InviteShareActions({
  inviteToken,
  inviteBaseUrl,
  shareHeroImageUrl,
}: InviteShareActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const inviteUrl = useMemo(
    () => buildInviteShareUrl(inviteBaseUrl, inviteToken),
    [inviteBaseUrl, inviteToken],
  );

  const sharePayload = useMemo(
    () => buildInviteSharePayload({ inviteUrl, shareImageUrl: shareHeroImageUrl }),
    [inviteUrl, shareHeroImageUrl],
  );

  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setNativeShareAvailable(canUseWebShare(sharePayload));
    setIsMobile(isMobileUserAgent());
  }, [sharePayload]);

  const flash = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 3200);
  }, []);

  const onCopy = useCallback(async () => {
    const ok = await copyInviteSharePayload(sharePayload);
    flash(ok ? "Link copied." : "Could not copy — select the link and copy manually.");
  }, [flash, sharePayload]);

  const onWebShare = useCallback(async () => {
    try {
      await webShareInvite(sharePayload, inviteToken);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await onCopy();
      flash("Share unavailable — link copied instead.");
    }
  }, [flash, onCopy, inviteToken, sharePayload]);

  const onMessenger = useCallback(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();

    if (isMobile) {
      openShareTarget(messengerShareUrl(inviteUrl), { sameTab: true });
      return;
    }

    const url = appId
      ? facebookMessengerSendDialogUrl(inviteUrl, appId, inviteUrl)
      : messengerWebShareUrl(inviteUrl);
    openShareTarget(url);
  }, [inviteUrl, isMobile]);

  const onWhatsApp = useCallback(() => {
    openShareTarget(whatsappShareUrl(inviteUrl));
  }, [inviteUrl]);

  const onEmail = useCallback(() => {
    window.location.href = mailtoShareUrl(sharePayload);
  }, [sharePayload]);

  const onInstagram = useCallback(async () => {
    await onCopy();
    if (isMobile) {
      openShareTarget("instagram://direct-inbox", { sameTab: true });
      flash("Link copied — pick a chat and paste.");
      return;
    }
    openShareTarget("https://www.instagram.com/direct/inbox/");
    flash("Link copied — paste into a DM.");
  }, [flash, isMobile, onCopy]);

  const shareBtnBlock = `${shareBtnClass} w-full min-w-0`;

  return (
    <div className="mt-2 space-y-2">
      <div className="grid max-w-[18rem] grid-cols-3 gap-1.5">
        <button
          type="button"
          className="m3-btn m3-btn--filled m3-btn--compact w-full min-w-0"
          onClick={() => (nativeShareAvailable ? void onWebShare() : void onCopy())}
        >
          Share…
        </button>
        <button type="button" className={shareBtnBlock} onClick={() => void onCopy()}>
          Copy link
        </button>
        <button type="button" className={shareBtnBlock} onClick={onMessenger}>
          Messenger
        </button>
        <button type="button" className={shareBtnBlock} onClick={onWhatsApp}>
          WhatsApp
        </button>
        <button type="button" className={shareBtnBlock} onClick={onEmail}>
          Email
        </button>
        <button type="button" className={shareBtnBlock} onClick={() => void onInstagram()}>
          Instagram
        </button>
      </div>

      {status ? <p className="m3-field-support">{status}</p> : null}
    </div>
  );
}
