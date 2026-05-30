import type { SupabaseClient } from "@supabase/supabase-js";

import type { WeddingLike } from "./buildInvitationEmailProps";
import { loadWeddingForInvitationEmail } from "./loadWeddingForInvitationEmail";

export {
  INVITATION_EMAIL_WEDDING_SELECT,
  INVITATION_EMAIL_WEDDING_SELECT_CORE,
} from "./loadWeddingForInvitationEmail";

/** Rows needed for {@link buildInvitationEmailProps} on the invitation preview / embed routes. */
export async function loadInvitationEmailPreviewContext(
  supabase: SupabaseClient,
  userId: string,
  weddingId: string,
  householdId?: string | null,
): Promise<{
  wedding: WeddingLike;
  household: { household_name: string | null; invite_token: string | null } | null;
} | null> {
  const { wedding, error: weddingError } = await loadWeddingForInvitationEmail(
    supabase,
    weddingId,
    userId,
  );

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
