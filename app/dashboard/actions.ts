"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Inserts a row into `households` for the wedding the current user owns. */
export async function createHousehold(formData: FormData) {
  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  const householdName = String(formData.get("household_name") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const email = emailRaw.length > 0 ? emailRaw : null;
  const inviteTokenInput = String(formData.get("invite_token") ?? "").trim();

  if (!weddingId || !householdName) {
    redirect(
      "/admin?household_error=" + encodeURIComponent("Wedding and household name are required."),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (weddingError || !wedding) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("You can only add guests to your own weddings."),
    );
  }

  const invite_token = inviteTokenInput || randomUUID();

  const { error } = await supabase.from("households").insert({
    wedding_id: weddingId,
    household_name: householdName,
    email,
    invite_token,
  });

  if (error) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(
    `/dashboard/${weddingId}?household_added=1&invite_token=${encodeURIComponent(invite_token)}`,
  );
}
