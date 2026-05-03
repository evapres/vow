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

