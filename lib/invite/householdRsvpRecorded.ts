import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

function getServiceRoleClientOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";
  if (!url?.trim() || !serviceKey.trim()) return null;
  return createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True if this household has any RSVP row for the wedding (invite page / submit guard). */
export async function isHouseholdRsvpRecorded(weddingId: string, householdId: string): Promise<boolean> {
  const wid = weddingId.trim();
  const hid = householdId.trim();
  if (!wid || !hid) return false;

  const admin = getServiceRoleClientOrNull();
  const supabase = admin ?? (await createClient());

  const { data, error } = await supabase
    .from("rsvps")
    .select("household_id")
    .eq("wedding_id", wid)
    .eq("household_id", hid)
    .maybeSingle();

  if (error) {
    console.error("isHouseholdRsvpRecorded:", error.message);
    return false;
  }

  return data != null;
}
