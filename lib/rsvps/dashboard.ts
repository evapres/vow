import { createClient } from "../supabase/server";
import { getServiceRoleClientOrNull } from "../supabase/service-role";

/** RSVP state for a household row on the wedding dashboard. */
export type HouseholdRsvpStatus = "attending" | "not_attending" | "pending";

export type DashboardHouseholdRow = {
  householdId: string;
  householdName: string;
  email: string | null;
  inviteToken: string | null;
  emailSentAt: string | null;
  /** How many guests are invited in this household; null if unset. */
  invitedCount: number | null;
  status: HouseholdRsvpStatus;
  /** Raw note from `rsvps.notes` when an RSVP exists; otherwise null. */
  rsvpNote: string | null;
  attendingCount: number | null;
  submittedAt: string | null;
};

type HouseholdRow = {
  id: string;
  household_name: string;
  invite_token: string | null;
  email: string | null;
  email_sent_at: string | null;
  invited_count: number | null;
};

type RsvpRow = {
  household_id: string;
  attending: boolean | null;
  notes: string | null;
  attending_count: number | null;
};

function statusFromRsvp(rsvp: RsvpRow | undefined): HouseholdRsvpStatus {
  if (!rsvp) return "pending";
  if (rsvp.attending === true) return "attending";
  if (rsvp.attending === false) return "not_attending";
  return "pending";
}

/**
 * All households for a wedding with RSVP status (one row per household).
 * Uses service role when available so RLS on `rsvps` cannot hide rows after guest submits.
 */
export async function getDashboardHouseholdRows(weddingId: string): Promise<DashboardHouseholdRow[]> {
  const supabase = getServiceRoleClientOrNull() ?? (await createClient());

  const [householdsResult, rsvpsResult] = await Promise.all([
    supabase
      .from("households")
      .select("id, household_name, invite_token, email, email_sent_at, invited_count")
      .eq("wedding_id", weddingId)
      .order("household_name", { ascending: true }),
    supabase
      .from("rsvps")
      .select("household_id, attending, notes, attending_count")
      .eq("wedding_id", weddingId)
      .order("id", { ascending: false }),
  ]);

  if (householdsResult.error) {
    console.error("Household fetch error:", householdsResult.error.message);
    return [];
  }

  if (rsvpsResult.error) {
    console.error("RSVP fetch error:", rsvpsResult.error.message);
    return [];
  }

  const householdRows = (householdsResult.data ?? []) as HouseholdRow[];
  const rsvpRows = (rsvpsResult.data ?? []) as RsvpRow[];

  /** Newest RSVP per household (query ordered by `id` descending; keep first seen). */
  const rsvpByHouseholdId = new Map<string, RsvpRow>();
  for (const r of rsvpRows) {
    if (r.household_id && !rsvpByHouseholdId.has(r.household_id)) {
      rsvpByHouseholdId.set(r.household_id, r);
    }
  }

  return householdRows.map((row) => {
    const rsvp = rsvpByHouseholdId.get(row.id);
    return {
      householdId: row.id,
      householdName: row.household_name ?? "Unnamed household",
      email: row.email ?? null,
      inviteToken: row.invite_token ?? null,
      emailSentAt: row.email_sent_at ?? null,
      invitedCount: row.invited_count ?? null,
      status: statusFromRsvp(rsvp),
      rsvpNote: rsvp?.notes ?? null,
      attendingCount: rsvp?.attending_count ?? null,
      submittedAt: null,
    };
  });
}
