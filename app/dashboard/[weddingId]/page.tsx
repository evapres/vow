import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import RsvpsDashboardView from "../RsvpsDashboardView";
import { createClient } from "@/lib/supabase/server";
import { getDashboardHouseholdRows } from "../../../lib/rsvps/dashboard";

type PageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ household_added?: string; household_error?: string; invite_token?: string }>;
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
    .select("id")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (weddingError || !wedding) {
    notFound();
  }

  const households = await getDashboardHouseholdRows(weddingId);
  const householdError = sp.household_error ? safeDecodeParam(sp.household_error) : null;
  const householdAdded = sp.household_added === "1";
  const newInviteToken = sp.invite_token ? safeDecodeParam(sp.invite_token) : null;

  return (
    <RsvpsDashboardView
      households={households}
      weddingId={weddingId}
      householdAdded={householdAdded}
      householdError={householdError}
      newInviteToken={newInviteToken}
      inviteBaseUrl={siteOrigin}
    />
  );
}
