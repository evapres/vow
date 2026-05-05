import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import RsvpsDashboardView from "../RsvpsDashboardView";
import { createClient } from "@/lib/supabase/server";
import { getDashboardHouseholdRows } from "../../../lib/rsvps/dashboard";
import { invitationStepMissingFields, isInvitationStepComplete } from "@/lib/weddingProgress";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{
    household_added?: string;
    household_updated?: string;
    household_deleted?: string;
    invitation_email_sent?: string;
    household_error?: string;
    invite_token?: string;
  }>;
};

function safeDecodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function DashboardWeddingPage({ params, searchParams }: PageProps) {
  const { weddingId } = await params;
  const sp = await searchParams;
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const siteOrigin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

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
    .select("id, couple_names, wedding_date, venue_name, church_name, street_address, rsvp_deadline")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (weddingError || !wedding) {
    notFound();
  }

  if (!isInvitationStepComplete(wedding)) {
    const missing = invitationStepMissingFields(wedding);
    const msg = missing.length
      ? `Finish invitation (missing: ${missing.join(", ")}) to access the dashboard.`
      : "Finish invitation to access the dashboard.";
    redirect(`/admin/edit/${weddingId}?error=${encodeURIComponent(msg)}`);
  }

  const households = await getDashboardHouseholdRows(weddingId);
  const householdError = sp.household_error ? safeDecodeParam(sp.household_error) : null;
  const householdAdded = sp.household_added === "1";
  const householdUpdated = sp.household_updated === "1";
  const householdDeleted = sp.household_deleted === "1";
  const invitationEmailSent = sp.invitation_email_sent === "1";
  const newInviteToken = sp.invite_token ? safeDecodeParam(sp.invite_token) : null;

  return (
    <RsvpsDashboardView
      households={households}
      weddingId={weddingId}
      householdAdded={householdAdded}
      householdUpdated={householdUpdated}
      householdDeleted={householdDeleted}
      invitationEmailSent={invitationEmailSent}
      householdError={householdError}
      newInviteToken={newInviteToken}
      inviteBaseUrl={siteOrigin}
    />
  );
}
