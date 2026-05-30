"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { buildInvitationEmailProps, type WeddingLike } from "@/lib/email/buildInvitationEmailProps";
import { loadWeddingForInvitationEmail } from "@/lib/email/loadWeddingForInvitationEmail";
import { resolvePublicSiteOrigin } from "@/lib/resolvePublicSiteOrigin";
import { sendInvitationEmail } from "@/lib/email/sendInvitationEmail";

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
 * After auth + ownership checks via the user JWT client, writes should use this when
 * `SUPABASE_SERVICE_ROLE_KEY` is set so household/rsvp mutations aren't blocked by RLS.
 */
function dbAfterAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  return getServiceRoleClientOrNull() ?? supabase;
}

/** Inserts a row into `households` for the wedding the current user owns. */
export async function createHousehold(formData: FormData) {
  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  const householdName = String(formData.get("household_name") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const email = emailRaw.length > 0 ? emailRaw : null;
  const invitedCountRaw = String(formData.get("invited_count") ?? "").trim();
  const invited_count =
    invitedCountRaw.length > 0 && Number.isFinite(Number(invitedCountRaw))
      ? Math.max(1, Math.floor(Number(invitedCountRaw)))
      : null;
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

  const invite_token = randomUUID();

  const { error } = await supabase.from("households").insert({
    wedding_id: weddingId,
    household_name: householdName,
    email,
    invited_count,
    invite_token,
  });

  if (error) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/dashboard/${weddingId}?household_added=1`);
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
  const invitedCountRaw = String(formData.get("invited_count") ?? "").trim();
  const invited_count =
    invitedCountRaw.length > 0 && Number.isFinite(Number(invitedCountRaw))
      ? Math.max(1, Math.floor(Number(invitedCountRaw)))
      : null;

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

  const mutate = dbAfterAuth(supabase);
  const { error: updateError } = await mutate
    .from("households")
    .update({ household_name: householdName, email, invited_count })
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

  const mutate = dbAfterAuth(supabase);

  const { error: rsvpsError } = await mutate.from("rsvps").delete().eq("household_id", householdId);
  if (rsvpsError) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(rsvpsError.message));
  }

  const { error: deleteError } = await mutate
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

const SITE_ORIGIN_MISSING_MSG =
  "Could not build invite links. Set NEXT_PUBLIC_SITE_URL to your public site (e.g. https://vow.vip), or ensure your host forwards x-forwarded-host / host (local dev: open the dashboard at http://localhost:3000/...).";

type HouseholdInviteRow = {
  id: string;
  email: string | null;
  invite_token: string | null;
  household_name: string | null;
};

/** Sends one invitation and sets `email_sent_at` (used by single-send and bulk-send). */
async function deliverHouseholdInvitationEmail(args: {
  mutate: ReturnType<typeof dbAfterAuth>;
  wedding: WeddingLike;
  weddingId: string;
  household: HouseholdInviteRow;
  origin: string;
}): Promise<void> {
  const email = args.household.email?.trim();
  const token = args.household.invite_token?.trim();
  if (!email || !token) {
    throw new Error("Household must have an email and invite link to send an invitation.");
  }

  const emailProps = await buildInvitationEmailProps({
    wedding: args.wedding,
    household: {
      household_name: args.household.household_name,
      invite_token: token,
    },
    siteOrigin: args.origin,
  });

  await sendInvitationEmail({ to: email, emailProps });

  const sentAt = new Date().toISOString();
  const { error: updateError } = await args.mutate
    .from("households")
    .update({ email_sent_at: sentAt })
    .eq("id", args.household.id)
    .eq("wedding_id", args.weddingId);

  if (updateError) {
    throw new Error(updateError.message);
  }
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

  const { wedding, error: weddingError } = await loadWeddingForInvitationEmail(
    supabase,
    weddingId,
    user.id,
  );

  if (weddingError || !wedding) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent(
          weddingError?.message ??
            "You can only send invitations for your own weddings.",
        ),
    );
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, email, invite_token, household_name")
    .eq("id", householdId)
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (householdError || !household) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent("Household not found (or you don't have access)."),
    );
  }

  const origin = await resolvePublicSiteOrigin();
  if (!origin) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(SITE_ORIGIN_MISSING_MSG));
  }

  const mutate = dbAfterAuth(supabase);

  try {
    await deliverHouseholdInvitationEmail({
      mutate,
      wedding,
      weddingId,
      household: household as HouseholdInviteRow,
      origin,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send invitation email.";
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(msg));
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/dashboard/${weddingId}?invitation_email_sent=1`);
}

/** Sends invitation emails to every household on this wedding that has an email + token and no `email_sent_at` yet. */
export async function sendAllHouseholdInvitationEmails(formData: FormData) {
  const weddingId = String(formData.get("wedding_id") ?? "").trim();

  if (!weddingId) {
    redirect(
      `/dashboard/?household_error=` + encodeURIComponent("Wedding id is required to send invitations."),
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

  const { wedding, error: weddingError } = await loadWeddingForInvitationEmail(
    supabase,
    weddingId,
    user.id,
  );

  if (weddingError || !wedding) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent(
          weddingError?.message ??
            "You can only send invitations for your own weddings.",
        ),
    );
  }

  const origin = await resolvePublicSiteOrigin();
  if (!origin) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(SITE_ORIGIN_MISSING_MSG));
  }

  const { data: householdRows, error: listError } = await supabase
    .from("households")
    .select("id, email, invite_token, household_name, email_sent_at")
    .eq("wedding_id", weddingId)
    .is("email_sent_at", null);

  if (listError) {
    redirect(`/dashboard/${weddingId}?household_error=` + encodeURIComponent(listError.message));
  }

  const candidates = (householdRows ?? []).filter((h) => {
    const email = (h as HouseholdInviteRow).email?.trim();
    const token = (h as HouseholdInviteRow).invite_token?.trim();
    return Boolean(email && token);
  }) as HouseholdInviteRow[];

  if (candidates.length === 0) {
    redirect(
      `/dashboard/${weddingId}?household_error=` +
        encodeURIComponent(
          "No guests are waiting for an invitation. Add an email to each household, or invitations were already sent.",
        ),
    );
  }

  const mutate = dbAfterAuth(supabase);
  let sent = 0;

  for (const household of candidates) {
    try {
      await deliverHouseholdInvitationEmail({
        mutate,
        wedding,
        weddingId,
        household,
        origin,
      });
      sent += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send invitation email.";
      revalidatePath(`/dashboard/${weddingId}`);
      const q =
        sent > 0
          ? `household_error=${encodeURIComponent(msg)}&bulk_invites_sent=${sent}`
          : `household_error=${encodeURIComponent(msg)}`;
      redirect(`/dashboard/${weddingId}?${q}`);
    }
  }

  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/dashboard/${weddingId}?bulk_invites_sent=${sent}`);
}
