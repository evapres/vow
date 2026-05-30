import { inviteOgImagePath } from "@/lib/invite/inviteOgImagePath";

type ShareLinkPreviewProps = {
  inviteToken: string;
};

/** Renders the same PNG used for Messenger / WhatsApp / iMessage link previews. */
export default function ShareLinkPreview({ inviteToken }: ShareLinkPreviewProps) {
  const src = inviteOgImagePath(inviteToken);

  return (
    <section className="m3-form-card mt-10 overflow-hidden p-0">
      <div className="border-b border-[var(--m3-outline-variant)] px-5 py-4">
        <p className="m3-data-card__title">Share link preview</p>
        <p className="m3-field-support mt-1">
          Uses your uploaded couple image when set; otherwise the envelope preview. This is what appears
          when you share the invite link.
        </p>
      </div>
      <div className="bg-[var(--m3-surface)] p-4 sm:p-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic OG PNG route */}
        <img
          src={src}
          alt="Share link preview — wedding invitation envelope"
          width={1200}
          height={630}
          className="mx-auto block w-full max-w-[520px] rounded-[var(--m3-shape-corner-sm)] border border-[var(--m3-outline-variant)] shadow-sm"
        />
        <p className="m3-field-support mt-4 text-center">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--m3-primary)] underline underline-offset-4 hover:opacity-80"
          >
            Open full size
          </a>
        </p>
      </div>
    </section>
  );
}
