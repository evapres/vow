import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import InvitationFrame from "@/app/components/InvitationFrame";
import AdminNewWeddingForm from "@/app/admin/AdminNewWeddingForm";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import AdminShellHeader from "@/app/components/admin/AdminShellHeader";
import InvitationWorkflowTabs from "@/app/components/admin/InvitationWorkflowTabs";
import { createClient } from "@/lib/supabase/server";
import { loadOwnedWeddingEditPageRow } from "@/lib/adminWeddingFormLoad";
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

  const { data: wedding, error } = await loadOwnedWeddingEditPageRow(supabase, weddingId, user.id);

  if (error || !wedding) {
    notFound();
  }

  const saved = sp.saved === "1";
  const formError = sp.error ? safeDecode(sp.error) : null;
  const step1Complete = isInvitationStepComplete(wedding as Parameters<typeof isInvitationStepComplete>[0]);
  const step1Missing = step1Complete ? [] : invitationStepMissingFields(wedding as Parameters<typeof invitationStepMissingFields>[0]);

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
            <div className="m3-banner m3-banner--success" role="status">
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

          <AdminNewWeddingForm editWeddingId={weddingId} />
        </main>
      </div>
    </InvitationFrame>
  );
}
