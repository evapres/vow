import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type InvitePageHousehold = {
  id: string;
  household_name: string | null;
  wedding_id: string;
  invite_token: string;
  invited_count: number | null;
};

export type InvitePageWedding = {
  id: string;
  couple_names: string | null;
  wedding_date: string | null;
  language: string | null;
  hero_image_url: string | null;
  rsvp_deadline: string | null;
  note: string | null;
  invitation_theme: string | null;
  invitation_music_url: string | null;
  venue_name: string | null;
  church_name: string | null;
  street_address: string | null;
  location: string | null;
  couple_initial_left: string | null;
  couple_initial_right: string | null;
};

export async function loadInviteByToken(
  token: string,
): Promise<{ household: InvitePageHousehold; wedding: InvitePageWedding } | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const supabase = await createClient();

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, household_name, wedding_id, invite_token, invited_count")
    .eq("invite_token", trimmed)
    .single();

  if (householdError || !household) return null;

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select(
      "id, couple_names, wedding_date, language, hero_image_url, rsvp_deadline, note, invitation_theme, invitation_music_url, venue_name, church_name, street_address, location, couple_initial_left, couple_initial_right",
    )
    .eq("id", household.wedding_id)
    .single();

  if (weddingError || !wedding) return null;

  return {
    household: household as InvitePageHousehold,
    wedding: wedding as InvitePageWedding,
  };
}

/** Deduped load for page + `generateMetadata`. */
export const getInviteByToken = cache(loadInviteByToken);
