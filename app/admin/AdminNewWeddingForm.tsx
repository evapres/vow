"use client";

import Link from "next/link";
import type { ChangeEvent, CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import InvitationHeroBody, { inviteHeroDefaultSrc } from "@/app/components/InvitationHeroBody";
import OutlineSilkButton from "@/app/components/OutlineSilkButton";
import SolidSilkButton from "@/app/components/SolidSilkButton";
import { invitationRsvpBandStyle } from "@/app/components/invitationDarkBandStyle";
import {
  combineWeddingDateAndTime,
  formatDetailsDateTime,
  formatHeaderDateLabel,
  inviteMetaCaptionClass,
  toAllCapsNoAccents,
} from "@/lib/invitationDisplay";
import { celebrateLocationLineFromParts } from "@/lib/weddingLocation";

import { createWedding, updateWedding } from "./actions";

export type AdminWeddingFormInitial = {
  coupleNames: string;
  language: "en" | "el";
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  churchName: string;
  streetAddress: string;
  heroImageUrl: string | null;
  rsvpDeadline: string;
  note: string;
};

type AdminNewWeddingFormProps = {
  /** When set, form updates this wedding (same layout as create). */
  editWeddingId?: string;
  initial?: AdminWeddingFormInitial;
};

function formatRsvpDeadlineLine(isoDate: string): string {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d);
}

/** First letters of names around `&`, or sample monogram until both sides are present. */
function previewTopMonogramFromCoupleNames(names: string): { left: string; right: string } {
  const parts = names.split("&").map((p) => p.trim());
  const left = parts[0]?.[0];
  const right = parts[1]?.[0];
  if (left && right) {
    return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
  }
  return { left: "A", right: "B" };
}

const invitationFrameStyle = {
  "--invite-gutter": "clamp(12px, calc(96 * 100vw / 1920), 96px)",
  "--invite-hero-details-gap": "clamp(12px, calc(80 * 100vw / 1920), 80px)",
  "--invite-block-edge": "clamp(12px, calc(104 * 100vw / 1440), 104px)",
} as CSSProperties;

/** Shown in the live invitation preview until the admin enters their own values. */
const PREVIEW_SAMPLE_DETAILS_DATETIME = "Saturday, July 11 2026 at 8:00 PM";
const PREVIEW_SAMPLE_DATE_FOR_HEADER = "2026-07-11";
const PREVIEW_SAMPLE_VENUE = "ISLAND";
const PREVIEW_SAMPLE_DETAILS_LOCATION = "George Town, Brighton, BN1 3HG";

function initialHeroSrc(initial: AdminWeddingFormInitial | undefined): string {
  const u = initial?.heroImageUrl?.trim();
  if (u) return u;
  return inviteHeroDefaultSrc;
}

export default function AdminNewWeddingForm({ editWeddingId, initial }: AdminNewWeddingFormProps) {
  const isEdit = Boolean(editWeddingId);
  const [coupleNames, setCoupleNames] = useState(initial?.coupleNames ?? "");
  const [language, setLanguage] = useState<"en" | "el">(initial?.language ?? "en");
  const [weddingDate, setWeddingDate] = useState(initial?.weddingDate ?? "");
  const [weddingTime, setWeddingTime] = useState(initial?.weddingTime ?? "20:00");
  const [venueName, setVenueName] = useState(initial?.venueName ?? "");
  const [churchName, setChurchName] = useState(initial?.churchName ?? "");
  const [streetAddress, setStreetAddress] = useState(initial?.streetAddress ?? "");
  const [heroPreviewSrc, setHeroPreviewSrc] = useState(() => initialHeroSrc(initial));
  const [rsvpDeadline, setRsvpDeadline] = useState(
    initial?.rsvpDeadline ? initial.rsvpDeadline.slice(0, 10) : "",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [clearHeroForSubmit, setClearHeroForSubmit] = useState(false);

  const heroBlobUrlRef = useRef<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (heroBlobUrlRef.current) {
        URL.revokeObjectURL(heroBlobUrlRef.current);
        heroBlobUrlRef.current = null;
      }
    };
  }, []);

  const photoSrc = heroPreviewSrc;

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

  const rsvpLine = useMemo(() => formatRsvpDeadlineLine(rsvpDeadline), [rsvpDeadline]);
  const previewTopMonogram = useMemo(() => previewTopMonogramFromCoupleNames(coupleNames), [coupleNames]);

  const previewT =
    language === "el"
      ? {
          weWouldLove: "ΘΑ ΧΑΡΟΥΜΕ ΠΟΛΥ ΝΑ ΕΙΣΤΕ ΜΑΖΙ ΜΑΣ",
          willYouAttend: "Επιβεβαιώστε την παρουσία σας",
          pleaseRespondBy: `Παρακαλούμε απαντήστε έως ${rsvpLine}`,
          previewOnly: "Μόνο προεπισκόπηση — το RSVP δεν αποθηκεύεται από εδώ",
          confirm: "ΘΑ ΠΑΡΕΥΡΕΘΩ",
          unable: "ΔΕ ΘΑ ΠΑΡΕΥΡΕΘΩ",
        }
      : {
          weWouldLove: "WE WOULD LOVE FOR YOU TO JOIN US",
          willYouAttend: "Will you attend?",
          pleaseRespondBy: `Please respond by ${rsvpLine}`,
          previewOnly: "Preview only — RSVP is not saved from here",
          confirm: "CONFIRM ATTENDANCE",
          unable: "UNABLE TO ATTEND",
        };

  const clearHeroImage = () => {
    if (heroBlobUrlRef.current) {
      URL.revokeObjectURL(heroBlobUrlRef.current);
      heroBlobUrlRef.current = null;
    }
    setHeroPreviewSrc(inviteHeroDefaultSrc);
    if (heroFileInputRef.current) heroFileInputRef.current.value = "";
    if (isEdit) setClearHeroForSubmit(true);
  };

  const onHeroFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearHeroImage();
      return;
    }
    if (isEdit) setClearHeroForSubmit(false);
    if (heroBlobUrlRef.current) {
      URL.revokeObjectURL(heroBlobUrlRef.current);
      heroBlobUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    heroBlobUrlRef.current = url;
    setHeroPreviewSrc(url);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-12">
      <form
        action={isEdit ? updateWedding : createWedding}
        encType="multipart/form-data"
        className="min-w-0 space-y-5 border border-[#181818]/20 bg-transparent p-6"
      >
        {isEdit && editWeddingId ? <input type="hidden" name="wedding_id" value={editWeddingId} /> : null}
        {isEdit ? <input type="hidden" name="clear_hero" value={clearHeroForSubmit ? "1" : "0"} /> : null}
        <div>
          <label
            htmlFor="language"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Language
          </label>
          <select
            id="language"
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value === "el" ? "el" : "en")}
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          >
            <option value="en">English</option>
            <option value="el">Greek</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="couple_names"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Couple names <span className="text-red-700">*</span>
          </label>
          <input
            id="couple_names"
            name="couple_names"
            type="text"
            required
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
            placeholder="e.g. Nestor & Evangelia"
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
        </div>

        <div>
          <label
            htmlFor="wedding_date"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Wedding date
          </label>
          <input
            id="wedding_date"
            name="wedding_date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
        </div>

        <div>
          <label
            htmlFor="wedding_time"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Event time
          </label>
          <input
            id="wedding_time"
            name="wedding_time"
            type="time"
            value={weddingTime}
            onChange={(e) => setWeddingTime(e.target.value)}
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
        </div>

        <div>
          <label
            htmlFor="venue_name"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Venue name
          </label>
          <input
            id="venue_name"
            name="venue_name"
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder={`e.g. ${PREVIEW_SAMPLE_VENUE}`}
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
          <p className="mt-1 text-[11px] text-[#181818]/55">Shown top-right on the invitation (with the date).</p>
        </div>

        <div>
          <label
            htmlFor="church_name"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Church name <span className="font-normal normal-case tracking-normal text-[#181818]/55">(optional)</span>
          </label>
          <input
            id="church_name"
            name="church_name"
            type="text"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            placeholder="e.g. St. Demetrius Church"
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
        </div>

        <div>
          <label
            htmlFor="street_address"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Street address
          </label>
          <input
            id="street_address"
            name="street_address"
            type="text"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder={`e.g. ${PREVIEW_SAMPLE_DETAILS_LOCATION}`}
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
          <p className="mt-1 text-[11px] text-[#181818]/55">
            Shown under the date with church (if any). Leave church blank if the ceremony is at the venue.
          </p>
        </div>

        <div>
          <label
            htmlFor="hero_image"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Hero image
          </label>
          <input
            ref={heroFileInputRef}
            id="hero_image"
            name="hero_image"
            type="file"
            accept="image/*"
            onChange={onHeroFileChange}
            className="mt-2 block w-full text-sm text-[#181818] file:mr-3 file:border file:border-[#181818]/30 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#181818]"
          />
          <p className="mt-1 text-[11px] text-[#181818]/55">JPEG or PNG, up to 4MB. Optional.</p>
          {heroPreviewSrc !== inviteHeroDefaultSrc ? (
            <button
              type="button"
              onClick={clearHeroImage}
              className="mt-2 text-xs font-medium text-[#181818]/80 underline underline-offset-4 hover:text-[#181818]"
            >
              Remove image
            </button>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="rsvp_deadline"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            RSVP deadline
          </label>
          <input
            id="rsvp_deadline"
            name="rsvp_deadline"
            type="date"
            value={rsvpDeadline}
            onChange={(e) => setRsvpDeadline(e.target.value)}
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
        </div>

        <div>
          <label
            htmlFor="note"
            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#181818]/70"
          >
            Note <span className="font-normal normal-case tracking-normal text-[#181818]/55">(optional)</span>
          </label>
          <input
            id="note"
            name="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Reception to follow"
            className="mt-2 w-full border border-[#181818]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#181818]/45"
          />
          <p className="mt-1 text-[11px] text-[#181818]/55">Shown in small caps under the date and venue. Leave blank to hide.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <SolidSilkButton
            type="submit"
            wrapperClassName="h-11 w-fit"
            buttonClassName="px-6 whitespace-nowrap"
          >
            {isEdit ? "Save changes" : "Save wedding"}
          </SolidSilkButton>
          {isEdit && editWeddingId ? (
            <Link
              href={`/dashboard/${editWeddingId}`}
              className="text-sm font-medium text-[#181818]/70 hover:text-[#181818]"
            >
              Back to guest list
            </Link>
          ) : null}
          <Link href="/" className="text-sm font-medium text-[#181818]/70 hover:text-[#181818]">
            {isEdit ? "Home" : "Back to site"}
          </Link>
        </div>
      </form>

      <div className="min-w-0 lg:sticky lg:top-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/55">Live preview</p>
        <div className="max-h-[min(85vh,920px)] min-h-[280px] w-full overflow-y-auto overflow-x-hidden rounded-sm border border-[#181818]/20 bg-[#FDFCF9] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <div className="w-full min-w-0 font-sans text-[#181818]" style={invitationFrameStyle}>
            <InvitationHeroBody
              coupleNames={coupleNames}
              language={language}
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
              className="w-[calc(100%+2*var(--invite-gutter,12px))] max-w-none -mx-[var(--invite-gutter,12px)]"
            >
              <div className="h-6 w-full shrink-0 bg-transparent" aria-hidden />
              <div
                className="w-full p-[var(--invite-gutter,12px)] pb-12 text-[#FCFCF6]"
                style={invitationRsvpBandStyle}
              >
                <div className="mx-auto max-w-[520px] text-center">
                  <div className="flex flex-col gap-[16px]">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.32em] text-[#FCFCF6]/65">
                      {toAllCapsNoAccents(previewT.weWouldLove)}
                    </p>
                    <h3
                      className="text-[clamp(28px,6vw,40px)] font-normal leading-[1.05] tracking-[0.02em] text-[#FAF6F2]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {previewT.willYouAttend}
                    </h3>
                    <p className={inviteMetaCaptionClass}>
                      {toAllCapsNoAccents(previewT.pleaseRespondBy)}
                    </p>
                  </div>
                  <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#FCFCF6]/55">
                    {toAllCapsNoAccents(previewT.previewOnly)}
                  </p>
                  <div className="pointer-events-none mt-8 flex flex-col items-center gap-4 opacity-[0.72]">
                    <SolidSilkButton type="button" wrapperClassName="h-[52px] w-full max-w-[360px]">
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
        </div>
      </div>
    </div>
  );
}
