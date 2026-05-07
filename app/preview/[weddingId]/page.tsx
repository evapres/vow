import Footer from "@/app/components/Footer";
import AdminBurgerMenu from "@/app/components/AdminBurgerMenu";
import InvitationFrame from "@/app/components/InvitationFrame";
import InvitationHero, { inviteHeroDefaultSrc } from "@/app/components/InvitationHero";
import { invitationRsvpBandStyle } from "@/app/components/invitationDarkBandStyle";
import {
  formatDetailsDateTime,
  formatHeaderDateLabel,
  toAllCapsNoAccents,
} from "@/lib/invitationDisplay";
import { createClient } from "@/lib/supabase/server";
import { detailsLocationFromWedding, venueLabelFromWedding } from "@/lib/weddingLocation";

type PageProps = {
  params: Promise<{ weddingId: string }>;
};

function footerYear(weddingDate: string | null | undefined): string {
  if (!weddingDate) return String(new Date().getFullYear());
  const d = new Date(weddingDate);
  return Number.isNaN(d.getTime()) ? String(new Date().getFullYear()) : String(d.getFullYear());
}

function topMonogramFromCoupleNames(names: string): { left: string; right: string } {
  const parts = names.split("&").map((p) => p.trim());
  const left = parts[0]?.[0];
  const right = parts[1]?.[0];
  if (left && right) return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
  return { left: "A", right: "B" };
}

export default async function PreviewWeddingPage({ params }: PageProps) {
  const { weddingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="full-width-section min-h-screen bg-transparent text-[#1A1A1A]">
        <div className="main-content pb-8 pt-0 sm:py-8">Sign in to preview your invitation.</div>
      </main>
    );
  }

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (error || !wedding) {
    return (
      <main className="full-width-section min-h-screen bg-transparent text-[#1A1A1A]">
        <div className="main-content pb-8 pt-0 sm:py-8">Wedding not found.</div>
      </main>
    );
  }

  const language = (wedding.language === "el" ? "el" : "en") as "en" | "el";

  return (
    <InvitationFrame
      removeMobileTopPadding
      footer={<Footer coupleNames={wedding.couple_names} year={footerYear(wedding.wedding_date)} />}
    >
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1">
          <div className="flex justify-end px-[var(--invite-gutter,12px)] pt-4">
            <AdminBurgerMenu weddingId={weddingId} />
          </div>
          <InvitationHero
            coupleNames={wedding.couple_names}
            language={language}
            eventDateLabel={formatHeaderDateLabel(wedding.wedding_date, language)}
            venueLabel={venueLabelFromWedding(wedding)}
            photoSrc={wedding.hero_image_url || inviteHeroDefaultSrc}
            topMonogramLetters={topMonogramFromCoupleNames(wedding.couple_names)}
            detailsDateTime={formatDetailsDateTime(wedding.wedding_date, language)}
            detailsLocation={detailsLocationFromWedding(wedding)}
            note={wedding.note}
          />

          <section
            id="rsvp"
            aria-label="RSVP preview"
            className="mt-8 w-[calc(100%+2*var(--invite-gutter,12px))] max-w-none -mx-[var(--invite-gutter,12px)]"
          >
            <div
              className="w-full px-[var(--invite-gutter,12px)] py-16 text-center text-[#FCFCF6] lg:py-20"
              style={invitationRsvpBandStyle}
            >
              <div className="mx-auto max-w-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#FCFCF6]/70">
                  {language === "el" ? toAllCapsNoAccents("Προεπισκόπηση") : toAllCapsNoAccents("Preview")}
                </p>
                <p
                  className="mt-6 text-[40px] font-normal leading-[0.95] tracking-[0.01em] text-[#FCFCF6] sm:text-[48px]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {language === "el" ? "Περιοχή RSVP" : "RSVP area"}
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-[#FCFCF6]/75">
                  {language === "el"
                    ? "Οι καλεσμένοι επιβεβαιώνουν την παρουσία τους μέσω του προσωπικού τους συνδέσμου. Η περιοχή αυτή δεν είναι διαδραστική στην προεπισκόπηση."
                    : "Guests submit RSVPs through their personal invite link. This area is not interactive in preview mode."}
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </InvitationFrame>
  );
}
