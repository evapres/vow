"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import KindlyRespondButton from "./KindlyRespondButton";
import {
  inviteNotoSerifLight18Class,
  toAllCapsNoAccents,
  type InvitationLanguage,
} from "@/lib/invitationDisplay";
import { monogramLettersFromCoupleNames, splitCoupleNameParts } from "@/lib/coupleInitials";
import {
  heroImageObjectPositionClass,
  parseHeroImagePosition,
  type HeroImagePosition,
} from "@/lib/heroImagePosition";
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
  /** Vertical crop focal point inside the polaroid frame. */
  photoPosition?: HeroImagePosition;
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

/** Full literal class strings so Tailwind includes spacing utilities (dynamic `gutter` breaks JIT). */
const inviteSectionBleedClass =
  "w-[calc(100%+2*var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px)))] max-w-none -mx-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))]";

const inviteMonogramWrapClass =
  "flex w-full flex-col items-center px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-4 pt-14 sm:pb-4 sm:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+10px)]";

const inviteMonogramWrapCompactClass =
  "flex w-full flex-col items-center px-[var(--invite-gutter)] pb-2 pt-8";

const inviteHeroRowClass =
  "flex w-full flex-col items-center justify-center gap-12 px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-[var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))] pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+10px)] sm:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))-10px)] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:pb-[var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))] lg:pl-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))+clamp(1.5rem,4vw,3rem))] lg:pr-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] lg:pt-[calc(var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))-10px)]";

/** Admin live preview at desktop reference width — matches invite `lg:` row layout. */
const inviteHeroRowDesktopPreviewClass =
  "flex w-full flex-row items-center justify-center gap-12 px-[var(--invite-gutter)] pb-[var(--invite-hero-details-gap)] pt-[calc(var(--invite-gutter)-10px)] pl-[calc(var(--invite-gutter)+1.25rem)] pr-[var(--invite-gutter)]";

const inviteHeroRowCompactClass =
  "flex w-full flex-row items-center justify-center gap-3 px-[var(--invite-gutter)] pb-5 pt-2";

const inviteCelebrateWrapClass =
  "px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] pb-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))+40px)] pt-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))+40px)] sm:pb-[var(--invite-block-edge,clamp(12px,calc(104*100vw/1440),104px))] sm:pt-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))-10px)] text-center";

/** Uploaded hero photos: B&W only (no contrast/brightness adjustment). */
function heroPhotoClass(position: HeroImagePosition): string {
  return `object-cover ${heroImageObjectPositionClass(position)} grayscale`;
}

export default function InvitationHeroBody({
  coupleNames,
  language = "en",
  eventDateLabel,
  venueLabel,
  photoSrc = inviteHeroDefaultSrc,
  photoPosition = "center",
  photoAlt = "Couple image",
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
  const resolvedPhotoPosition = parseHeroImagePosition(photoPosition);
  const heroPhotoClassName = heroPhotoClass(resolvedPhotoPosition);
  const src = (photoSrc ?? inviteHeroDefaultSrc).trim();
  /** Remote, data, and blob URLs are not served as static files — use `<img>`. */
  const shouldUseNativeImg = useNativeImgForPhoto || !src.startsWith("/");

  const initials = monogramLettersFromCoupleNames(coupleNames);
  const topMonogram =
    language === "el" && !topMonogramLetters ? null : (topMonogramLetters ?? initials);

  const dateComma = detailsDateTime.indexOf(",");
  const dateHead = dateComma >= 0 ? detailsDateTime.slice(0, dateComma).trim() : "";
  const dateTail = dateComma >= 0 ? detailsDateTime.slice(dateComma + 1).trim() : detailsDateTime;

  const detailsLocationDisplay = (detailsLocation ?? "").trim();
  const locParts = detailsLocationDisplay.split(",").map((s) => s.trim());
  const locLast = locParts.length > 1 ? locParts.pop() : "";
  const locLead = locParts.join(", ");

  const kindlyRespondBelow = "RSVP";

  const namePartsForInvite = splitCoupleNameParts(coupleNames);
  const inviteNameLeft = namePartsForInvite[0] ?? "";
  const inviteNameRight = namePartsForInvite[1] ?? "";
  const showInviteCoupleNames = Boolean(inviteNameLeft || inviteNameRight);
  const showInviteAmpersand = Boolean(inviteNameLeft && inviteNameRight);

  const inviteMessage =
    language === "el" ? "σας προσκαλούν στο γάμο τους." : "invite you to attend their wedding.";

  const namesClass = compactPreview ? heroNamesCompactClass : heroNamesClass;
  /** Invite sentence below stacked names — same Noto style as Greek on full invites. */
  const inviteMessageClass = compactPreview
    ? heroInviteCompactClass
    : inviteNotoSerifLight18Class;
  const monogramInitialClass = compactPreview
    ? inviteTopMonogramInitialCompactClass
    : inviteTopMonogramInitialClass;
  const monogramAmpersandClass = compactPreview
    ? inviteTopMonogramAmpersandCompactClass
    : inviteTopMonogramAmpersandClass;
  const topBarClass = inviteHeroTopBarClass;
  const celebrateLineClass = inviteCelebrateLineClass;

  const sectionClass =
    compactPreview || adminPreview ? "w-full max-w-none" : inviteSectionBleedClass;
  const monogramWrapClass = compactPreview
    ? inviteMonogramWrapCompactClass
    : inviteMonogramWrapClass;
  const heroRowClass = adminPreview
    ? inviteHeroRowDesktopPreviewClass
    : compactPreview
      ? inviteHeroRowCompactClass
      : inviteHeroRowClass;
  const celebrateWrapClass = inviteCelebrateWrapClass;

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
            className={`flex shrink-0 justify-center ${compactPreview ? "" : adminPreview ? "" : "max-lg:mb-4 translate-y-[10px] lg:translate-y-0"}`}
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
                      className={`absolute inset-0 h-full w-full ${heroPhotoClassName}`}
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={photoAlt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 94vw, 450px"
                      className={heroPhotoClassName}
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
            <p className="w-full text-center" style={{ fontFamily: "var(--font-heading)" }}>
              <span
                className={`mx-auto flex w-full max-w-xl flex-col items-center ${compactPreview ? "gap-3" : "gap-4 sm:gap-6"}`}
              >
                {showInviteCoupleNames ? (
                  <span className="flex w-full flex-col items-center gap-0">
                    {inviteNameLeft ? (
                      <span className={`${namesClass} block w-full text-center`}>
                        {toAllCapsNoAccents(inviteNameLeft)}
                      </span>
                    ) : null}
                    {showInviteAmpersand ? (
                      <span className={`${namesClass} block w-full text-center`}>&</span>
                    ) : null}
                    {inviteNameRight ? (
                      <span className={`${namesClass} block w-full text-center`}>
                        {toAllCapsNoAccents(inviteNameRight)}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                <span className={`${inviteMessageClass} block w-full text-center`}>
                  {toAllCapsNoAccents(inviteMessage)}
                </span>
              </span>
            </p>
            {!adminPreview ? (
              <KindlyRespondButton
                className={
                  compactPreview ? "mt-4" : "mt-10 sm:mt-14 lg:hidden"
                }
              >
                <span aria-hidden="true" className="text-[16px] font-normal leading-none">
                  ↓
                </span>
                {toAllCapsNoAccents(kindlyRespondBelow)}
              </KindlyRespondButton>
            ) : null}
          </div>
        </div>

        {!compactPreview ? (
          <div
            className={`w-full justify-center px-[var(--invite-gutter)] pb-6 ${adminPreview ? "flex" : "hidden lg:flex"}`}
          >
            <KindlyRespondButton>
              <span aria-hidden="true" className="text-[16px] font-normal leading-none">
                ↓
              </span>
              {toAllCapsNoAccents(kindlyRespondBelow)}
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
