"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import KindlyRespondButton from "./KindlyRespondButton";
import {
  inviteNotoSerifLight18Class,
  toAllCapsNoAccents,
  type InvitationLanguage,
} from "@/lib/invitationDisplay";
import { getInvitationTheme, type InvitationThemeId } from "@/lib/invitationThemes";

import { invitationPolaroidPaperStyle } from "./invitationDarkBandStyle";

/** Default hero image in the polaroid (public path). */
export const inviteHeroDefaultSrc = "/invite-hero-couple.png";


/** Whole polaroid: 8° to the left (CCW). */
const polaroidTiltStyle: CSSProperties = {
  transform: "rotate(-8deg)",
  transformOrigin: "center center",
};

/** Hero couple names + & — smaller on mobile to avoid awkward breaks. */
const heroNamesClass =
  "font-serif text-[30px] font-light leading-[36px] tracking-[3px] [font-family:var(--font-heading)] sm:text-[40px] sm:leading-[46px] sm:tracking-[5px] md:text-[48px] md:leading-[54px] md:tracking-[8px]";

const heroNamesCompactClass =
  "font-serif text-[22px] font-light leading-[28px] tracking-[2px] [font-family:var(--font-heading)]";

/** Top monogram initials (not the full-name spec). */
const inviteTopMonogramInitialClass =
  "font-serif text-[36px] font-normal leading-none [font-family:var(--font-heading)] sm:text-[40px] md:text-[64px]";

/** Top monogram & between initials. */
const inviteTopMonogramAmpersandClass =
  "font-serif text-[22px] font-normal leading-none [font-family:var(--font-heading)] sm:text-[24px] md:text-[32px]";

const inviteTopMonogramInitialCompactClass =
  "font-serif text-[28px] font-normal leading-none [font-family:var(--font-heading)]";

const inviteTopMonogramAmpersandCompactClass =
  "font-serif text-[18px] font-normal leading-none [font-family:var(--font-heading)]";

/** English invite line after names. */
const heroInviteLightClass =
  "text-[18px] font-light leading-[26px] tracking-normal sm:text-[22px] sm:leading-[32px] md:text-[32px] md:leading-[48px]";

const heroInviteCompactClass = "text-[13px] font-light leading-[18px] tracking-normal";

/** Top meta bar (date + venue): Noto Serif Display, light, 2px tracking. */
const inviteHeroTopBarClass =
  "font-serif text-[12px] font-light tracking-[1px] [font-family:var(--font-heading)] sm:text-[14px] sm:tracking-[2px] md:text-[18px]";

/** Celebrate date/time + location — Noto Serif, light, 0.5px tracking. */
const inviteCelebrateLineClass =
  "text-[20px] font-light leading-[28px] tracking-[0.5px] [font-family:var(--font-noto-serif)] md:text-[24px] md:leading-[32px]";

export type InvitationHeroBodyProps = {
  coupleNames: string;
  language?: InvitationLanguage;
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
  theme?: InvitationThemeId;
  /** Admin side preview: compact card, no bleed, no celebrate block. */
  compactPreview?: boolean;
  /** Admin live preview: mobile proportions, no viewport breakpoints, proportional spacing tokens. */
  adminPreview?: boolean;
};

/** Mobile-scale type only — used when `adminPreview` (avoids sm/md/lg inside a scaled panel). */
const inviteTopMonogramInitialPreviewClass =
  "font-serif text-[36px] font-normal leading-none [font-family:var(--font-heading)]";

const inviteTopMonogramAmpersandPreviewClass =
  "font-serif text-[22px] font-normal leading-none [font-family:var(--font-heading)]";

const heroNamesPreviewClass =
  "font-serif text-[30px] font-light leading-[36px] tracking-[3px] [font-family:var(--font-heading)]";

const heroInvitePreviewClass = "text-[18px] font-light leading-[26px] tracking-normal";

const inviteHeroTopBarPreviewClass =
  "font-serif text-[12px] font-light tracking-[1px] [font-family:var(--font-heading)]";

const inviteCelebrateLinePreviewClass =
  "text-[20px] font-light leading-[28px] tracking-[0.5px] [font-family:var(--font-noto-serif)]";

/** Full literal class strings so Tailwind includes spacing utilities (dynamic `gutter` breaks JIT). */
const inviteSectionBleedClass =
  "w-[calc(100%+2*var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px)))] max-w-none -mx-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))]";

const inviteMonogramWrapClass =
  "flex w-full flex-col items-center px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-4 pt-14 sm:pb-4 sm:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+10px)]";

const inviteMonogramWrapAdminClass =
  "flex w-full flex-col items-center px-[var(--invite-gutter)] pb-2 pt-[max(3.5rem,calc(var(--invite-gutter)+10px))]";

const inviteMonogramWrapCompactClass =
  "flex w-full flex-col items-center px-[var(--invite-gutter)] pb-2 pt-8";

const inviteHeroRowClass =
  "flex w-full flex-col items-center justify-center gap-12 px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-[var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))] pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+10px)] sm:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))-10px)] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:pb-[var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))] lg:pl-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+clamp(1.5rem,4vw,3rem))] lg:pr-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] lg:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))-10px)]";

const inviteHeroRowAdminClass =
  "flex w-full flex-col items-center justify-center gap-[var(--invite-hero-details-gap)] px-[var(--invite-gutter)] pb-[var(--invite-hero-details-gap)] pt-[calc(var(--invite-gutter)+10px)]";

const inviteHeroRowCompactClass =
  "flex w-full flex-row items-center justify-center gap-3 px-[var(--invite-gutter)] pb-5 pt-2";

const inviteCelebrateWrapClass =
  "px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))+40px)] pt-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))+40px)] sm:pb-[var(--invite-block-edge,clamp(12px,calc(104*100vw/1440),104px))] sm:pt-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))-10px)] text-center";

const inviteCelebrateWrapAdminClass =
  "px-[var(--invite-gutter)] pb-[var(--invite-block-edge)] pt-[var(--invite-hero-details-gap)] text-center";

/** All hero photos (uploaded or default): soft B&W even when the source is color. */
const heroPhotoFilterClass =
  "object-cover object-center grayscale contrast-[0.82] brightness-[1.1]";

function monogramInitials(coupleNames: string): { left: string; right: string } | null {
  const parts = coupleNames.split("&").map((p) => p.trim());
  const left = parts[0]?.[0] ?? "";
  const right = parts[1]?.[0] ?? "";
  if (!left || !right) return null;
  return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
}

export default function InvitationHeroBody({
  coupleNames,
  language = "en",
  eventDateLabel,
  venueLabel,
  photoSrc = inviteHeroDefaultSrc,
  photoAlt = "Couple",
  useNativeImgForPhoto = false,
  topMonogramLetters,
  detailsDateTime,
  detailsLocation,
  note,
  theme,
  compactPreview = false,
  adminPreview = false,
}: InvitationHeroBodyProps) {
  const themeStyles = getInvitationTheme(theme);
  const src = (photoSrc ?? inviteHeroDefaultSrc).trim();
  /** Remote, data, and blob URLs are not served as static files — use `<img>`. */
  const shouldUseNativeImg = useNativeImgForPhoto || !src.startsWith("/");

  const initials = monogramInitials(coupleNames);
  const topMonogram =
    language === "el" && !topMonogramLetters ? null : (topMonogramLetters ?? initials);
  const namePair = coupleNames.includes("&")
    ? coupleNames
        .split("&")
        .map((s) => s.trim())
        .join(" & ")
    : coupleNames;

  const dateComma = detailsDateTime.indexOf(",");
  const dateHead = dateComma >= 0 ? detailsDateTime.slice(0, dateComma).trim() : "";
  const dateTail = dateComma >= 0 ? detailsDateTime.slice(dateComma + 1).trim() : detailsDateTime;

  const detailsLocationDisplay = (detailsLocation ?? "").trim();
  const locParts = detailsLocationDisplay.split(",").map((s) => s.trim());
  const locLast = locParts.length > 1 ? locParts.pop() : "";
  const locLead = locParts.join(", ");

  const t =
    language === "el"
      ? {
          kindlyRespondBelow: "RSVP",
        }
      : {
          inviteYouToAttend: "invite you to attend ",
          kindlyRespondBelow: "RSVP",
        };

  const namePartsForGreek = coupleNames
    .split("&")
    .map((p) => p.trim())
    .filter(Boolean);

  const greekLeft = namePartsForGreek[0] || coupleNames || "Μας";
  const greekRight = namePartsForGreek[1] || "";

  const namesClass = adminPreview
    ? heroNamesPreviewClass
    : compactPreview
      ? heroNamesCompactClass
      : heroNamesClass;
  const inviteLineClass = adminPreview
    ? heroInvitePreviewClass
    : compactPreview
      ? heroInviteCompactClass
      : heroInviteLightClass;
  const monogramInitialClass = adminPreview
    ? inviteTopMonogramInitialPreviewClass
    : compactPreview
      ? inviteTopMonogramInitialCompactClass
      : inviteTopMonogramInitialClass;
  const monogramAmpersandClass = adminPreview
    ? inviteTopMonogramAmpersandPreviewClass
    : compactPreview
      ? inviteTopMonogramAmpersandCompactClass
      : inviteTopMonogramAmpersandClass;
  const topBarClass = adminPreview ? inviteHeroTopBarPreviewClass : inviteHeroTopBarClass;
  const celebrateLineClass = adminPreview ? inviteCelebrateLinePreviewClass : inviteCelebrateLineClass;

  const sectionClass = compactPreview ? "w-full max-w-none" : inviteSectionBleedClass;
  const monogramWrapClass = adminPreview
    ? inviteMonogramWrapAdminClass
    : compactPreview
      ? inviteMonogramWrapCompactClass
      : inviteMonogramWrapClass;
  const heroRowClass = adminPreview
    ? inviteHeroRowAdminClass
    : compactPreview
      ? inviteHeroRowCompactClass
      : inviteHeroRowClass;
  const celebrateWrapClass = adminPreview ? inviteCelebrateWrapAdminClass : inviteCelebrateWrapClass;

  return (
    <section aria-label="Invitation" className={sectionClass}>
      <div className="text-[#FAF6F2]/85" style={themeStyles.heroTexture}>
        {/* Monogram: full wrapper width; texture bleeds edge-to-edge on the card */}
        <div className={monogramWrapClass}>
          <p
            className={`flex items-end justify-center text-center ${adminPreview ? "gap-1" : "gap-1 sm:gap-1.5"}`}
          >
            {topMonogram ? (
              <>
                <span className={monogramInitialClass}>{topMonogram.left}</span>
                <span className={monogramAmpersandClass}>&</span>
                <span className={monogramInitialClass}>{topMonogram.right}</span>
              </>
            ) : (
              <span className={namesClass}>{toAllCapsNoAccents(coupleNames)}</span>
            )}
          </p>
        </div>

        {/* Rule + meta: inset by invitation gutter only; line spans full width between gutters */}
        <div className={`px-[var(--invite-gutter)] ${compactPreview ? "pb-1" : "pb-2"}`}>
          <div className="h-px w-full bg-[#FAF6F2]/12" />
          <div
            className={`${adminPreview ? "mt-3" : "mt-5"} flex w-full flex-row items-center justify-between gap-3 ${adminPreview ? "" : "sm:gap-6"} ${topBarClass}`}
          >
            <span className="min-w-0 shrink text-left">{toAllCapsNoAccents(eventDateLabel)}</span>
            <span className="min-w-0 shrink text-right">{toAllCapsNoAccents(venueLabel)}</span>
          </div>
        </div>

        {/* Hero: polaroid + copy — centered as a group; polaroid matches 450² at 1440 card width */}
        <div className={heroRowClass}>
          <div
            className={`flex shrink-0 justify-center ${adminPreview ? "mb-4" : compactPreview ? "" : "max-lg:mb-4 translate-y-[10px] lg:translate-y-0"}`}
          >
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
                      className={`absolute inset-0 h-full w-full ${heroPhotoFilterClass}`}
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={photoAlt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 94vw, 450px"
                      className={heroPhotoFilterClass}
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

          <div
            className={`flex min-w-0 flex-col items-center text-center ${compactPreview ? "w-full flex-1" : "w-full max-w-xl"}`}
          >
            <p style={{ fontFamily: "var(--font-heading)" }}>
              {language === "el" ? (
                <span
                  className={`inline-flex flex-col items-center ${adminPreview ? "gap-3" : "gap-4 sm:gap-6"}`}
                >
                  <span className="flex flex-col items-center">
                    <span className={namesClass}>
                      {toAllCapsNoAccents(greekLeft)}
                    </span>
                    {greekRight ? (
                      <>
                        <span className={namesClass}>&</span>
                        <span className={namesClass}>
                          {toAllCapsNoAccents(greekRight)}
                        </span>
                      </>
                    ) : null}
                  </span>
                  <span className={inviteNotoSerifLight18Class}>
                    {toAllCapsNoAccents("σας προσκαλούν στο γάμο τους.")}
                  </span>
                </span>
              ) : (
                <>
                  <span className={namesClass}>{toAllCapsNoAccents(namePair)}</span>{" "}
                  <span className={inviteLineClass}>
                    {t.inviteYouToAttend}their wedding.
                  </span>
                </>
              )}
            </p>
            <KindlyRespondButton
              className={
                compactPreview ? "mt-4" : adminPreview ? "mt-6" : "mt-10 sm:mt-14 lg:hidden"
              }
            >
              <span aria-hidden="true" className="text-[16px] font-normal leading-none">
                ↓
              </span>
              {toAllCapsNoAccents(t.kindlyRespondBelow)}
            </KindlyRespondButton>
          </div>
        </div>

        {!compactPreview && !adminPreview ? (
          <div className="hidden w-full justify-center px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-6 lg:flex">
            <KindlyRespondButton>
              <span aria-hidden="true" className="text-[16px] font-normal leading-none">
                ↓
              </span>
              {toAllCapsNoAccents(t.kindlyRespondBelow)}
            </KindlyRespondButton>
          </div>
        ) : null}

        {!compactPreview ? (
        <div className={celebrateWrapClass}>
          <div className={`w-full ${adminPreview ? "" : "mt-2"}`}>
            <p>
              {dateHead ? (
                <span className={celebrateLineClass}>
                  {toAllCapsNoAccents(dateHead)}, {toAllCapsNoAccents(dateTail)}
                </span>
              ) : (
                <span className={celebrateLineClass}>
                  {toAllCapsNoAccents(detailsDateTime)}
                </span>
              )}
            </p>
            <p className={adminPreview ? "mt-3" : "mt-4"}>
              {locLast ? (
                <span className={celebrateLineClass}>
                  {toAllCapsNoAccents(`${locLead}, ${locLast}`)}
                </span>
              ) : (
                <span className={celebrateLineClass}>
                  {toAllCapsNoAccents(detailsLocationDisplay)}
                </span>
              )}
            </p>
          </div>
          {note?.trim() ? (
            <p
              className={`text-center ${adminPreview ? "mt-6 mb-4" : "mt-12 mb-10 sm:mb-0"} ${inviteNotoSerifLight18Class}`}
            >
              {toAllCapsNoAccents(note.trim())}
            </p>
          ) : null}
        </div>
        ) : null}
      </div>
    </section>
  );
}
