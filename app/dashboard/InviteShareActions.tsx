"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildInviteSharePayload,
  buildInviteShareUrl,
  canUseWebShare,
  copyInviteSharePayload,
  copyInviteUrl,
  facebookMessengerSendDialogUrl,
  instagramDirectInboxHref,
  isMobileUserAgent,
  isPublicHttpsUrl,
  mailtoShareUrl,
  messengerShareUrl,
  messengerWebShareUrl,
  webShareInvite,
  whatsappShareUrl,
} from "@/lib/share/invitationShare";

type InviteShareActionsProps = {
  inviteToken: string;
  coupleNames: string;
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
  coupleNames,
  inviteBaseUrl,
  shareHeroImageUrl,
}: InviteShareActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const inviteUrl = useMemo(
    () => buildInviteShareUrl(inviteBaseUrl, inviteToken),
    [inviteBaseUrl, inviteToken],
  );

  const sharePayload = useMemo(
    () => buildInviteSharePayload({ inviteUrl, coupleNames, shareImageUrl: shareHeroImageUrl }),
    [inviteUrl, coupleNames, shareHeroImageUrl],
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

  const onMessenger = useCallback(async () => {
    const copied = await copyInviteSharePayload(sharePayload);

    if (!isPublicHttpsUrl(inviteUrl)) {
      openShareTarget(isMobile ? "fb-messenger://" : "https://www.messenger.com/");
      flash(
        copied
          ? "Link copied — paste it into your Messenger chat."
          : "Paste your invite link into Messenger manually.",
      );
      return;
    }

    if (isMobile) {
      openShareTarget(messengerShareUrl(inviteUrl), { sameTab: true });
      flash(
        copied
          ? "Opening Messenger. If the link is rejected, paste from your clipboard."
          : "Opening Messenger…",
      );
      return;
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
    const url = appId
      ? facebookMessengerSendDialogUrl(inviteUrl, appId, inviteUrl)
      : messengerWebShareUrl(inviteUrl);
    openShareTarget(url);
    flash(
      copied
        ? "Opening Messenger. If the link is rejected, paste from your clipboard."
        : "Opening Messenger…",
    );
  }, [flash, inviteUrl, isMobile, sharePayload]);

  const onWhatsApp = useCallback(() => {
    openShareTarget(whatsappShareUrl(inviteUrl));
  }, [inviteUrl]);

  const onEmail = useCallback(() => {
    window.location.href = mailtoShareUrl(sharePayload);
  }, [sharePayload]);

  const onInstagram = useCallback(async () => {
    const copied = await copyInviteUrl(inviteUrl);

    if (!isPublicHttpsUrl(inviteUrl)) {
      openShareTarget(instagramDirectInboxHref(isMobile), { sameTab: isMobile });
      flash(
        copied
          ? "Link copied — paste it into your Instagram DM."
          : "Paste your invite link into Instagram manually.",
      );
      return;
    }

    openShareTarget(instagramDirectInboxHref(isMobile), { sameTab: isMobile });
    flash(
      copied
        ? "Opening Instagram. Paste the invite link into your chat."
        : "Opening Instagram — paste your invite link into a DM.",
    );
  }, [flash, inviteUrl, isMobile]);

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
