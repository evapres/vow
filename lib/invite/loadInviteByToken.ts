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

function normalizeInviteWedding(row: Record<string, unknown>): InvitePageWedding {
  return {
    id: String(row.id ?? ""),
    couple_names: (row.couple_names as string | null) ?? null,
    wedding_date: (row.wedding_date as string | null) ?? null,
    language: (row.language as string | null) ?? null,
    hero_image_url: (row.hero_image_url as string | null) ?? null,
    hero_image_position: (row.hero_image_position as string | null) ?? "center",
    rsvp_deadline: (row.rsvp_deadline as string | null) ?? null,
    note: (row.note as string | null) ?? null,
    invitation_theme: (row.invitation_theme as string | null) ?? null,
    invitation_music_url: (row.invitation_music_url as string | null) ?? null,
    venue_name: (row.venue_name as string | null) ?? null,
    church_name: (row.church_name as string | null) ?? null,
    street_address: (row.street_address as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    couple_initial_left: (row.couple_initial_left as string | null) ?? null,
    couple_initial_right: (row.couple_initial_right as string | null) ?? null,
  };
}

async function loadWeddingForInvite(
  supabase: SupabaseClient,
  weddingId: string,
): Promise<InvitePageWedding | null> {
  const fullResult = await supabase
    .from("weddings")
    .select(WEDDING_SELECT_FULL)
    .eq("id", weddingId)
    .single();

  if (!fullResult.error && fullResult.data) {
    return normalizeInviteWedding(fullResult.data as Record<string, unknown>);
  }

  if (fullResult.error && !isRetryableMissingColumnError(fullResult.error)) {
    console.error("loadInviteByToken wedding:", fullResult.error.message);
    return null;
  }

  const legacyResult = await supabase
    .from("weddings")
    .select(WEDDING_SELECT_WITHOUT_HERO_POSITION)
    .eq("id", weddingId)
    .single();

  if (!legacyResult.error && legacyResult.data) {
    return normalizeInviteWedding(legacyResult.data as Record<string, unknown>);
  }

  if (legacyResult.error) {
    console.error("loadInviteByToken wedding:", legacyResult.error.message);
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
