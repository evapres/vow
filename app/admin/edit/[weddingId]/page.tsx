import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import InvitationFrame from "@/app/components/InvitationFrame";
import AdminNewWeddingForm from "@/app/admin/AdminNewWeddingForm";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import AdminShellHeader from "@/app/components/admin/AdminShellHeader";
import InvitationWorkflowTabs from "@/app/components/admin/InvitationWorkflowTabs";
import { createClient } from "@/lib/supabase/server";
import { splitWeddingDateTimeForForm } from "@/lib/invitationDisplay";
import { parseInvitationThemeId } from "@/lib/invitationThemes";
import { heroImageUrlForAdminEdit } from "@/lib/weddingHeroAdmin";
import { hydrateLocationFormFields } from "@/lib/weddingLocation";
import { invitationStepMissingFields, isInvitationStepComplete } from "@/lib/weddingProgress";

type PageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function EditWeddingPage({ params, searchParams }: PageProps) {
  const { weddingId } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (error || !wedding) {
    notFound();
  }

  const { date, time } = splitWeddingDateTimeForForm(wedding.wedding_date);
  const rsvp = wedding.rsvp_deadline ? String(wedding.rsvp_deadline).slice(0, 10) : "";

  const locFields = hydrateLocationFormFields(wedding);
  const initial = {
    coupleNames: wedding.couple_names ?? "",
    language: (wedding.language === "el" ? "el" : "en") as "en" | "el",
    weddingDate: date,
    weddingTime: time,
    venueName: locFields.venueName,
    churchName: locFields.churchName,
    streetAddress: locFields.streetAddress,
    heroImageUrl: heroImageUrlForAdminEdit(weddingId, wedding.hero_image_url),
    rsvpDeadline: rsvp,
    note: wedding.note ?? "",
    invitationMusicUrl: wedding.invitation_music_url ?? null,
    invitationTheme: parseInvitationThemeId(wedding.invitation_theme),
  };

  const saved = sp.saved === "1";
  const formError = sp.error ? safeDecode(sp.error) : null;
  const step1Complete = isInvitationStepComplete(wedding);
  const step1Missing = step1Complete ? [] : invitationStepMissingFields(wedding);

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
        <main className="admin-shell-main">
          <AdminShellHeader />
          <div className="mb-8">
            <h1 className="text-3xl font-medium tracking-[0.02em]">Edit invitation</h1>
            <div className="mt-5">
              <InvitationWorkflowTabs
                weddingId={weddingId}
                activeStep={1}
                dashboardEnabled={step1Complete}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-sm">
              <Link
                href="/admin/invitations"
                className="font-medium text-[#181818]/75 underline underline-offset-4 hover:text-[#181818]"
              >
                All invitations
              </Link>
              <span className="text-[#181818]/55">·</span>
              <Link
                href="/admin/new"
                className="font-medium text-[#181818]/75 underline underline-offset-4 hover:text-[#181818]"
              >
                Create new
              </Link>
            </div>
          </div>

          {saved ? (
            <div className="mb-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Invitation saved.
            </div>
          ) : null}
          {formError ? (
            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{formError}</div>
          ) : null}
          {step1Missing.length > 0 ? (
            <div className="mb-6 border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
              <p className="font-medium">RSVP dashboard is locked until you complete:</p>
              <p className="mt-1 capitalize">{step1Missing.join(", ")}</p>
            </div>
          ) : null}

          <AdminNewWeddingForm editWeddingId={weddingId} initial={initial} />
        </main>
      </div>
    </InvitationFrame>
  );
}
