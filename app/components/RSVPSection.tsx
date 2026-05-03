"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import OutlineSilkButton from "./OutlineSilkButton";
import SolidSilkButton from "./SolidSilkButton";
import { invitationRsvpBandStyle } from "./invitationDarkBandStyle";
import {
  inviteMetaCaptionClass,
  toAllCapsNoAccents,
  type InvitationLanguage,
} from "@/lib/invitationDisplay";

type RSVPSectionProps = {
  rsvpDeadline: string;
  weddingId: string;
  householdId: string;
  householdName: string;
  language?: InvitationLanguage;
};

export default function RSVPSection({
  rsvpDeadline: rsvpDeadline,
  weddingId,
  householdId,
  householdName,
  language = "en",
}: RSVPSectionProps) {
  const [response, setResponse] = useState<"yes" | "no" | null>(null);
  const [yesStep, setYesStep] = useState<"details" | "thankyou">("details");
  const [attendingCountInput, setAttendingCountInput] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [guestCountError, setGuestCountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveRsvp = async (payload: {
    response: "yes" | "no";
    notes: string;
    attendingCount: number | null;
  }) => {
    setIsSaving(true);
    setSubmitError(null);
  
    const { error } = await supabase.from("rsvps").upsert(
      {
        wedding_id: weddingId,
        household_id: householdId,
        attending: payload.response === "yes",
        number_attending: payload.response === "yes" ? payload.attendingCount : 0,
        note: payload.notes.trim(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "household_id",
      }
    );
  
    setIsSaving(false);
  
    if (error) {
      console.error("Error saving RSVP:", error);
      setSubmitError(error.message);
      return false;
    }
  
    return true;
  };

  const handleChooseResponse = (value: "yes" | "no") => {
    setResponse(value);
    setSubmitted(false);
    setGuestCountError(null);
    setSubmitError(null);

    if (value === "yes") {
      setYesStep("details");
      setAttendingCountInput("1");
      setNotes("");
    }
  };

  const handleYesDetailsSubmit = async () => {
    const parsed = parseInt(attendingCountInput, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
      setGuestCountError("Please enter at least 1 guest.");
      return;
    }

    setGuestCountError(null);

    const ok = await saveRsvp({
      response: "yes",
      notes,
      attendingCount: parsed,
    });

    if (!ok) return;

    setYesStep("thankyou");
    setSubmitted(true);
  };

  const handleNoSubmit = async () => {
    if (response !== "no") return;

    const ok = await saveRsvp({
      response: "no",
      notes,
      attendingCount: null,
    });

    if (!ok) return;

    setSubmitted(true);
  };

  const tEl = {
    heading: "RSVP",
    pleaseRespondBy: (d: string) => `Παρακαλούμε επιβεβαιώστε την παρουσία σας έως τις ${d}`,
    confirm: "ΘΑ ΠΑΡΕΥΡΕΘΩ",
    unable: "ΔΕ ΘΑ ΠΑΡΕΥΡΕΘΩ",
  } as const;

  const tEn = {
    heading: "RSVP",
    pleaseRespondBy: (d: string) => `Please respond by ${d}`,
    confirm: "CONFIRM ATTENDANCE",
    unable: "UNABLE TO ATTEND",
  } as const;

  return (
    <section
      id="rsvp"
      aria-label="RSVP"
      className="w-[calc(100%+2*var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px)))] max-w-none -mx-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))]"
    >
      <div className="h-0 w-full shrink-0 bg-transparent sm:h-10" aria-hidden />
      <div
        className="w-full px-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))] py-[calc(var(--invite-hero-details-gap,clamp(12px,calc(80*100vw/1920),80px))+40px)] text-[#FAF6F2]/85 sm:p-[var(--invite-gutter,clamp(12px,calc(96*100vw/1920),96px))]"
        style={invitationRsvpBandStyle}
      >
        <div className="mx-auto max-w-[520px] text-center">
          {response === null ? (
            <>
              {language === "el" ? (
                <div className="flex flex-col items-center gap-8">
                  <h3
                    className="text-[32px] font-normal leading-[40px] tracking-[0.5px] sm:text-[48px] sm:leading-[56px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {tEl.heading}
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  <h3
                    className="mb-2 text-[32px] font-normal leading-[1.05] tracking-[0.02em] text-[#FAF6F2] sm:text-[40px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {tEn.heading}
                  </h3>

                  <p className={inviteMetaCaptionClass}>
                    {toAllCapsNoAccents(tEn.pleaseRespondBy(rsvpDeadline))}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-4 sm:mt-[48px]">
                {language === "el" ? (
                  <p
                    className="mb-8 w-full whitespace-normal px-4 text-center text-[14px] font-normal italic leading-[20px] tracking-[1px] sm:px-0 sm:text-[16px] sm:leading-[24px] [font-family:var(--font-source-serif)]"
                    style={{ fontStretch: "condensed" }}
                  >
                    {tEl.pleaseRespondBy(rsvpDeadline)}
                  </p>
                ) : null}
                <SolidSilkButton
                  type="button"
                  onClick={() => handleChooseResponse("yes")}
                  wrapperClassName="h-[52px] w-full max-w-[360px]"
                >
                  {toAllCapsNoAccents(language === "el" ? tEl.confirm : tEn.confirm)}
                </SolidSilkButton>

                <OutlineSilkButton
                  type="button"
                  onClick={() => handleChooseResponse("no")}
                  wrapperClassName="h-[52px] w-full max-w-[360px]"
                  buttonClassName="text-[#FAF6F2]/85 hover:text-[#FAF6F2]"
                >
                  {toAllCapsNoAccents(language === "el" ? tEl.unable : tEn.unable)}
                </OutlineSilkButton>
              </div>
            </>
          ) : response === "yes" && yesStep === "details" ? (
            <div className="mx-auto w-[360px] max-w-full text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#FCFCF6]/70">
                ALMOST THERE
              </p>
              <h3
                className="mt-6 font-serif text-[40px] font-normal leading-[0.95] tracking-[0.01em] text-[#FCFCF6]"
                style={{
                  fontFamily: "var(--font-heading)",
                }}
              >
                How many guests will attend?
              </h3>
              <p className="mt-4 text-[13px] leading-6 text-[#FCFCF6]/65">
                Include everyone in your party, including yourself.
              </p>

              <label
                htmlFor="rsvp-guest-count"
                className="mt-8 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FCFCF6]/70"
              >
                Number of guests
              </label>
              <input
                id="rsvp-guest-count"
                type="number"
                inputMode="numeric"
                min={1}
                value={attendingCountInput}
                onChange={(e) => {
                  setAttendingCountInput(e.target.value);
                  setGuestCountError(null);
                }}
                className="mt-3 h-[46px] w-full border border-[#FCFCF6]/30 bg-transparent px-4 text-[15px] text-[#FCFCF6] outline-none focus:border-[#FCFCF6]/55"
              />
              {guestCountError ? (
                <p className="mt-2 text-[12px] text-[#FCFCF6]/85">{guestCountError}</p>
              ) : null}

              <label
                htmlFor="rsvp-notes-yes"
                className="mt-6 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FCFCF6]/70"
              >
                Message for the hosts (optional)
              </label>
              <textarea
                id="rsvp-notes-yes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note for the couple..."
                rows={4}
                className="mt-3 w-full resize-none border border-[#FCFCF6]/30 bg-transparent px-4 py-3 text-[13px] leading-6 text-[#FCFCF6] outline-none placeholder:text-[#FCFCF6]/40 focus:border-[#FCFCF6]/55"
              />

              {submitError ? (
                <p className="mt-3 text-[12px] text-[#FCFCF6]/85">{submitError}</p>
              ) : null}

              <SolidSilkButton
                type="button"
                onClick={handleYesDetailsSubmit}
                disabled={isSaving}
                wrapperClassName="mt-6 h-[46px] w-[220px] max-w-full"
              >
                {isSaving ? "Saving…" : "Submit response"}
              </SolidSilkButton>
            </div>
          ) : response === "yes" && yesStep === "thankyou" ? (
            <div className="mx-auto w-[360px] max-w-full text-center">
              <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#FCFCF6]/75">
                Thank you for your response
              </p>
              <p
                className="mt-4 text-[40px] font-normal leading-[0.95] text-[#FCFCF6] sm:text-[48px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                We look forward to seeing you
              </p>
              <p className="mt-6 border border-[#FCFCF6]/25 px-4 py-3 text-[13px] font-medium text-[#FCFCF6]/90">
                Your response has been sent to the host.
              </p>
            </div>
          ) : (
            <div className="mx-auto w-[360px] max-w-full text-center">
              <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#FCFCF6]/75">
                Thank you for your response
              </p>
              <p
                className="mt-4 text-[40px] font-normal leading-[0.95] text-[#FCFCF6] sm:text-[48px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                We are going to miss you
              </p>
              <label
                htmlFor="rsvp-notes"
                className="mt-4 block text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#FCFCF6]/65"
              >
                Write the host a message (optional)
              </label>
              <textarea
                id="rsvp-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a note for the couple..."
                rows={4}
                disabled={submitted || isSaving}
                className="mt-3 w-full resize-none border border-[#FCFCF6]/30 bg-transparent px-4 py-3 text-left text-[13px] leading-6 text-[#FCFCF6] outline-none placeholder:text-[#FCFCF6]/40 focus:border-[#FCFCF6]/55 disabled:opacity-60"
              />

              {submitError ? (
                <p className="mt-3 text-left text-[12px] text-[#FCFCF6]/85">{submitError}</p>
              ) : null}

              {submitted ? (
                <p className="mt-4 border border-[#FCFCF6]/25 px-4 py-3 text-[13px] font-medium text-[#FCFCF6]/90">
                  Your response has been sent to the host.
                </p>
              ) : (
                <SolidSilkButton
                  type="button"
                  onClick={handleNoSubmit}
                  disabled={isSaving}
                  wrapperClassName="mt-4 h-[46px] w-[220px] max-w-full"
                >
                  {isSaving ? "Saving…" : "Submit response"}
                </SolidSilkButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
