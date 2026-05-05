"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email/sendInvitationEmail";

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

function optionalText(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

/** Updates household name/email for the wedding the current user owns. */
export async function updateHousehold(formData: FormData) {
  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();
  const householdName = String(formData.get("household_name") ?? "").trim();
  const email = optionalText(formData.get("email"));

  if (!weddingId || !householdId || !householdName) {
    redirect(
      `/dashboard/${weddingId || ""}?household_error=` +
        encodeURIComponent("Wedding, household id, and household name are required."),
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

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id")
    .eq("id", householdId)
    .eq("wedding_id", weddingId)
    .limit(1)
    .maybeSingle();

  if (householdError || !household) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("Household not found (or you don't have access)."),
    );
  }

  // Ensure the wedding is owned by this user (prevents cross-user updates).
  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (weddingError || !wedding) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("You can only edit guests on your own weddings."),
    );
  }

  const { error: updateError } = await supabase
    .from("households")
    .update({ household_name: householdName, email })
    .eq("id", householdId)
    .eq("wedding_id", weddingId);

  if (updateError) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(updateError.message));
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/dashboard/${weddingId}?household_updated=1`);
}

/** Deletes a household (and its RSVPs) for the wedding the current user owns. */
export async function deleteHousehold(formData: FormData) {
  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();

  if (!weddingId || !householdId) {
    redirect(
      `/dashboard/${weddingId || ""}?household_error=` +
        encodeURIComponent("Wedding and household id are required."),
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
        encodeURIComponent("You can only delete guests from your own weddings."),
    );
  }

  // Delete RSVPs first to avoid FK violations (if any).
  const { error: rsvpsError } = await supabase
    .from("rsvps")
    .delete()
    .eq("household_id", householdId)
    .eq("wedding_id", weddingId);
  if (rsvpsError) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(rsvpsError.message));
  }

  const { error: deleteError } = await supabase
    .from("households")
    .delete()
    .eq("id", householdId)
    .eq("wedding_id", weddingId);

  if (deleteError) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(deleteError.message));
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/dashboard/${weddingId}?household_deleted=1`);
}

function publicSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
}

/** Sends the invitation email via Resend and records `email_sent_at` on the household. */
export async function sendHouseholdInvitationEmail(formData: FormData) {
  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();

  if (!weddingId || !householdId) {
    redirect(
      `/dashboard/${weddingId || ""}?household_error=` +
        encodeURIComponent("Wedding and household id are required."),
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
    .select("id, couple_names, wedding_date, location")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (weddingError || !wedding) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("You can only send invitations for your own weddings."),
    );
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, email, invite_token")
    .eq("id", householdId)
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (householdError || !household) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("Household not found (or you don't have access)."),
    );
  }

  const email = household.email?.trim();
  const token = household.invite_token?.trim();
  if (!email || !token) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("Household must have an email and invite link to send an invitation."),
    );
  }

  const origin = publicSiteOrigin();
  if (!origin) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("NEXT_PUBLIC_SITE_URL is not set; cannot build the invite link."),
    );
  }

  const inviteUrl = `${origin}/invite/${token}`;

  try {
    await sendInvitationEmail({
      to: email,
      coupleNames: (wedding.couple_names ?? "").trim() || "Couple",
      weddingDate: wedding.wedding_date ?? undefined,
      location: wedding.location?.trim() || undefined,
      inviteUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send invitation email.";
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(msg));
  }

  const sentAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("households")
    .update({ email_sent_at: sentAt })
    .eq("id", householdId)
    .eq("wedding_id", weddingId);

  if (updateError) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(updateError.message));
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/dashboard/${weddingId}?invitation_email_sent=1`);
}
