import {
  summarizeDashboardGuestStats,
  type DashboardHouseholdRow,
} from "@/lib/rsvps/dashboard";

type DashboardGuestStatCardsProps = {
  households: DashboardHouseholdRow[];
};

export default function DashboardGuestStatCards({ households }: DashboardGuestStatCardsProps) {
  const stats = summarizeDashboardGuestStats(households);

  const cards = [
    { key: "invited", label: "Guests invited", value: stats.invitedGuests },
    { key: "coming", label: "Coming", value: stats.attendingGuests },
    { key: "not-coming", label: "Not coming", value: stats.notAttendingGuests },
    { key: "pending", label: "Not yet replied", value: stats.pendingGuests },
  ] as const;

  return (
    <div className="m3-stat-grid" data-stat-cards="4">
      {cards.map((card) => (
        <div key={card.key} className="m3-stat-card">
          <p className="m3-stat-card__label">{card.label}</p>
          <p className="m3-stat-card__value">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
