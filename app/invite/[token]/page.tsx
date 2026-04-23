import Footer from "@/app/components/Footer";
import InvitationFrame from "@/app/components/InvitationFrame";
import InvitationHero, { inviteHeroDefaultSrc } from "@/app/components/InvitationHero";
import RSVPSection from "@/app/components/RSVPSection";
import { formatDetailsDateTime, formatHeaderDateLabel } from "@/lib/invitationDisplay";
import { createClient } from "@/lib/supabase/server";
import { detailsLocationFromWedding, venueLabelFromWedding } from "@/lib/weddingLocation";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (householdError || !household) {
    return (
      <main className="full-width-section min-h-screen bg-transparent text-[#181818]">
        <div className="main-content pb-8 pt-0 sm:py-8">Invitation not found.</div>
      </main>
    );
  }

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", household.wedding_id)
    .single();

  if (weddingError || !wedding) {
    return (
      <main className="full-width-section min-h-screen bg-transparent text-[#181818]">
        <div className="main-content pb-8 pt-0 sm:py-8">Wedding not found.</div>
      </main>
    );
  }

  const dateRaw = wedding.wedding_date;

  return (
    <InvitationFrame removeMobileTopPadding footer={<Footer coupleNames={wedding.couple_names} year="2026" />}>
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1">
          <InvitationHero
            coupleNames={wedding.couple_names}
            eventDateLabel={formatHeaderDateLabel(dateRaw)}
            venueLabel={venueLabelFromWedding(wedding)}
            photoSrc={wedding.hero_image_url || inviteHeroDefaultSrc}
            detailsDateTime={formatDetailsDateTime(dateRaw)}
            detailsLocation={detailsLocationFromWedding(wedding)}
            note={wedding.note}
          />

          <RSVPSection
            rsvpDeadline={wedding.rsvp_deadline || "—"}
            weddingId={wedding.id}
            householdId={household.id}
            householdName={household.household_name}
          />
        </main>
      </div>
    </InvitationFrame>
  );
}
