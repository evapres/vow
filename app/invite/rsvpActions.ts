"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";

import { revalidatePath } from "next/cache";

type SubmitRsvpInput = {
  householdId: string;
  response: "yes" | "no";
  notes: string;
};

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";

  if (!url?.trim()) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!serviceKey.trim()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (required for server-side RSVP writes).");
  }

  return createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SubmitRsvpResult = { ok: true } | { ok: false; error: string };

export async function submitRsvp(input: SubmitRsvpInput): Promise<SubmitRsvpResult> {
  try {
    const householdId = input.householdId.trim();
    const response = input.response;
    const notes = input.notes.trim();

    if (!householdId) return { ok: false, error: "householdId is required" };
    if (response !== "yes" && response !== "no") return { ok: false, error: "response must be yes|no" };

    const supabase = getServiceRoleClient();

    const { data: household, error: householdError } = await supabase
      .from("households")
      .select("id, wedding_id")
      .eq("id", householdId)
      .single();

    if (householdError || !household) {
      return { ok: false, error: householdError?.message ?? "Household not found." };
    }

    const { error: rsvpError } = await supabase.from("rsvps").upsert(
      {
        household_id: household.id,
        wedding_id: household.wedding_id,
        attending: response === "yes",
        notes,
      },
      { onConflict: "household_id,wedding_id" },
    );

    if (rsvpError) {
      return { ok: false, error: rsvpError.message };
    }

    revalidatePath(`/dashboard/${household.wedding_id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save RSVP." };
  }
}

