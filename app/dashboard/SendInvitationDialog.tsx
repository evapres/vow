"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  buildInviteCopyUrl,
  buildInviteSharePayload,
  buildInviteShareUrl,
  copyInviteSharePayload,
  copyInviteUrl,
  facebookMessengerSendDialogUrl,
  instagramDirectInboxHref,
  isMobileUserAgent,
  isPublicHttpsUrl,
  messengerShareUrl,
  messengerWebShareUrl,
} from "@/lib/share/invitationShare";

import M3FilledTextField from "@/app/components/m3/M3FilledTextField";

import { sendHouseholdInvitationEmail } from "./actions";

type SendInvitationDialogProps = {
  weddingId: string;
  householdId: string;
  inviteToken: string;
  email: string | null;
  emailSentAt: string | null;
  coupleNames: string;
  inviteBaseUrl?: string;
  shareInviteBaseUrl?: string;
  shareHeroImageUrl?: string | null;
};

export default function SendInvitationDialog({
  weddingId,
  householdId,
  inviteToken,
  email,
  emailSentAt,
  coupleNames,
  inviteBaseUrl,
  shareInviteBaseUrl,
  shareHeroImageUrl,
}: SendInvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const titleId = useId();
  const hasEmail = Boolean(email?.trim());

  const copyInviteUrlValue = useMemo(
    () => buildInviteCopyUrl(inviteBaseUrl, inviteToken),
    [inviteBaseUrl, inviteToken],
  );

  const socialInviteUrl = useMemo(
    () => buildInviteShareUrl(shareInviteBaseUrl ?? inviteBaseUrl, inviteToken),
    [shareInviteBaseUrl, inviteBaseUrl, inviteToken],
  );

  const sharePayload = useMemo(
    () =>
      buildInviteSharePayload({
        inviteUrl: socialInviteUrl,
        coupleNames,
        shareImageUrl: shareHeroImageUrl,
      }),
    [socialInviteUrl, coupleNames, shareHeroImageUrl],
  );

  const isLocalCopyLink = useMemo(() => {
    try {
      const host = new URL(copyInviteUrlValue, "http://localhost").hostname.toLowerCase();
      return host === "localhost" || host === "127.0.0.1";
    } catch {
      return false;
    }
  }, [copyInviteUrlValue]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const flash = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 3200);
  }, []);

  const openShareTarget = useCallback((url: string, options?: { sameTab?: boolean }) => {
    if (options?.sameTab) {
      window.location.href = url;
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const onMessenger = useCallback(async () => {
    const copied = await copyInviteSharePayload(sharePayload);
    const mobile = isMobileUserAgent();

    if (!isPublicHttpsUrl(socialInviteUrl)) {
      openShareTarget(mobile ? "fb-messenger://" : "https://www.messenger.com/", { sameTab: mobile });
      flash(
        copied
          ? "Link copied — paste it into your Messenger chat."
          : "Paste your invite link into Messenger manually.",
      );
      setOpen(false);
      return;
    }

    if (mobile) {
      openShareTarget(messengerShareUrl(socialInviteUrl), { sameTab: true });
      flash(
        copied
          ? "Opening Messenger. If the link is rejected, paste from your clipboard."
          : "Opening Messenger…",
      );
      setOpen(false);
      return;
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
    const url = appId
      ? facebookMessengerSendDialogUrl(socialInviteUrl, appId, socialInviteUrl)
      : messengerWebShareUrl(socialInviteUrl);
    openShareTarget(url);
    flash(
      copied
        ? "Opening Messenger. If the link is rejected, paste from your clipboard."
        : "Opening Messenger…",
    );
    setOpen(false);
  }, [flash, socialInviteUrl, openShareTarget, sharePayload]);

  const onCopyLink = useCallback(async () => {
    const ok = await copyInviteUrl(copyInviteUrlValue);
    flash(
      ok
        ? "Link copied — paste it into Messenger, Instagram, or any chat."
        : "Select the link above and copy it manually (⌘C / Ctrl+C).",
    );
  }, [flash, copyInviteUrlValue]);

  const onInstagram = useCallback(async () => {
    const mobile = isMobileUserAgent();
    const copied = await copyInviteUrl(socialInviteUrl);

    if (!isPublicHttpsUrl(socialInviteUrl)) {
      openShareTarget(instagramDirectInboxHref(mobile), { sameTab: mobile });
      flash(
        copied
          ? "Link copied — paste it into your Instagram DM."
          : "Paste your invite link into Instagram manually.",
      );
      setOpen(false);
      return;
    }

    openShareTarget(instagramDirectInboxHref(mobile), { sameTab: mobile });
    flash(
      copied
        ? "Opening Instagram. Paste the invite link into your chat."
        : "Opening Instagram — paste your invite link into a DM.",
    );
    setOpen(false);
  }, [flash, socialInviteUrl, openShareTarget]);

  const triggerLabel = emailSentAt ? "Send reminder" : "Send invitation";

  const modal =
    open && mounted ? (
      <div className="m3-modal-overlay m3-admin-form">
        <button type="button" className="m3-modal-scrim" aria-label="Close" onClick={() => setOpen(false)} />
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="m3-modal-dialog">
          <h2 id={titleId} className="m3-modal-dialog__title">
            {triggerLabel}
          </h2>
          <p className="m3-field-support mb-4">
            Choose how to deliver this guest&apos;s invite link. On desktop, copy the link and paste it into any chat.
            Only email shows as &quot;Invitation sent&quot; on the dashboard.
          </p>

          <div className="flex flex-col gap-3">
            <form
              action={sendHouseholdInvitationEmail}
              onSubmit={() => setOpen(false)}
            >
              <input type="hidden" name="wedding_id" value={weddingId} />
              <input type="hidden" name="household_id" value={householdId} />
              <button
                type="submit"
                disabled={!hasEmail}
                title={
                  hasEmail
                    ? emailSentAt
                      ? "Sends the invitation email to this guest again."
                      : "Sends the invitation email to this guest."
                    : "Add an email in Edit household to send by email."
                }
                className="m3-btn m3-btn--filled m3-btn--block"
              >
                Send via email
              </button>
            </form>

            {!hasEmail ? (
              <p className="m3-field-support">
                No email on file — copy the link below or use Messenger / Instagram, or add an email under Edit
                household.
              </p>
            ) : null}

            <M3FilledTextField
              label="Invite link"
              name="invite_link"
              value={copyInviteUrlValue}
              readOnly
              supportingText={
                isLocalCopyLink
                  ? "Local testing link. Messenger / Instagram use the production link when sharing."
                  : "Select the link to copy manually, or use Copy link."
              }
              onFocus={(e) => e.currentTarget.select()}
            />

            <button
              type="button"
              className="m3-btn m3-btn--outlined m3-btn--block"
              onClick={() => void onCopyLink()}
            >
              Copy link
            </button>

            <button
              type="button"
              className="m3-btn m3-btn--outlined m3-btn--block"
              onClick={() => void onMessenger()}
            >
              Share on Messenger
            </button>

            <button type="button" className="m3-btn m3-btn--outlined m3-btn--block" onClick={() => void onInstagram()}>
              Share on Instagram
            </button>

            <button type="button" className="m3-btn m3-btn--text" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>

          {status ? <p className="m3-field-support mt-3">{status}</p> : null}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        className="m3-btn m3-btn--outlined m3-btn--compact m3-btn--block"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
