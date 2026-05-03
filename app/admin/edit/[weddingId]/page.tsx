import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import InvitationFrame from "@/app/components/InvitationFrame";
import AdminNewWeddingForm from "@/app/admin/AdminNewWeddingForm";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import AdminBurgerMenu from "@/app/components/AdminBurgerMenu";
import { createClient } from "@/lib/supabase/server";
import { splitWeddingDateTimeForForm } from "@/lib/invitationDisplay";
import { hydrateLocationFormFields } from "@/lib/weddingLocation";
import { isInvitationStepComplete } from "@/lib/weddingProgress";

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
    heroImageUrl: wedding.hero_image_url ?? null,
    rsvpDeadline: rsvp,
    note: wedding.note ?? "",
  };

  const saved = sp.saved === "1";
  const formError = sp.error ? safeDecode(sp.error) : null;
  const step1Complete = isInvitationStepComplete(wedding);

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1 py-10">
          <div className="mb-6 flex items-center justify-end">
            <AdminBurgerMenu weddingId={weddingId} />
          </div>
          <div className="mb-8 border-b border-[#181818]/20 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/60">Admin</p>
            <h1 className="mt-2 text-3xl font-medium tracking-[0.02em]">Edit invitation</h1>
            <p className="mt-2 text-sm text-[#181818]/65">
              Update details and preview — same as when you created this wedding.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 items-center rounded-full border border-[#181818]/25 bg-[#181818]/[0.02] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#181818]">
                  Step 1: Invitation
                </span>
                {step1Complete ? (
                  <Link
                    href={`/dashboard/${weddingId}`}
                    className="inline-flex h-7 items-center rounded-full border border-[#181818]/25 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#181818]/80 hover:text-[#181818]"
                  >
                    Step 2: Dashboard →
                  </Link>
                ) : (
                  <span
                    className="inline-flex h-7 cursor-not-allowed items-center rounded-full border border-[#181818]/15 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#181818]/35"
                    title="Finish invitation details to unlock the dashboard."
                  >
                    Step 2: Dashboard (locked)
                  </span>
                )}
              </div>
              <span className="text-[#181818]/55">·</span>
              <Link href="/" className="font-medium text-[#181818]/75 underline underline-offset-4 hover:text-[#181818]">
                Back to invitation
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

          <AdminNewWeddingForm editWeddingId={weddingId} initial={initial} />
        </main>
      </div>
    </InvitationFrame>
  );
}
