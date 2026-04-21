import Link from "next/link";

import AddGuestForm from "./AddGuestForm";
import type { DashboardHouseholdRow, HouseholdRsvpStatus } from "../../lib/rsvps/dashboard";

type RsvpsDashboardViewProps = {
  households: DashboardHouseholdRow[];
  weddingId: string;
  householdAdded?: boolean;
  householdError?: string | null;
  /** Present on redirect after adding a guest; used to show copyable invite URL. */
  newInviteToken?: string | null;
  /** e.g. https://yoursite.com — optional; falls back to relative path only. */
  inviteBaseUrl?: string;
};

function attendingLabel(status: HouseholdRsvpStatus): string {
  if (status === "attending") return "Attending";
  if (status === "not_attending") return "Not attending";
  return "No response yet";
}

function noteCell(row: DashboardHouseholdRow): string {
  if (row.status === "pending") return "No note";
  const t = row.rsvpNote?.trim();
  return t && t.length > 0 ? t : "No note";
}

export default function RsvpsDashboardView({
  households,
  weddingId,
  householdAdded,
  householdError,
  newInviteToken,
  inviteBaseUrl,
}: RsvpsDashboardViewProps) {
  const counts = households.reduce(
    (acc, row) => {
      if (row.status === "attending") acc.yes += 1;
      if (row.status === "not_attending") acc.no += 1;
      return acc;
    },
    { yes: 0, no: 0 },
  );

  return (
    <main className="full-width-section min-h-screen bg-transparent py-10 text-[#1A1A1A]">
      <div className="main-content">
        <div className="mb-8 flex flex-col gap-6 border-b border-[#1A1A1A]/20 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1A1A1A]/60">Dashboard</p>
            <h1
              className="mt-2 text-4xl font-medium tracking-[0.02em]"
              style={{ fontFamily: 'Didot, "Didot MT", "Bodoni MT", "Didot LT STD", serif' }}
            >
              Guests & RSVPs
            </h1>
          </div>
          <div className="flex flex-col items-stretch gap-4 sm:items-end">
            <AddGuestForm weddingId={weddingId} />
            <Link href="/" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] sm:text-right">
              Back to invitation
            </Link>
          </div>
        </div>

        {householdError ? (
          <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{householdError}</div>
        ) : null}
        {householdAdded ? (
          <div className="mb-4 space-y-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">Guest household saved in Supabase.</p>
            <p className="text-emerald-950/90">
              Invitations are not emailed automatically yet. Copy the personal invite link below and send it to your guest (paste into your own email, SMS, etc.). Later you can wire{" "}
              <span className="whitespace-nowrap">Resend</span>, a Supabase Edge Function, or another provider to email this link for you.
            </p>
            {newInviteToken ? (
              <div className="rounded border border-emerald-300/60 bg-white/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]/55">Invite link</p>
                <p className="mt-1 break-all font-mono text-xs text-[#1A1A1A]">
                  {inviteBaseUrl ? `${inviteBaseUrl}/invite/${newInviteToken}` : `/invite/${newInviteToken}`}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="border border-[#1A1A1A]/20 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1A1A1A]/60">Households</p>
            <p className="mt-2 text-2xl font-semibold">{households.length}</p>
          </div>
          <div className="border border-[#1A1A1A]/20 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1A1A1A]/60">Attending</p>
            <p className="mt-2 text-2xl font-semibold">{counts.yes}</p>
          </div>
          <div className="border border-[#1A1A1A]/20 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1A1A1A]/60">Not attending</p>
            <p className="mt-2 text-2xl font-semibold">{counts.no}</p>
          </div>
        </div>

        <div className="border border-[#1A1A1A]/20 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/15 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1A1A]/55">Guest list</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={`/dev/email-preview?weddingId=${encodeURIComponent(weddingId)}`}
                className="inline-flex h-9 shrink-0 items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03]"
              >
                Email preview
              </Link>
              <Link
                href={`/admin/edit/${weddingId}`}
                className="inline-flex h-9 shrink-0 items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03]"
              >
                Edit invitation
              </Link>
            </div>
          </div>
          {households.length === 0 ? (
            <div className="border-t border-dashed border-[#1A1A1A]/20 px-6 py-10 text-center text-[#1A1A1A]/70">
              No guest households yet. Add a guest with the form above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[#1A1A1A]/20 bg-[#F8F4F4]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Household</th>
                    <th className="px-4 py-3 font-semibold">Attending status</th>
                    <th className="px-4 py-3 font-semibold">RSVP note</th>
                  </tr>
                </thead>
                <tbody>
                  {households.map((row) => (
                    <tr key={row.householdId} className="border-b border-[#1A1A1A]/10 align-top">
                      <td className="px-4 py-3 font-medium text-[#1A1A1A]">{row.householdName}</td>
                      <td className="px-4 py-3">{attendingLabel(row.status)}</td>
                      <td className="px-4 py-3 text-[#1A1A1A]/80">{noteCell(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
