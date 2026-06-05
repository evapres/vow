import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClientOrNull } from "@/lib/supabase/service-role";
import { isRetryableMissingColumnError } from "@/lib/supabaseMissingColumn";

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
  hero_image_position: string | null;
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

const WEDDING_SELECT_FULL =
  "id, couple_names, wedding_date, language, hero_image_url, hero_image_position, rsvp_deadline, note, invitation_theme, invitation_music_url, venue_name, church_name, street_address, location, couple_initial_left, couple_initial_right";

const WEDDING_SELECT_WITHOUT_HERO_POSITION =
  "id, couple_names, wedding_date, language, hero_image_url, rsvp_deadline, note, invitation_theme, invitation_music_url, venue_name, church_name, street_address, location, couple_initial_left, couple_initial_right";

async function inviteDbClient(): Promise<SupabaseClient> {
  return getServiceRoleClientOrNull() ?? (await createClient());
}

async function loadWeddingForInvite(
  supabase: SupabaseClient,
  weddingId: string,
): Promise<InvitePageWedding | null> {
  const selects = [WEDDING_SELECT_FULL, WEDDING_SELECT_WITHOUT_HERO_POSITION];

  for (const select of selects) {
    const { data, error } = await supabase
      .from("weddings")
      .select(select)
      .eq("id", weddingId)
      .single();

    if (!error && data) {
      const row = data as InvitePageWedding;
      return {
        ...row,
        hero_image_position: row.hero_image_position ?? "center",
      };
    }

    if (error && !isRetryableMissingColumnError(error)) {
      console.error("loadInviteByToken wedding:", error.message);
      return null;
    }
  }

  return null;
}

export async function loadInviteByToken(
  token: string,
): Promise<{ household: InvitePageHousehold; wedding: InvitePageWedding } | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const supabase = await inviteDbClient();

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, household_name, wedding_id, invite_token, invited_count")
    .eq("invite_token", trimmed)
    .single();

  if (householdError || !household) {
    if (householdError) {
      console.error("loadInviteByToken household:", householdError.message);
    }
    return null;
  }

  const wedding = await loadWeddingForInvite(supabase, household.wedding_id);
  if (!wedding) return null;

  return {
    household: household as InvitePageHousehold,
    wedding,
  };
}

/** Deduped load for page + `generateMetadata`. */
export const getInviteByToken = cache(loadInviteByToken);
