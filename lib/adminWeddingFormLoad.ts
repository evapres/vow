import type { SupabaseClient } from "@supabase/supabase-js";

import { isRetryableMissingColumnError } from "@/lib/supabaseMissingColumn";

const FORM_SELECT_ATTEMPTS = [
  "couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, invitation_theme, hero_image_url, hero_image_position, invitation_music_url, couple_initial_left, couple_initial_right",
  "couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, invitation_theme, hero_image_url, invitation_music_url, couple_initial_left, couple_initial_right",
  "couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, invitation_theme, hero_image_url, invitation_music_url",
  "couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, hero_image_url, invitation_music_url",
] as const;

const EDIT_PAGE_SELECT_ATTEMPTS = [
  "id, couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, location, invitation_theme",
  "id, couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, location",
] as const;

async function loadWithSelectFallback<T extends string>(
  supabase: SupabaseClient,
  weddingId: string,
  userId: string,
  selectAttempts: readonly T[],
) {
  let lastError: { message?: string; code?: string; details?: string } | null = null;

  for (const select of selectAttempts) {
    const { data, error } = await supabase
      .from("weddings")
      .select(select)
      .eq("id", weddingId)
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      return { data: data as Record<string, unknown>, error: null };
    }

    lastError = error;
    if (!error || !isRetryableMissingColumnError(error)) {
      break;
    }
  }

  return { data: null, error: lastError };
}

export async function loadOwnedWeddingFormRow(
  supabase: SupabaseClient,
  weddingId: string,
  userId: string,
) {
  return loadWithSelectFallback(supabase, weddingId.trim(), userId, FORM_SELECT_ATTEMPTS);
}

export async function loadOwnedWeddingEditPageRow(
  supabase: SupabaseClient,
  weddingId: string,
  userId: string,
) {
  return loadWithSelectFallback(supabase, weddingId.trim(), userId, EDIT_PAGE_SELECT_ATTEMPTS);
}
