import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/app/components/Footer";
import InvitationFrame from "@/app/components/InvitationFrame";
import InvitationHero, { inviteHeroDefaultSrc } from "@/app/components/InvitationHero";
import InvitationMusic from "@/app/components/InvitationMusic";
import RSVPSection from "@/app/components/RSVPSection";
import { formatDetailsDateTime, formatHeaderDateLabel } from "@/lib/invitationDisplay";
import { resolveCoupleMonogramLetters } from "@/lib/coupleInitials";
import { inviteMetadataForToken } from "@/lib/invite/inviteOpenGraph";
import { getInviteByToken } from "@/lib/invite/loadInviteByToken";
import { isHouseholdRsvpRecorded } from "@/lib/invite/householdRsvpRecorded";
import { parseInvitationThemeId } from "@/lib/invitationThemes";
import { detailsLocationFromWedding, venueLabelFromWedding } from "@/lib/weddingLocation";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  return inviteMetadataForToken(token);
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const loaded = await getInviteByToken(token);

  if (!loaded) {
    notFound();
  }

  const { household, wedding } = loaded;
  const dateRaw = wedding.wedding_date;
  const language = (wedding.language === "el" ? "el" : "en") as "en" | "el";
  const rsvpAlreadyRecorded = await isHouseholdRsvpRecorded(wedding.id, household.id);
  const invitationTheme = parseInvitationThemeId(wedding.invitation_theme);

  return (
    <InvitationFrame
      theme={invitationTheme}
      removeMobileTopPadding
      footer={<Footer coupleNames={wedding.couple_names ?? ""} year="2026" />}
    >
      <InvitationMusic language={language} src={wedding.invitation_music_url} />
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1">
          <InvitationHero
            coupleNames={wedding.couple_names ?? ""}
            language={language}
            theme={invitationTheme}
            eventDateLabel={formatHeaderDateLabel(dateRaw, language)}
            venueLabel={venueLabelFromWedding(wedding)}
            photoSrc={wedding.hero_image_url || inviteHeroDefaultSrc}
            topMonogramLetters={resolveCoupleMonogramLetters({
              coupleNames: wedding.couple_names ?? "",
              coupleInitialLeft: wedding.couple_initial_left,
              coupleInitialRight: wedding.couple_initial_right,
              language,
            })}
            detailsDateTime={formatDetailsDateTime(dateRaw, language)}
            detailsLocation={detailsLocationFromWedding(wedding)}
            note={wedding.note}
          />

          <RSVPSection
            rsvpDeadline={wedding.rsvp_deadline || "—"}
            weddingId={wedding.id}
            householdId={household.id}
            householdName={household.household_name ?? ""}
            language={language}
            theme={invitationTheme}
            rsvpAlreadyRecorded={rsvpAlreadyRecorded}
            invitedCount={household.invited_count ?? null}
          />
        </main>
      </div>
    </InvitationFrame>
  );
}
