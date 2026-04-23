"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import KindlyRespondButton from "./KindlyRespondButton";
import { invitationHeroTextureStyle, invitationPolaroidPaperStyle } from "./invitationDarkBandStyle";

/** Default hero image in the polaroid (public path). */
export const inviteHeroDefaultSrc = "/invite-hero-couple.png";

/** 450×450px at 1920px viewport (1440px card); same scale as invitation gutters. */
const polaroidPanelStyle = {
  // Slightly larger minimum so the photo feels prominent on mobile.
  "--invite-polaroid": "clamp(15.5rem, calc(450 * 100vw / 1920), 450px)",
} as CSSProperties;

/** Whole polaroid: 8° to the left (CCW). */
const polaroidTiltStyle: CSSProperties = {
  transform: "rotate(-8deg)",
  transformOrigin: "center center",
};

/** Small caps line under date/venue (e.g. optional reception note). */
const inviteMetaCaptionClass =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FAF6F2]/88";

export type InvitationHeroBodyProps = {
  coupleNames: string;
  eventDateLabel: string;
  venueLabel: string;
  /** Wedding hero URL or public path; defaults to invite couple photo. */
  photoSrc?: string;
  photoAlt?: string;
  /** Use a plain img for arbitrary remote URLs (e.g. admin live preview). */
  useNativeImgForPhoto?: boolean;
  /**
   * When set, the top monogram row always shows these two letters with & between them
   * (instead of full names when initials cannot be derived).
   */
  topMonogramLetters?: { left: string; right: string };
  detailsDateTime: string;
  detailsLocation: string;
  /** Shown under the venue block in small caps; omit or leave empty to hide. */
  note?: string | null;
};

function monogramInitials(coupleNames: string): { left: string; right: string } | null {
  const parts = coupleNames.split("&").map((p) => p.trim());
  const left = parts[0]?.[0] ?? "";
  const right = parts[1]?.[0] ?? "";
  if (!left || !right) return null;
  return { left: left.toUpperCase(), right: right.toUpperCase() };
}

export default function InvitationHeroBody({
  coupleNames,
  eventDateLabel,
  venueLabel,
  photoSrc = inviteHeroDefaultSrc,
  photoAlt = "Couple",
  useNativeImgForPhoto = false,
  topMonogramLetters,
  detailsDateTime,
  detailsLocation,
  note,
}: InvitationHeroBodyProps) {
  const src = (photoSrc ?? inviteHeroDefaultSrc).trim();
  /** Remote, data, and blob URLs are not served as static files — use `<img>`. */
  const shouldUseNativeImg = useNativeImgForPhoto || !src.startsWith("/");

  const initials = monogramInitials(coupleNames);
  const topMonogram = topMonogramLetters ?? initials;
  const namePair = coupleNames.includes("&")
    ? coupleNames
        .split("&")
        .map((s) => s.trim())
        .join(" & ")
    : coupleNames;

  const dateComma = detailsDateTime.indexOf(",");
  const dateHead = dateComma >= 0 ? detailsDateTime.slice(0, dateComma).trim() : "";
  const dateTail = dateComma >= 0 ? detailsDateTime.slice(dateComma + 1).trim() : detailsDateTime;

  const detailsLocationDisplay = detailsLocation.replace(/\bLagonissi\b/g, "Lagonisi");
  const locParts = detailsLocationDisplay.split(",").map((s) => s.trim());
  const locLast = locParts.length > 1 ? locParts.pop() : "";
  const locLead = locParts.join(", ");

  return (
    <section
      aria-label="Invitation"
      className="w-[calc(100%+2*var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px)))] max-w-none -mx-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))]"
    >
      <div className="text-[#FAF6F2]" style={invitationHeroTextureStyle}>
        {/* Monogram: full wrapper width; texture bleeds edge-to-edge on the card */}
        <div className="flex w-full flex-col items-center px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-4 pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+10px)]">
          <p
            className="flex items-end justify-center gap-1 text-center font-normal tracking-normal text-[#FAF6F2] sm:gap-1.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {topMonogram ? (
              <>
                <span className="text-[64px] leading-none">{topMonogram.left}</span>
                <span className="text-[32px] leading-none">&</span>
                <span className="text-[64px] leading-none">{topMonogram.right}</span>
              </>
            ) : (
              <span className="text-[64px] leading-none">{coupleNames}</span>
            )}
          </p>
        </div>

        {/* Rule + meta: inset by invitation gutter only; line spans full width between gutters */}
        <div className="px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-2">
          <div className="h-px w-full bg-[#FAF6F2]/12" />
          <div
            className={`mt-5 flex w-full items-center justify-between gap-6 ${inviteMetaCaptionClass}`}
          >
            <span className="min-w-0 text-left">{eventDateLabel}</span>
            <span className="min-w-0 text-right">{venueLabel}</span>
          </div>
        </div>

        {/* Hero: polaroid + copy — centered as a group; polaroid matches 450² at 1440 card width */}
        <div
          className="flex w-full flex-col items-center justify-center gap-12 px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-[var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))] pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+10px)] sm:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))-10px)] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:pb-[var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))] lg:pl-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+clamp(1.5rem,4vw,3rem))] lg:pr-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] lg:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))-10px)]"
          style={polaroidPanelStyle}
        >
          <div className="flex shrink-0 justify-center translate-y-[10px] lg:translate-y-0">
            <div
              className="flex h-[var(--invite-polaroid)] w-[var(--invite-polaroid)] max-w-full shrink-0 flex-col shadow-[0_28px_64px_rgba(0,0,0,0.42)]"
              style={{ ...polaroidTiltStyle, ...invitationPolaroidPaperStyle }}
            >
              <div className="relative min-h-0 w-full flex-1 px-[4%] pt-[4%]">
                <div
                  className="relative h-full min-h-0 w-full overflow-hidden"
                  style={invitationPolaroidPaperStyle}
                >
                  {shouldUseNativeImg ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary preview URLs
                    <img
                      src={src}
                      alt={photoAlt}
                      className="absolute inset-0 h-full w-full object-cover object-center grayscale"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={photoAlt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 94vw, 450px"
                      className="object-cover object-center grayscale"
                    />
                  )}
                </div>
              </div>
              <div
                className="h-[18%] min-h-[2.75rem] w-full shrink-0"
                style={invitationPolaroidPaperStyle}
                aria-hidden
              />
            </div>
          </div>

          <div className="flex w-full max-w-xl min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-[clamp(1.4rem,3.4vw,2.05rem)] leading-[1.35] text-[#FAF6F2]">
              <span
                style={{ fontFamily: "var(--font-heading)" }}
                className="text-[30px] font-normal tracking-[-1px] text-[#FAF6F2] sm:text-[40px]"
              >
                {namePair}
              </span>{" "}
              <span
                style={{ fontFamily: "var(--font-special)" }}
                className="mr-[0.35em] text-[40px] leading-[1.12] text-[#FAF6F2] sm:text-[54px]"
              >
                invite you to attend
              </span>
              <span
                style={{ fontFamily: "var(--font-heading)" }}
                className="text-[30px] font-normal tracking-[-1px] text-[#FAF6F2] sm:text-[40px]"
              >
                their wedding.
              </span>
            </p>
            <KindlyRespondButton className="mt-6 sm:mt-10">
              <span aria-hidden="true" className="text-[15px] font-normal leading-none">
                ↓
              </span>
              Kindly respond below
            </KindlyRespondButton>
          </div>
        </div>

        {/* Celebrate — centered */}
        <div className="px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-[var(--invite-block-edge,clamp(12px,calc(104*100vw/1440),104px))] pt-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))+40px)] sm:pt-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))-10px)] text-center">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.38em] text-[#FAF6F2]/70">
            Celebrate with us
          </p>
          <p className="mt-2 w-full text-[#FAF6F2]">
            <span className="block">
              {dateHead ? (
                <>
                  <span
                    style={{ fontFamily: "var(--font-special)" }}
                    className="text-[54px] font-normal leading-[1.12] tracking-[0.03em]"
                  >
                    {dateHead}
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-heading)" }}
                    className="text-[32px] font-normal leading-[32px] tracking-[-1px]"
                  >
                    , {dateTail}
                  </span>
                </>
              ) : (
                <span
                  style={{ fontFamily: "var(--font-heading)" }}
                  className="text-[32px] font-normal leading-[32px] tracking-[-1px]"
                >
                  {detailsDateTime}
                </span>
              )}
            </span>
            <span className="block text-[#FAF6F2]/95">
              {locLast ? (
                <>
                  <span
                    style={{ fontFamily: "var(--font-heading)" }}
                    className="text-[32px] font-normal leading-[32px] tracking-[-1px]"
                  >
                    {locLead}
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-heading)" }}
                    className="text-[32px] font-normal leading-[32px] tracking-[-1px]"
                  >
                    ,{" "}
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-special)" }}
                    className="text-[54px] font-normal leading-[1.12] tracking-[0.03em]"
                  >
                    {locLast}
                  </span>
                </>
              ) : (
                <span
                  style={{ fontFamily: "var(--font-heading)" }}
                  className="text-[32px] font-normal leading-[32px] tracking-[-1px]"
                >
                  {detailsLocationDisplay}
                </span>
              )}
            </span>
          </p>
          {note?.trim() ? (
            <p className={`mt-4 text-center ${inviteMetaCaptionClass}`}>{note.trim()}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
