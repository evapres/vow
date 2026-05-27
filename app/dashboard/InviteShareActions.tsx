"use client";

import { useCallback, useMemo, useState } from "react";

import {
  buildInviteSharePayload,
  buildInviteShareUrl,
  canUseWebShare,
  copyInviteSharePayload,
  facebookMessengerSendDialogUrl,
  isMobileUserAgent,
  webShareInvite,
  whatsappShareUrl,
} from "@/lib/share/invitationShare";

type InviteShareActionsProps = {
  inviteToken: string;
  inviteBaseUrl?: string;
  coupleNames?: string | null;
  householdName?: string | null;
};

const actionButtonClass =
  "inline-flex h-8 items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-2.5 text-[11px] font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03] disabled:cursor-not-allowed disabled:opacity-40";

export default function InviteShareActions({
  inviteToken,
  inviteBaseUrl,
  coupleNames,
  householdName,
}: InviteShareActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const inviteUrl = useMemo(
    () => buildInviteShareUrl(inviteBaseUrl, inviteToken),
    [inviteBaseUrl, inviteToken],
  );

  const sharePayload = useMemo(
    () => buildInviteSharePayload({ inviteUrl, coupleNames, householdName }),
    [inviteUrl, coupleNames, householdName],
  );

  const showWebShare = canUseWebShare();

  const flash = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 2800);
  }, []);

  const onCopy = useCallback(async () => {
    const ok = await copyInviteSharePayload(sharePayload);
    flash(ok ? "Invitation copied — paste anywhere." : "Could not copy. Select the link and copy manually.");
  }, [flash, sharePayload]);

  const onWebShare = useCallback(async () => {
    try {
      await webShareInvite(sharePayload);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await onCopy();
    }
  }, [onCopy, sharePayload]);

  const onMessenger = useCallback(async () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();

    if (isMobileUserAgent()) {
      await copyInviteSharePayload(sharePayload);
      const deepLink = `fb-messenger://share?link=${encodeURIComponent(inviteUrl)}`;
      const openedAt = Date.now();
      window.location.href = deepLink;
      window.setTimeout(() => {
        if (Date.now() - openedAt < 2000) {
          if (appId) {
            window.open(facebookMessengerSendDialogUrl(inviteUrl, appId, inviteUrl), "_blank", "noopener,noreferrer");
          } else {
            flash("Copied — open Messenger and paste the invitation.");
          }
        }
      }, 800);
      return;
    }

    if (appId) {
      window.open(facebookMessengerSendDialogUrl(inviteUrl, appId, inviteUrl), "_blank", "noopener,noreferrer");
      return;
    }

    await copyInviteSharePayload(sharePayload);
    window.open("https://www.messenger.com/", "_blank", "noopener,noreferrer");
    flash("Copied — paste the invitation into a Messenger chat.");
  }, [flash, inviteUrl, sharePayload]);

  const onWhatsApp = useCallback(() => {
    const waUrl = whatsappShareUrl(sharePayload.text);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }, [sharePayload]);

  const onInstagram = useCallback(async () => {
    await copyInviteSharePayload(sharePayload);

    if (isMobileUserAgent()) {
      const openedAt = Date.now();
      window.location.href = "instagram://direct-inbox";
      window.setTimeout(() => {
        if (Date.now() - openedAt < 2500) {
          flash("Copied — open Instagram DMs and paste the link.");
        }
      }, 1200);
      return;
    }

    window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener,noreferrer");
    flash("Copied — paste the link in an Instagram DM.");
  }, [flash, sharePayload]);

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1A1A1A]/50">Share invitation</p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={actionButtonClass} onClick={() => void onCopy()}>
          Copy link
        </button>
        {showWebShare ? (
          <button type="button" className={actionButtonClass} onClick={() => void onWebShare()}>
            Share…
          </button>
        ) : null}
        <button type="button" className={actionButtonClass} onClick={() => void onMessenger()}>
          Messenger
        </button>
        <button type="button" className={actionButtonClass} onClick={() => void onWhatsApp()}>
          WhatsApp
        </button>
        <button type="button" className={actionButtonClass} onClick={() => void onInstagram()}>
          Instagram
        </button>
      </div>
      {status ? <p className="text-[11px] text-[#1A1A1A]/65">{status}</p> : null}
    </div>
  );
}
