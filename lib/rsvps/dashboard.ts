import { createClient } from "../supabase/server";

/** RSVP state for a household row on the wedding dashboard. */
export type HouseholdRsvpStatus = "attending" | "not_attending" | "pending";

export type DashboardHouseholdRow = {
  householdId: string;
  householdName: string;
  email: string | null;
  inviteToken: string | null;
  emailSentAt: string | null;
  status: HouseholdRsvpStatus;
  /** Raw note from `rsvps.note` when an RSVP exists; otherwise null. */
  rsvpNote: string | null;
  attendingCount: number | null;
  submittedAt: string | null;
};

type RsvpEmbed = {
  attending: boolean;
  note: string | null;
  number_attending: number | null;
  submitted_at: string;
};

type HouseholdQueryRow = {
  id: string;
  household_name: string;
  invite_token: string | null;
  email: string | null;
  email_sent_at: string | null;
  rsvps: RsvpEmbed[] | RsvpEmbed | null;
};

function firstRsvp(embed: HouseholdQueryRow["rsvps"]): RsvpEmbed | null {
  if (embed == null) return null;
  if (Array.isArray(embed)) return embed[0] ?? null;
  return embed;
}

function statusFromRsvp(rsvp: RsvpEmbed | null): HouseholdRsvpStatus {
  if (!rsvp) return "pending";
  return rsvp.attending ? "attending" : "not_attending";
}

/**
 * All households for a wedding with their latest RSVP (one row per household).
 * Expects `households.wedding_id` and `rsvps.household_id` FK; embed is a left join.
 */
export async function getDashboardHouseholdRows(weddingId: string): Promise<DashboardHouseholdRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("households")
    .select(
      `
      id,
      household_name,
      invite_token,
      email,
      email_sent_at,
      rsvps (
        attending,
        note,
        number_attending,
        submitted_at
      )
    `,
    )
    .eq("wedding_id", weddingId)
    .order("household_name", { ascending: true });

  if (error) {
    console.error("Household + RSVP fetch error:", error.message);
    return [];
  }

  const rows = (data ?? []) as HouseholdQueryRow[];

  return rows.map((row) => {
    const rsvp = firstRsvp(row.rsvps);
    return {
      householdId: row.id,
      householdName: row.household_name ?? "Unnamed household",
      email: row.email ?? null,
      inviteToken: row.invite_token ?? null,
      emailSentAt: row.email_sent_at ?? null,
      status: statusFromRsvp(rsvp),
      rsvpNote: rsvp?.note ?? null,
      attendingCount: rsvp?.number_attending ?? null,
      submittedAt: rsvp?.submitted_at ?? null,
    };
  });
}
