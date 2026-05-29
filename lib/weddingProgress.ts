export type WeddingCompletionFields = {
  couple_names?: string | null;
  wedding_date?: string | null;
  venue_name?: string | null;
  church_name?: string | null;
  street_address?: string | null;
  rsvp_deadline?: string | null;
  hero_image_url?: string | null;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Step 1 completeness gate for accessing the dashboard.
 * Keep this intentionally conservative: if required basics are missing, dashboard is locked.
 */
export function isInvitationStepComplete(w: WeddingCompletionFields): boolean {
  return (
    hasText(w.couple_names) &&
    hasText(w.wedding_date) &&
    hasText(w.venue_name) &&
    hasText(w.church_name) &&
    hasText(w.street_address) &&
    hasText(w.rsvp_deadline)
  );
}

export function invitationStepMissingFields(w: WeddingCompletionFields): string[] {
  const missing: string[] = [];
  if (!hasText(w.couple_names)) missing.push("couple names");
  if (!hasText(w.wedding_date)) missing.push("wedding date");
  if (!hasText(w.venue_name)) missing.push("venue name");
  if (!hasText(w.church_name)) missing.push("church name");
  if (!hasText(w.street_address)) missing.push("street address");
  if (!hasText(w.rsvp_deadline)) missing.push("RSVP deadline");
  return missing;
}

/** Shown on the admin create/edit form so requirements match the dashboard gate. */
export const INVITATION_STEP_REQUIRED_LABELS = [
  "Couple names",
  "Wedding date",
  "Venue name",
  "Church name",
  "Street address",
  "RSVP deadline",
] as const;

export function invitationStepRequiredNotice(): string {
  return `Required to open the RSVP dashboard: ${INVITATION_STEP_REQUIRED_LABELS.join(", ")}. Hero image, note, and music are optional.`;
}

export type InvitationStepFormInput = {
  coupleNames?: string | null;
  weddingDate?: string | null;
  venueName?: string | null;
  churchName?: string | null;
  streetAddress?: string | null;
  rsvpDeadline?: string | null;
};

/** Returns a user-facing error message, or null when the dashboard step is satisfied. */
export function validateInvitationStepForm(input: InvitationStepFormInput): string | null {
  const missing = invitationStepMissingFields({
    couple_names: input.coupleNames,
    wedding_date: input.weddingDate,
    venue_name: input.venueName,
    church_name: input.churchName,
    street_address: input.streetAddress,
    rsvp_deadline: input.rsvpDeadline,
  });
  if (missing.length === 0) return null;
  const list = missing.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(", ");
  return `${list} ${missing.length === 1 ? "is" : "are"} required to open the RSVP dashboard.`;
}

