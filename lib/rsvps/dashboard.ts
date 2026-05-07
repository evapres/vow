import { createClient } from "../supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/** RSVP state for a household row on the wedding dashboard. */
export type HouseholdRsvpStatus = "attending" | "not_attending" | "pending";

export type DashboardHouseholdRow = {
  householdId: string;
  householdName: string;
  email: string | null;
  inviteToken: string | null;
  emailSentAt: string | null;
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
};

type RsvpRow = {
  household_id: string;
  attending: boolean;
  notes: string | null;
};

function statusFromRsvp(rsvp: RsvpRow | undefined): HouseholdRsvpStatus {
  if (!rsvp) return "pending";
  if (rsvp.attending === true) return "attending";
  if (rsvp.attending === false) return "not_attending";
  return "pending";
}

function getServiceRoleClientOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";
  if (!url?.trim() || !serviceKey.trim()) return null;
  return createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * All households for a wedding with RSVP status (one row per household).
 * Fetches households and RSVPs in two queries, then maps by `household_id`.
 */
export async function getDashboardHouseholdRows(weddingId: string): Promise<DashboardHouseholdRow[]> {
  const supabase = await createClient();

  const householdsResult = await supabase
    .from("households")
    .select("id, household_name, invite_token, email, email_sent_at")
    .eq("wedding_id", weddingId)
    .order("household_name", { ascending: true });

  if (householdsResult.error) {
    console.error("Household fetch error:", householdsResult.error.message);
    return [];
  }

  const householdRows = (householdsResult.data ?? []) as HouseholdRow[];
  const householdIds = householdRows.map((h) => String(h.id));

  const rsvpByHouseholdId = new Map<string, RsvpRow>();
  if (householdIds.length > 0) {
    const rsvpsResult = await supabase
      .from("rsvps")
      .select("household_id, attending, notes")
      .eq("wedding_id", weddingId)
      .in("household_id", householdIds);

    let rsvpRows = (rsvpsResult.data ?? []) as RsvpRow[];
    if (rsvpsResult.error) {
      // Most common reason: RLS denies selecting RSVPs for the admin session.
      // Retry using the service role key (server-side only) if available.
      const admin = getServiceRoleClientOrNull();
      if (admin) {
        const r2 = await admin
          .from("rsvps")
          .select("household_id, attending, notes")
          .eq("wedding_id", weddingId)
          .in("household_id", householdIds);
        if (r2.error) {
          console.error("RSVP fetch error (admin fallback):", r2.error.message);
          rsvpRows = [];
        } else {
          rsvpRows = (r2.data ?? []) as RsvpRow[];
        }
      } else {
        console.error("RSVP fetch error:", rsvpsResult.error.message);
        rsvpRows = [];
      }
    }

    // If multiple rows exist per household, last row wins.
    for (const r of rsvpRows) {
      const key = String(r.household_id);
      if (key) rsvpByHouseholdId.set(key, r);
    }
  }

  return householdRows.map((row) => {
    const rsvp = rsvpByHouseholdId.get(String(row.id));
    return {
      householdId: row.id,
      householdName: row.household_name ?? "Unnamed household",
      email: row.email ?? null,
      inviteToken: row.invite_token ?? null,
      emailSentAt: row.email_sent_at ?? null,
      status: statusFromRsvp(rsvp),
      rsvpNote: rsvp?.notes ?? null,
      attendingCount: null,
      submittedAt: null,
    };
  });
}
