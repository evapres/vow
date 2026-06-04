import Link from "next/link";
import { redirect } from "next/navigation";

import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import AdminShellHeader from "@/app/components/admin/AdminShellHeader";
import { createClient } from "@/lib/supabase/server";

import AdminNewWeddingForm from "../AdminNewWeddingForm";

type PageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

function safeDecodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Create a new wedding — never auto-redirects to an existing invitation. */
export default async function AdminNewWeddingPage({ searchParams }: PageProps) {
  const { created, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/new");
  }

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
        <main className="admin-shell-main">
          <AdminShellHeader />
          <div className="mb-8 border-b border-[#181818]/20 pb-4">
            <h1 className="text-3xl font-medium tracking-[0.02em]">New invitation</h1>
            <p className="mt-3">
              <Link
                href="/admin/invitations"
                className="text-sm font-medium text-[#181818]/75 underline underline-offset-4 hover:text-[#181818]"
              >
                ← Back to all invitations
              </Link>
            </p>
          </div>

          {created ? (
            <div className="m3-banner m3-banner--success" role="status">
              <p className="m3-banner__title">Invitation created.</p>
              <p className="m3-banner__detail">
                <Link href={`/dashboard/${created}`}>Open dashboard</Link>
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {safeDecodeParam(error)}
            </div>
          ) : null}

          <AdminNewWeddingForm />
        </main>
      </div>
    </InvitationFrame>
  );
}
