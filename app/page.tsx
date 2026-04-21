import Footer from "./components/Footer";
import InvitationFrame from "./components/InvitationFrame";
import InvitationHero from "./components/InvitationHero";
import RSVPSection from "./components/RSVPSection";
import { formatDetailsDateTime, formatHeaderDateLabel } from "../lib/invitationDisplay";

export default function Page() {
  const weddingDateIso = "2026-07-11T20:00:00";

  return (
    <InvitationFrame footer={<Footer coupleNames="Ava & Luca" year="2026" />}>
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1">
          <InvitationHero
            coupleNames="Nestor & Evangelia"
            eventDateLabel={formatHeaderDateLabel(weddingDateIso)}
            venueLabel="GRAND RESORT"
            detailsDateTime={formatDetailsDateTime(weddingDateIso)}
            detailsLocation="Agios Dimitrios, Grand Resort, Lagonisi, Attica"
            note="Reception to follow"
          />

          <RSVPSection
            rsvpDeadline="June 15th"
            weddingId="beb2f50a-672f-48f7-bcff-7cb72562c21a"
            householdId="40994c91-6916-433b-90a2-4e233b0024af"
            householdName="Test Household"
          />
        </main>
      </div>
    </InvitationFrame>
  );
}
