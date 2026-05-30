import type { SupabaseClient } from "@supabase/supabase-js";

import { isRetryableMissingColumnError } from "@/lib/supabaseMissingColumn";

import type { WeddingLike } from "./buildInvitationEmailProps";

/** Supabase `.select()` fragment — keep in sync with {@link buildInvitationEmailProps} wedding shape. */
export const INVITATION_EMAIL_WEDDING_SELECT_CORE =
  "couple_names, wedding_date, language, location, venue_name, church_name, street_address, rsvp_deadline" as const;

export const INVITATION_EMAIL_WEDDING_SELECT =
  "couple_names, wedding_date, language, location, venue_name, church_name, street_address, rsvp_deadline, couple_initial_left, couple_initial_right" as const;

const SELECT_ATTEMPTS = [
  INVITATION_EMAIL_WEDDING_SELECT,
  INVITATION_EMAIL_WEDDING_SELECT_CORE,
] as const;

/** Loads wedding fields needed to build invitation emails; retries without initials if columns are missing. */
export async function loadWeddingForInvitationEmail(
  supabase: SupabaseClient,
  weddingId: string,
  userId: string,
): Promise<{ wedding: WeddingLike | null; error: { message?: string } | null }> {
  let lastError: { message?: string; code?: string; details?: string } | null = null;

  for (const select of SELECT_ATTEMPTS) {
    const { data, error } = await supabase
      .from("weddings")
      .select(select as string)
      .eq("id", weddingId)
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      return { wedding: data as unknown as WeddingLike, error: null };
    }

    lastError = error;
    if (!error || !isRetryableMissingColumnError(error)) {
      break;
    }
  }

  return { wedding: null, error: lastError };
}
