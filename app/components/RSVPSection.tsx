"use client";

import { useState } from "react";
import OutlineSilkButton from "./OutlineSilkButton";
import SolidSilkButton from "./SolidSilkButton";
import { invitationRsvpBandStyle } from "./invitationDarkBandStyle";
import {
  inviteMetaCaptionClass,
  toAllCapsNoAccents,
  type InvitationLanguage,
} from "@/lib/invitationDisplay";
import { submitRsvp } from "@/app/invite/rsvpActions";

type RsvpUiCopy = {
  heading: string;
  pleaseRespondBy: (deadline: string) => string;
  confirm: string;
  unable: string;
  rsvpSentBody: string;
  almostThere: string;
  howManyGuests: string;
  includeEveryoneInParty: string;
  numberOfGuests: string;
  messageHostsOptional: string;
  notePlaceholder: string;
  submitResponse: string;
  saving: string;
  guestMinError: string;
  saveFailed: string;
  thankYouForResponse: string;
  lookForwardSeeingYou: string;
  willMissYou: string;
  responseSentToHost: string;
  writeHostMessageOptional: string;
};

const RSVP_COPY_EL: RsvpUiCopy = {
  heading: "RSVP",
  pleaseRespondBy: (d) => `Παρακαλούμε επιβεβαιώστε την παρουσία σας έως τις ${d}`,
  confirm: "ΘΑ ΠΑΡΕΥΡΕΘΩ",
  unable: "ΔΕ ΘΑ ΠΑΡΕΥΡΕΘΩ",
  rsvpSentBody: "Έχουμε λάβει την απάντησή σας. Σας ευχαριστούμε.",
  almostThere: "ΣΧΕΔΟΝ ΕΤΟΙΜΟΙ",
  howManyGuests: "Πόσα άτομα θα παρευρεθούν;",
  includeEveryoneInParty: "Συμπεριλάβετε όλα τα μέλη της παρέας σας, συμπεριλαμβανομένου εσάς.",
  numberOfGuests: "Αριθμός ατόμων",
  messageHostsOptional: "Μήνυμα για το ζευγάρι (προαιρετικά)",
  notePlaceholder: "Προσθέστε μια σημείωση για το ζευγάρι…",
  submitResponse: "Υποβολή απάντησης",
  saving: "Αποθήκευση…",
  guestMinError: "Παρακαλούμε εισάγετε τουλάχιστον ένα άτομο.",
  saveFailed: "Δεν ήταν δυνατή η αποθήκευση του RSVP.",
  thankYouForResponse: "Ευχαριστούμε για την απάντησή σας",
  lookForwardSeeingYou: "Ανυπομονούμε να σας δούμε",
  willMissYou: "Θα μας λείψετε",
  responseSentToHost: "Η απάντησή σας εστάλη στο ζευγάρι.",
  writeHostMessageOptional: "Γράψτε ένα μήνυμα στο ζευγάρι (προαιρετικά)",
};

const RSVP_COPY_EN: RsvpUiCopy = {
  heading: "RSVP",
  pleaseRespondBy: (d) => `Please respond by ${d}`,
  confirm: "CONFIRM ATTENDANCE",
  unable: "UNABLE TO ATTEND",
  rsvpSentBody: "We have received your response. Thank you.",
  almostThere: "ALMOST THERE",
  howManyGuests: "How many guests will attend?",
  includeEveryoneInParty: "Include everyone in your party, including yourself.",
  numberOfGuests: "Number of guests",
  messageHostsOptional: "Message for the hosts (optional)",
  notePlaceholder: "Add a note for the couple...",
  submitResponse: "Submit response",
  saving: "Saving…",
  guestMinError: "Please enter at least 1 guest.",
  saveFailed: "Failed to save RSVP.",
  thankYouForResponse: "Thank you for your response",
  lookForwardSeeingYou: "We look forward to seeing you",
  willMissYou: "We are going to miss you",
  responseSentToHost: "Your response has been sent to the host.",
  writeHostMessageOptional: "Write the host a message (optional)",
};

type RSVPSectionProps = {
  rsvpDeadline: string;
  weddingId: string;
  householdId: string;
  householdName: string;
  language?: InvitationLanguage;
  /** When true (invite URL), hides RSVP buttons — guest has already responded. */
  rsvpAlreadyRecorded?: boolean;
};

export default function RSVPSection({
  rsvpDeadline: rsvpDeadline,
  weddingId,
  householdId,
  householdName,
  language = "en",
  rsvpAlreadyRecorded = false,
}: RSVPSectionProps) {
  const [response, setResponse] = useState<"yes" | "no" | null>(null);
  const [yesStep, setYesStep] = useState<"details" | "thankyou">("details");
  const [attendingCountInput, setAttendingCountInput] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [guestCountError, setGuestCountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const copy = language === "el" ? RSVP_COPY_EL : RSVP_COPY_EN;

  const saveRsvp = async (payload: {
    response: "yes" | "no";
    notes: string;
    attendingCount: number | null;
  }) => {
    setIsSaving(true);
    setSubmitError(null);

    const response = payload.response;
    const notes = payload.notes.trim();

    try {
      const res = await submitRsvp({ householdId, response, notes });
      if (!res.ok) {
        setSubmitError(res.error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error saving RSVP:", e);
      setSubmitError(e instanceof Error ? e.message : copy.saveFailed);
      return false;
    } finally {
      setIsSaving(false);
    }
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
      setGuestCountError(copy.guestMinError);
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
          {rsvpAlreadyRecorded ? (
            <>
              {language === "el" ? (
                <div className="flex flex-col items-center gap-6">
                  <h3
                    className="text-[32px] font-normal leading-[40px] tracking-[0.5px] sm:text-[48px] sm:leading-[56px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {copy.heading}
                  </h3>
                  <p
                    className="max-w-[360px] text-center text-[14px] font-normal italic leading-relaxed tracking-[1px] sm:text-[16px]"
                    style={{ fontFamily: "var(--font-source-serif)", fontStretch: "condensed" }}
                  >
                    {copy.rsvpSentBody}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  <h3
                    className="mb-2 text-[32px] font-normal leading-[1.05] tracking-[0.02em] text-[#FAF6F2] sm:text-[40px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {copy.heading}
                  </h3>

                  <p className="text-[15px] leading-relaxed text-[#FAF6F2]/82">{copy.rsvpSentBody}</p>
                </div>
              )}
            </>
          ) : response === null ? (
            <>
              {language === "el" ? (
                <div className="flex flex-col items-center gap-8">
                  <h3
                    className="text-[32px] font-normal leading-[40px] tracking-[0.5px] sm:text-[48px] sm:leading-[56px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {copy.heading}
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  <h3
                    className="mb-2 text-[32px] font-normal leading-[1.05] tracking-[0.02em] text-[#FAF6F2] sm:text-[40px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {copy.heading}
                  </h3>

                  <p className={inviteMetaCaptionClass}>
                    {toAllCapsNoAccents(copy.pleaseRespondBy(rsvpDeadline))}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-4 sm:mt-[48px]">
                {language === "el" ? (
                  <p
                    className="mb-8 w-full whitespace-normal px-4 text-center text-[14px] font-normal italic leading-[20px] tracking-[1px] sm:px-0 sm:text-[16px] sm:leading-[24px] [font-family:var(--font-source-serif)]"
                    style={{ fontStretch: "condensed" }}
                  >
                    {copy.pleaseRespondBy(rsvpDeadline)}
                  </p>
                ) : null}
                <SolidSilkButton
                  type="button"
                  onClick={() => handleChooseResponse("yes")}
                  wrapperClassName="h-[52px] w-full max-w-[360px]"
                >
                  {toAllCapsNoAccents(copy.confirm)}
                </SolidSilkButton>

                <OutlineSilkButton
                  type="button"
                  onClick={() => handleChooseResponse("no")}
                  wrapperClassName="h-[52px] w-full max-w-[360px]"
                  buttonClassName="text-[#FAF6F2]/85 hover:text-[#FAF6F2]"
                >
                  {toAllCapsNoAccents(copy.unable)}
                </OutlineSilkButton>
              </div>
            </>
          ) : response === "yes" && yesStep === "details" ? (
            <div className="mx-auto w-[360px] max-w-full text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#FCFCF6]/70">
                {toAllCapsNoAccents(copy.almostThere)}
              </p>
              <h3
                className="mt-6 font-serif text-[40px] font-normal leading-[0.95] tracking-[0.01em] text-[#FCFCF6]"
                style={{
                  fontFamily: "var(--font-heading)",
                }}
              >
                {copy.howManyGuests}
              </h3>
              <p className="mt-4 text-[13px] leading-6 text-[#FCFCF6]/65">{copy.includeEveryoneInParty}</p>

              <label
                htmlFor="rsvp-guest-count"
                className="mt-8 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FCFCF6]/70"
              >
                {toAllCapsNoAccents(copy.numberOfGuests)}
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
                {toAllCapsNoAccents(copy.messageHostsOptional)}
              </label>
              <textarea
                id="rsvp-notes-yes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={copy.notePlaceholder}
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
                {isSaving ? toAllCapsNoAccents(copy.saving) : toAllCapsNoAccents(copy.submitResponse)}
              </SolidSilkButton>
            </div>
          ) : response === "yes" && yesStep === "thankyou" ? (
            <div className="mx-auto w-[360px] max-w-full text-center">
              <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#FCFCF6]/75">
                {toAllCapsNoAccents(copy.thankYouForResponse)}
              </p>
              <p
                className="mt-4 text-[40px] font-normal leading-[0.95] text-[#FCFCF6] sm:text-[48px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {copy.lookForwardSeeingYou}
              </p>
              <p className="mt-6 border border-[#FCFCF6]/25 px-4 py-3 text-[13px] font-medium text-[#FCFCF6]/90">
                {copy.responseSentToHost}
              </p>
            </div>
          ) : (
            <div className="mx-auto w-[360px] max-w-full text-center">
              <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#FCFCF6]/75">
                {toAllCapsNoAccents(copy.thankYouForResponse)}
              </p>
              <p
                className="mt-4 text-[40px] font-normal leading-[0.95] text-[#FCFCF6] sm:text-[48px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {copy.willMissYou}
              </p>
              <label
                htmlFor="rsvp-notes"
                className="mt-4 block text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#FCFCF6]/65"
              >
                {toAllCapsNoAccents(copy.writeHostMessageOptional)}
              </label>
              <textarea
                id="rsvp-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={copy.notePlaceholder}
                rows={4}
                disabled={submitted || isSaving}
                className="mt-3 w-full resize-none border border-[#FCFCF6]/30 bg-transparent px-4 py-3 text-left text-[13px] leading-6 text-[#FCFCF6] outline-none placeholder:text-[#FCFCF6]/40 focus:border-[#FCFCF6]/55 disabled:opacity-60"
              />

              {submitError ? (
                <p className="mt-3 text-left text-[12px] text-[#FCFCF6]/85">{submitError}</p>
              ) : null}

              {submitted ? (
                <>
                  <p className="mt-4 border border-[#FCFCF6]/25 px-4 py-3 text-[13px] font-medium text-[#FCFCF6]/90">
                    {copy.responseSentToHost}
                  </p>
                </>
              ) : (
                <SolidSilkButton
                  type="button"
                  onClick={handleNoSubmit}
                  disabled={isSaving}
                  wrapperClassName="mt-4 h-[46px] w-[220px] max-w-full"
                >
                  {isSaving ? toAllCapsNoAccents(copy.saving) : toAllCapsNoAccents(copy.submitResponse)}
                </SolidSilkButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
