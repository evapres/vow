import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";

import AdminShellHeader from "@/app/components/admin/AdminShellHeader";
import InvitationWorkflowTabs from "@/app/components/admin/InvitationWorkflowTabs";
import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import { loadInvitationEmailPreviewContext } from "@/lib/email/loadInvitationEmailPreviewContext";
import { createClient } from "@/lib/supabase/server";

import InvitationEmailHtmlPreview from "./InvitationEmailHtmlPreview";
import ShareLinkPreview from "./ShareLinkPreview";

type PageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ householdId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function EmailPreviewPage({ params, searchParams }: PageProps) {
  noStore();
  const { weddingId } = await params;
  const sp = await searchParams;
  const householdId = sp.householdId?.trim();

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/${weddingId}/email-preview`)}`);
  }

  const ctx = await loadInvitationEmailPreviewContext(supabase, user.id, weddingId, householdId);
  if (!ctx) {
    notFound();
  }

  const { household } = ctx;
  const embedParams = householdId ? `?householdId=${encodeURIComponent(householdId)}` : "";
  const embedSrc = `/dashboard/${weddingId}/email-preview/embed${embedParams}`;

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
        <main className="admin-shell-main">
          <AdminShellHeader />

          <div className="mb-8">
            <h1 className="m3-page-title">Email preview</h1>
            <div className="mt-5">
              <InvitationWorkflowTabs weddingId={weddingId} activeStep={2} dashboardEnabled />
            </div>
          </div>

          {!household?.invite_token ? (
            <div className="m3-banner m3-banner--info" role="status">
              <p className="m3-banner__detail">
                Add a guest with an invite link on the dashboard so the preview uses a real invitation URL.
              </p>
            </div>
          ) : null}

          <p className="mb-6">
            <Link
              href={`/dashboard/${weddingId}`}
              className="text-sm font-medium text-[var(--m3-primary)] underline underline-offset-4 hover:opacity-80"
            >
              ← Guests &amp; RSVPs
            </Link>
          </p>

          <InvitationEmailHtmlPreview embedSrc={embedSrc} />

          {household?.invite_token?.trim() ? (
            <ShareLinkPreview inviteToken={household.invite_token} />
          ) : null}
        </main>
      </div>
    </InvitationFrame>
  );
}
