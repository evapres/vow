"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { ChangeEvent, FormEvent } from "react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { inviteHeroDefaultSrc } from "@/app/components/InvitationHeroBody";
import M3FileField from "@/app/components/m3/M3FileField";
import M3FilledSelect from "@/app/components/m3/M3FilledSelect";
import M3FilledTextField from "@/app/components/m3/M3FilledTextField";
import M3ThemePicker from "@/app/components/m3/M3ThemePicker";
import { compressHeroImageFile } from "@/lib/compressHeroImage";
import { defaultCoupleInitialsForLanguage, GREEK_DEFAULT_MONOGRAM } from "@/lib/coupleInitials";
import { formLoadErrorMessage } from "@/lib/formLoadErrorMessage";
import { parseInvitationThemeId, type InvitationThemeId } from "@/lib/invitationThemes";

import { createWedding, updateWedding } from "./actions";

const AdminInvitationLivePreview = dynamic(() => import("./AdminInvitationLivePreview"), {
  ssr: false,
  loading: () => (
    <div className="m3-form-preview min-h-[320px] min-w-0 rounded-sm bg-[#181818]/5" aria-hidden />
  ),
});

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
  invitationMusicUrl?: string | null;
  invitationTheme?: InvitationThemeId;
  coupleInitialLeft?: string;
  coupleInitialRight?: string;
};

type AdminNewWeddingFormProps = {
  /** When set, form updates this wedding (same layout as create). */
  editWeddingId?: string;
  initial?: AdminWeddingFormInitial;
};

const PREVIEW_SAMPLE_VENUE = "ISLAND";
const PREVIEW_SAMPLE_DETAILS_LOCATION = "George Town, Brighton, BN1 3HG";

function adminFormPlaceholders(language: "en" | "el") {
  if (language === "el") {
    return {
      coupleNames: "π.χ. Ο Βασίλης & η Λυδία",
      /** Venue sample stays English on Greek invitations. */
      venueName: `e.g. ${PREVIEW_SAMPLE_VENUE}`,
      churchName: "π.χ. Άγιος Δημήτριος",
      streetAddress: "π.χ. Λεωφ. Συγγρού 100, 117 45, Αθήνα",
      note: "π.χ. Θα ακολουθήσει δεξίωση στο χώρο",
      coupleInitialLeft: "Β",
      coupleInitialRight: "Λ",
    };
  }
  return {
    coupleNames: "e.g. Nestor & Evangelia",
    venueName: `e.g. ${PREVIEW_SAMPLE_VENUE}`,
    churchName: "e.g. St. Demetrius Church",
    streetAddress: `e.g. ${PREVIEW_SAMPLE_DETAILS_LOCATION}`,
    note: "e.g. Reception to follow",
    coupleInitialLeft: "e.g. N",
    coupleInitialRight: "e.g. E",
  };
}

function initialHeroSrc(initial: AdminWeddingFormInitial | undefined): string {
  const u = initial?.heroImageUrl?.trim();
  if (u) return u;
  return inviteHeroDefaultSrc;
}

function isDefaultHeroSrc(src: string): boolean {
  return src === inviteHeroDefaultSrc || src.endsWith("/invite-hero-couple.png");
}

function applyFormInitial(
  data: AdminWeddingFormInitial,
  setters: {
    setCoupleNames: (v: string) => void;
    setLanguage: (v: "en" | "el") => void;
    setInvitationTheme: (v: InvitationThemeId) => void;
    setWeddingDate: (v: string) => void;
    setWeddingTime: (v: string) => void;
    setVenueName: (v: string) => void;
    setChurchName: (v: string) => void;
    setStreetAddress: (v: string) => void;
    setHeroPreviewSrc: (v: string) => void;
    setRsvpDeadline: (v: string) => void;
    setNote: (v: string) => void;
    setMusicPreviewSrc: (v: string | null) => void;
    setCoupleInitialLeft: (v: string) => void;
    setCoupleInitialRight: (v: string) => void;
  },
) {
  setters.setCoupleNames(data.coupleNames);
  setters.setLanguage(data.language);
  setters.setInvitationTheme(parseInvitationThemeId(data.invitationTheme));
  setters.setWeddingDate(data.weddingDate);
  setters.setWeddingTime(data.weddingTime);
  setters.setVenueName(data.venueName);
  setters.setChurchName(data.churchName);
  setters.setStreetAddress(data.streetAddress);
  setters.setHeroPreviewSrc(initialHeroSrc(data));
  setters.setRsvpDeadline(data.rsvpDeadline ? data.rsvpDeadline.slice(0, 10) : "");
  setters.setNote(data.note);
  setters.setMusicPreviewSrc(data.invitationMusicUrl?.trim() || null);
  const initials =
    data.language === "el" &&
    !data.coupleInitialLeft?.trim() &&
    !data.coupleInitialRight?.trim()
      ? GREEK_DEFAULT_MONOGRAM
      : defaultCoupleInitialsForLanguage(data.language);
  setters.setCoupleInitialLeft(data.coupleInitialLeft?.trim() || initials.left);
  setters.setCoupleInitialRight(data.coupleInitialRight?.trim() || initials.right);
}

export default function AdminNewWeddingForm({ editWeddingId, initial }: AdminNewWeddingFormProps) {
  const isEdit = Boolean(editWeddingId);
  const [clientReady, setClientReady] = useState(() => !editWeddingId);
  const [isSaving, startTransition] = useTransition();
  const [formLoading, setFormLoading] = useState(() => Boolean(editWeddingId) && !initial);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [coupleNames, setCoupleNames] = useState(initial?.coupleNames ?? "");
  const [language, setLanguage] = useState<"en" | "el">(initial?.language ?? "en");
  const [invitationTheme, setInvitationTheme] = useState<InvitationThemeId>(() =>
    parseInvitationThemeId(initial?.invitationTheme),
  );
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
  const [coupleInitialLeft, setCoupleInitialLeft] = useState(
    () => initial?.coupleInitialLeft?.trim() || defaultCoupleInitialsForLanguage(initial?.language ?? "en").left,
  );
  const [coupleInitialRight, setCoupleInitialRight] = useState(
    () => initial?.coupleInitialRight?.trim() || defaultCoupleInitialsForLanguage(initial?.language ?? "en").right,
  );
  const [musicPreviewSrc, setMusicPreviewSrc] = useState<string | null>(
    () => initial?.invitationMusicUrl?.trim() || null,
  );
  const [clearHeroForSubmit, setClearHeroForSubmit] = useState(false);
  const [clearMusicForSubmit, setClearMusicForSubmit] = useState(false);

  const previewCoupleNames = useDeferredValue(coupleNames);
  const previewLanguage = useDeferredValue(language);
  const previewInvitationTheme = useDeferredValue(invitationTheme);
  const previewWeddingDate = useDeferredValue(weddingDate);
  const previewWeddingTime = useDeferredValue(weddingTime);
  const previewVenueName = useDeferredValue(venueName);
  const previewChurchName = useDeferredValue(churchName);
  const previewStreetAddress = useDeferredValue(streetAddress);
  const previewRsvpDeadline = useDeferredValue(rsvpDeadline);
  const previewNote = useDeferredValue(note);
  const previewCoupleInitialLeft = useDeferredValue(coupleInitialLeft);
  const previewCoupleInitialRight = useDeferredValue(coupleInitialRight);

  const placeholders = useMemo(() => adminFormPlaceholders(language), [language]);

  const heroBlobUrlRef = useRef<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    return () => {
      if (heroBlobUrlRef.current) {
        URL.revokeObjectURL(heroBlobUrlRef.current);
        heroBlobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!editWeddingId || initial) return;

    let cancelled = false;
    setFormLoading(true);
    setFormLoadError(null);

    void fetch(`/api/admin/wedding/${editWeddingId}/form`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Could not load invitation.");
        }
        return res.json() as Promise<AdminWeddingFormInitial>;
      })
      .then((data) => {
        if (cancelled) return;
        applyFormInitial(data, {
          setCoupleNames,
          setLanguage,
          setInvitationTheme,
          setWeddingDate,
          setWeddingTime,
          setVenueName,
          setChurchName,
          setStreetAddress,
          setHeroPreviewSrc,
          setRsvpDeadline,
          setNote,
          setMusicPreviewSrc,
          setCoupleInitialLeft,
          setCoupleInitialRight,
        });
        setFormLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const raw = e instanceof Error ? e.message : "Could not load invitation.";
        setFormLoadError(formLoadErrorMessage(raw));
        setFormLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editWeddingId, initial]);

  const clearHeroImage = () => {
    if (heroBlobUrlRef.current) {
      URL.revokeObjectURL(heroBlobUrlRef.current);
      heroBlobUrlRef.current = null;
    }
    setHeroPreviewSrc(inviteHeroDefaultSrc);
    if (heroFileInputRef.current) heroFileInputRef.current.value = "";
    if (isEdit) setClearHeroForSubmit(true);
  };

  const clearInvitationMusic = () => {
    setMusicPreviewSrc(null);
    if (musicFileInputRef.current) musicFileInputRef.current.value = "";
    if (isEdit) setClearMusicForSubmit(true);
  };

  const onMusicFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearInvitationMusic();
      return;
    }
    if (isEdit) setClearMusicForSubmit(false);
    const url = URL.createObjectURL(file);
    setMusicPreviewSrc(url);
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

  async function buildSubmitFormData(): Promise<FormData> {
    const fd = new FormData();
    if (isEdit && editWeddingId) fd.set("wedding_id", editWeddingId);
    if (isEdit) {
      fd.set("clear_hero", clearHeroForSubmit ? "1" : "0");
      fd.set("clear_music", clearMusicForSubmit ? "1" : "0");
    }
    fd.set("invitation_theme", invitationTheme);
    fd.set("couple_names", coupleNames);
    fd.set("language", language);
    fd.set("wedding_date", weddingDate);
    fd.set("wedding_time", weddingTime);
    fd.set("venue_name", venueName);
    fd.set("church_name", churchName);
    fd.set("street_address", streetAddress);
    fd.set("rsvp_deadline", rsvpDeadline);
    fd.set("note", note);
    fd.set("couple_initial_left", coupleInitialLeft);
    fd.set("couple_initial_right", coupleInitialRight);

    const heroFile = heroFileInputRef.current?.files?.[0];
    if (heroFile && heroFile.size > 0) {
      fd.set("hero_image", await compressHeroImageFile(heroFile));
    }

    const musicFile = musicFileInputRef.current?.files?.[0];
    if (musicFile && musicFile.size > 0) {
      fd.set("invitation_music", musicFile);
    }

    return fd;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => {
      void (async () => {
        const fd = await buildSubmitFormData();
        if (isEdit) await updateWedding(fd);
        else await createWedding(fd);
      })();
    });
  }

  if (!clientReady || formLoading) {
    return (
      <div className="m3-form-card px-4 py-8 text-sm text-[#181818]/70" aria-busy="true">
        Loading invitation…
      </div>
    );
  }

  if (formLoadError) {
    return (
      <div className="m3-form-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        {formLoadError}
      </div>
    );
  }

  return (
    <div className="m3-admin-form m3-admin-split grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,2fr)] lg:gap-12">
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="min-w-0">
        <div className="m3-form-card space-y-6">
          {isEdit && editWeddingId ? <input type="hidden" name="wedding_id" value={editWeddingId} /> : null}
          {isEdit ? <input type="hidden" name="clear_hero" value={clearHeroForSubmit ? "1" : "0"} /> : null}
          {isEdit ? <input type="hidden" name="clear_music" value={clearMusicForSubmit ? "1" : "0"} /> : null}
          <input type="hidden" name="invitation_theme" value={invitationTheme} />

          <h2 className="m3-title-large">Invitation details</h2>

          <M3ThemePicker value={invitationTheme} onChange={setInvitationTheme} />

          <M3FilledSelect
            id="language"
            name="language"
            label="Language"
            value={language}
            onChange={(e) => {
              const next = e.target.value === "el" ? "el" : "en";
              setLanguage(next);
              if (next === "el" && !coupleInitialLeft.trim() && !coupleInitialRight.trim()) {
                setCoupleInitialLeft(GREEK_DEFAULT_MONOGRAM.left);
                setCoupleInitialRight(GREEK_DEFAULT_MONOGRAM.right);
              }
            }}
          >
            <option value="en">English</option>
            <option value="el">Greek</option>
          </M3FilledSelect>

          <M3FilledTextField
            id="couple_names"
            name="couple_names"
            label="Couple names"
            type="text"
            required
            clearable
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
            onClear={() => setCoupleNames("")}
            placeholder={placeholders.coupleNames}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <M3FilledTextField
              id="couple_initial_left"
              name="couple_initial_left"
              label="First initial"
              type="text"
              clearable
              value={coupleInitialLeft}
              onChange={(e) => setCoupleInitialLeft(e.target.value)}
              onClear={() => setCoupleInitialLeft("")}
              placeholder={placeholders.coupleInitialLeft}
              maxLength={3}
            />
            <M3FilledTextField
              id="couple_initial_right"
              name="couple_initial_right"
              label="Second initial"
              type="text"
              clearable
              value={coupleInitialRight}
              onChange={(e) => setCoupleInitialRight(e.target.value)}
              onClear={() => setCoupleInitialRight("")}
              placeholder={placeholders.coupleInitialRight}
              maxLength={3}
            />
          </div>

          <M3FilledTextField
            id="wedding_date"
            name="wedding_date"
            label="Wedding date"
            type="date"
            required
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />

          <M3FilledTextField
            id="wedding_time"
            name="wedding_time"
            label="Event time"
            type="time"
            value={weddingTime}
            onChange={(e) => setWeddingTime(e.target.value)}
          />

          <M3FilledTextField
            id="venue_name"
            name="venue_name"
            label="Venue name"
            type="text"
            required
            clearable
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            onClear={() => setVenueName("")}
            placeholder={placeholders.venueName}
            supportingText="Shown top-right on the invitation (with the date)."
          />

          <M3FilledTextField
            id="church_name"
            name="church_name"
            label="Church name"
            type="text"
            required
            clearable
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            onClear={() => setChurchName("")}
            placeholder={placeholders.churchName}
            supportingText="Required for the dashboard. If the ceremony is at the venue, enter the venue name again here."
          />

          <M3FilledTextField
            id="street_address"
            name="street_address"
            label="Street address"
            type="text"
            required
            clearable
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            onClear={() => setStreetAddress("")}
            placeholder={placeholders.streetAddress}
            supportingText="Shown under the date with the church name on the invitation."
          />

          <M3FileField
            ref={heroFileInputRef}
            id="hero_image"
            name="hero_image"
            type="file"
            accept="image/*"
            label="Hero image"
            onChange={onHeroFileChange}
            supportingText="JPEG or PNG, up to 4MB. Optional."
          >
            {heroPreviewSrc !== inviteHeroDefaultSrc && !isDefaultHeroSrc(heroPreviewSrc) ? (
              <button type="button" className="m3-btn m3-btn--text" onClick={clearHeroImage}>
                Remove image
              </button>
            ) : null}
          </M3FileField>

          <M3FilledTextField
            id="rsvp_deadline"
            name="rsvp_deadline"
            label="RSVP deadline"
            type="date"
            required
            value={rsvpDeadline}
            onChange={(e) => setRsvpDeadline(e.target.value)}
          />

          <M3FilledTextField
            id="note"
            name="note"
            label="Note (optional)"
            type="text"
            clearable
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onClear={() => setNote("")}
            placeholder={placeholders.note}
            supportingText="Shown in small caps under the date and venue. Leave blank to hide."
          />

          <M3FileField
            ref={musicFileInputRef}
            id="invitation_music"
            name="invitation_music"
            type="file"
            accept="audio/mpeg,audio/mp3,audio/mp4,audio/wav,.mp3"
            label="Invitation music (optional)"
            onChange={onMusicFileChange}
            supportingText="MP3 up to 8MB. Guests tap the music icon on the invite to play."
          >
            {musicPreviewSrc ? (
              <>
                <audio controls preload="metadata" src={musicPreviewSrc} className="mt-2 w-full max-w-sm" />
                <button type="button" className="m3-btn m3-btn--text" onClick={clearInvitationMusic}>
                  Remove music
                </button>
              </>
            ) : null}
          </M3FileField>

          <div className="m3-form-actions">
            <div className="m3-form-actions__secondary">
              {editWeddingId ? (
                <Link
                  href={`/preview/${editWeddingId}`}
                  className="m3-btn m3-btn--outlined"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview
                </Link>
              ) : null}
              <button type="submit" className="m3-btn m3-btn--filled" disabled={isSaving}>
                {isSaving ? "Saving…" : isEdit ? "Save changes" : "Save invitation"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <AdminInvitationLivePreview
        coupleNames={previewCoupleNames}
        language={previewLanguage}
        invitationTheme={previewInvitationTheme}
        weddingDate={previewWeddingDate}
        weddingTime={previewWeddingTime}
        venueName={previewVenueName}
        churchName={previewChurchName}
        streetAddress={previewStreetAddress}
        rsvpDeadline={previewRsvpDeadline}
        note={previewNote}
        photoSrc={heroPreviewSrc}
        coupleInitialLeft={previewCoupleInitialLeft}
        coupleInitialRight={previewCoupleInitialRight}
      />
    </div>
  );
}
