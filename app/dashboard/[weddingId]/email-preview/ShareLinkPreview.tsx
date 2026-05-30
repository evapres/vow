"use client";

import { useState } from "react";

import { dashboardSharePreviewImagePath } from "@/lib/invite/dashboardSharePreviewImagePath";
import { inviteOgImagePath } from "@/lib/invite/inviteOgImagePath";

type ShareLinkPreviewProps = {
  weddingId: string;
  inviteToken: string;
};

/** Renders the link-preview image (couple photo when uploaded, else envelope composite). */
export default function ShareLinkPreview({ weddingId, inviteToken }: ShareLinkPreviewProps) {
  const primarySrc = dashboardSharePreviewImagePath(weddingId);
  const fallbackSrc = inviteOgImagePath(inviteToken);
  const [src, setSrc] = useState(primarySrc);
  const [failed, setFailed] = useState(false);

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
        {failed ? (
          <p className="m3-banner m3-banner--info" role="status">
            <span className="m3-banner__detail">
              Preview image could not load. Try refreshing, or open the link below in a new tab.
            </span>
          </p>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- authenticated preview API */}
        <img
          src={src}
          alt="Share link preview"
          className="mx-auto block h-auto min-h-[120px] w-full max-w-[520px] rounded-[var(--m3-shape-corner-sm)] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] shadow-sm object-contain"
          onError={() => {
            if (src !== fallbackSrc) {
              setSrc(fallbackSrc);
              return;
            }
            setFailed(true);
          }}
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
