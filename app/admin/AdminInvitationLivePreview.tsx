"use client";

import { memo, useMemo } from "react";

import InvitationHeroBody from "@/app/components/InvitationHeroBody";
import OutlineSilkButton from "@/app/components/OutlineSilkButton";
import SolidSilkButton from "@/app/components/SolidSilkButton";
import AdminInvitationFitPreview from "@/app/components/m3/AdminInvitationFitPreview";
import { proportionalInvitationVars } from "@/lib/adminInvitationPreview";
import { getInvitationTheme, type InvitationThemeId } from "@/lib/invitationThemes";
import {
  combineWeddingDateAndTime,
  formatDetailsDateTime,
  formatHeaderDateLabel,
  formatRsvpDeadlineLabel,
  toAllCapsNoAccents,
} from "@/lib/invitationDisplay";
import { celebrateLocationLineFromParts } from "@/lib/weddingLocation";

const adminPreviewFrameStyle = proportionalInvitationVars();

const PREVIEW_SAMPLE_DETAILS_DATETIME = "Saturday, July 11 2026 at 8:00 PM";
const PREVIEW_SAMPLE_DATE_FOR_HEADER = "2026-07-11";
const PREVIEW_SAMPLE_VENUE = "ISLAND";
const PREVIEW_SAMPLE_DETAILS_LOCATION = "George Town, Brighton, BN1 3HG";

function previewTopMonogramFromCoupleNames(names: string): { left: string; right: string } {
  const parts = names.split("&").map((p) => p.trim());
  const left = parts[0]?.[0];
  const right = parts[1]?.[0];
  if (left && right) {
    return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
  }
  return { left: "A", right: "B" };
}

export type AdminInvitationLivePreviewProps = {
  coupleNames: string;
  language: "en" | "el";
  invitationTheme: InvitationThemeId;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  churchName: string;
  streetAddress: string;
  rsvpDeadline: string;
  note: string;
  photoSrc: string;
};

function AdminInvitationLivePreview({
  coupleNames,
  language,
  invitationTheme,
  weddingDate,
  weddingTime,
  venueName,
  churchName,
  streetAddress,
  rsvpDeadline,
  note,
  photoSrc,
}: AdminInvitationLivePreviewProps) {
  const previewTheme = useMemo(() => getInvitationTheme(invitationTheme), [invitationTheme]);

  const weddingDateTimeIso = useMemo(
    () => combineWeddingDateAndTime(weddingDate || null, weddingTime || null),
    [weddingDate, weddingTime],
  );

  const previewDetailsDateTime = weddingDateTimeIso
    ? formatDetailsDateTime(weddingDateTimeIso, language)
    : PREVIEW_SAMPLE_DETAILS_DATETIME;
  const previewCelebrateLine = celebrateLocationLineFromParts(churchName, venueName, streetAddress);
  const previewDetailsLocation =
    previewCelebrateLine ||
    celebrateLocationLineFromParts("", PREVIEW_SAMPLE_VENUE, PREVIEW_SAMPLE_DETAILS_LOCATION);
  const previewEventDateLabel = weddingDate.trim()
    ? formatHeaderDateLabel(weddingDate, language)
    : formatHeaderDateLabel(PREVIEW_SAMPLE_DATE_FOR_HEADER, language);
  const previewVenueLabel = venueName.trim() || PREVIEW_SAMPLE_VENUE;
  const previewTopMonogram = useMemo(() => {
    if (language === "el") return undefined;
    return previewTopMonogramFromCoupleNames(coupleNames);
  }, [coupleNames, language]);

  const rsvpLine = useMemo(
    () => formatRsvpDeadlineLabel(rsvpDeadline, language) || "—",
    [rsvpDeadline, language],
  );

  const previewT =
    language === "el"
      ? {
          willYouAttend: "RSVP",
          pleaseRespondBy: `Παρακαλούμε απαντήστε έως ${rsvpLine}`,
          previewOnly: "Μόνο προεπισκόπηση — το RSVP δεν αποθηκεύεται από εδώ",
          confirm: "ΘΑ ΠΑΡΕΥΡΕΘΩ",
          unable: "ΔΕ ΘΑ ΠΑΡΕΥΡΕΘΩ",
        }
      : {
          willYouAttend: "RSVP",
          pleaseRespondBy: `Please respond by ${rsvpLine}`,
          previewOnly: "Preview only — RSVP is not saved from here",
          confirm: "CONFIRM ATTENDANCE",
          unable: "UNABLE TO ATTEND",
        };

  return (
    <div className="m3-form-preview min-w-0">
      <AdminInvitationFitPreview panelStyle={previewTheme.pageCanvasStrip}>
        <div className="relative w-full min-w-0 font-sans text-[#181818]" style={adminPreviewFrameStyle}>
          <InvitationHeroBody
            adminPreview
            useNativeImgForPhoto
            coupleNames={coupleNames}
            language={language}
            theme={invitationTheme}
            eventDateLabel={previewEventDateLabel}
            venueLabel={previewVenueLabel}
            photoSrc={photoSrc}
            topMonogramLetters={previewTopMonogram}
            detailsDateTime={previewDetailsDateTime}
            detailsLocation={previewDetailsLocation}
            note={note.trim() || undefined}
          />

          <section
            id="rsvp"
            aria-label="RSVP preview"
            className="m3-form-preview__rsvp w-[calc(100%+2*var(--invite-gutter))] max-w-none -mx-[var(--invite-gutter)]"
          >
            <div className="h-4 w-full shrink-0 bg-transparent" aria-hidden />
            <div
              className="w-full px-[var(--invite-gutter)] py-[calc(var(--invite-gutter)*1.75)] text-[#FCFCF6]"
              style={previewTheme.rsvpBand}
            >
              <div className="mx-auto w-full max-w-full text-center">
                <div className="flex flex-col gap-[var(--invite-preview-rsvp-gap)]">
                  <h3
                    className="text-[length:var(--invite-preview-rsvp-title)] font-normal leading-[1.05] tracking-[0.02em] text-[#FAF6F2]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {previewT.willYouAttend}
                  </h3>
                  <p className="text-[9px] font-semibold tracking-[0.16em] text-white/70">
                    {toAllCapsNoAccents(previewT.pleaseRespondBy)}
                  </p>
                </div>
                <p className="mt-[var(--invite-preview-rsvp-gap)] text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[#FCFCF6]/55">
                  {toAllCapsNoAccents(previewT.previewOnly)}
                </p>
                <div className="pointer-events-none mt-[calc(var(--invite-preview-rsvp-gap)*1.5)] flex flex-col items-center gap-3 opacity-[0.72]">
                  <SolidSilkButton
                    type="button"
                    fill={previewTheme.rsvpSolidButtonBg}
                    borderColor={previewTheme.rsvpSolidButtonBorder}
                    wrapperClassName="h-[52px] w-full max-w-[360px]"
                  >
                    {toAllCapsNoAccents(previewT.confirm)}
                  </SolidSilkButton>
                  <OutlineSilkButton
                    type="button"
                    wrapperClassName="h-[52px] w-full max-w-[360px]"
                    buttonClassName="text-[#FAF6F2]/85 hover:text-[#FAF6F2]"
                  >
                    {toAllCapsNoAccents(previewT.unable)}
                  </OutlineSilkButton>
                </div>
              </div>
            </div>
          </section>
        </div>
      </AdminInvitationFitPreview>
    </div>
  );
}

export default memo(AdminInvitationLivePreview);
