import type { SupabaseClient } from "@supabase/supabase-js";

/** Supabase `.select()` fragment — keep in sync with {@link buildInvitationEmailProps} wedding shape. */
export const INVITATION_EMAIL_WEDDING_SELECT =
  "couple_names, wedding_date, location, venue_name, church_name, street_address, rsvp_deadline, hero_image_url" as const;

/** Rows needed for {@link buildInvitationEmailProps} on the invitation preview / embed routes. */
export async function loadInvitationEmailPreviewContext(
  supabase: SupabaseClient,
  userId: string,
  weddingId: string,
  householdId?: string | null,
): Promise<{
  wedding: {
    couple_names: string | null;
    wedding_date: string | null;
    location: string | null;
    venue_name: string | null;
    church_name: string | null;
    street_address: string | null;
    rsvp_deadline: string | null;
    hero_image_url: string | null;
  };
  household: { household_name: string | null; invite_token: string | null } | null;
} | null> {
  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select(INVITATION_EMAIL_WEDDING_SELECT)
    .eq("id", weddingId)
    .eq("user_id", userId)
    .single();

  if (weddingError || !wedding) return null;

  let householdQuery = supabase
    .from("households")
    .select("household_name, invite_token")
    .eq("wedding_id", weddingId);

  if (householdId?.trim()) {
    householdQuery = householdQuery.eq("id", householdId.trim());
  }

  const { data: household } = await householdQuery.limit(1).maybeSingle();

  return { wedding, household };
}
