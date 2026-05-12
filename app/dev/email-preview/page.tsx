import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";

import InvitationEmailHtmlPreview from "./InvitationEmailHtmlPreview";
import { loadInvitationEmailPreviewContext } from "@/lib/email/loadInvitationEmailPreviewContext";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ weddingId?: string; householdId?: string }>;
};

/** Always re-render email HTML from disk (avoid stale preview after template edits). */
export const dynamic = "force-dynamic";

export default async function EmailPreviewPage({ searchParams }: PageProps) {
  noStore();
  const sp = await searchParams;
  const weddingId = sp.weddingId?.trim();

  if (!weddingId) {
    return (
      <main className="min-h-screen bg-[#fafafa] px-4 py-10 text-[#181818]">
        <div className="mx-auto max-w-lg border border-[#181818]/15 bg-white p-6 text-sm">
          <p className="font-medium">Wedding required</p>
          <p className="mt-2 text-[#181818]/75">
            Open this page with your wedding id, for example{" "}
            <code className="rounded bg-[#f4f4f4] px-1 py-0.5 text-xs">/dev/email-preview?weddingId=YOUR_UUID</code>.
          </p>
          <p className="mt-2 text-[#181818]/75">
            Optional: <code className="text-xs">householdId=UUID</code> to pick which guest’s name and invite link to
            use (defaults to the first household on that wedding).
          </p>
          <p className="mt-4">
            <Link href="/admin" className="text-[#181818] underline underline-offset-4">
              Admin
            </Link>
          </p>
        </div>
      </main>
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

  const householdId = sp.householdId?.trim();

  const ctx = await loadInvitationEmailPreviewContext(supabase, user.id, weddingId, householdId);
  if (!ctx) {
    notFound();
  }

  const { household } = ctx;

  const embedParams = new URLSearchParams({ weddingId });
  if (householdId) embedParams.set("householdId", householdId);
  const embedSrc = `/dev/email-preview/embed?${embedParams.toString()}`;

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-10 text-[#181818]">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/55">Dev</p>
        <h1 className="mt-2 text-2xl font-medium">Email preview</h1>
        <p className="mt-2 text-sm text-[#181818]/65">
          Uses your saved invitation for wedding <code className="text-xs">{weddingId}</code>
          {household ? " and the selected household." : " (first household on this wedding)."}
        </p>
        {!household?.invite_token ? (
          <p className="mt-2 text-sm text-amber-900">
            No guest household yet — add one from the dashboard so the invite link matches a real{" "}
            <code className="text-xs">/invite/[token]</code>.
          </p>
        ) : null}
        <p className="mt-3 text-sm">
          <Link href={`/dashboard/${weddingId}`} className="text-[#181818] underline underline-offset-4">
            ← Guest list
          </Link>
        </p>
        <InvitationEmailHtmlPreview embedSrc={embedSrc} />
      </div>
    </main>
  );
}
