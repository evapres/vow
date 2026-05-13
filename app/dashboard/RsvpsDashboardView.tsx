import Link from "next/link";

import AddGuestForm from "./AddGuestForm";
import { deleteHousehold, sendAllHouseholdInvitationEmails, sendHouseholdInvitationEmail, updateHousehold } from "./actions";
import RsvpRealtimeRefresh from "./RsvpRealtimeRefresh";
import type { DashboardHouseholdRow, HouseholdRsvpStatus } from "../../lib/rsvps/dashboard";
import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import AdminBurgerMenu from "@/app/components/AdminBurgerMenu";

type RsvpsDashboardViewProps = {
  households: DashboardHouseholdRow[];
  weddingId: string;
  householdAdded?: boolean;
  householdUpdated?: boolean;
  householdDeleted?: boolean;
  invitationEmailSent?: boolean;
  /** Number of invitations sent in the last bulk send (from `bulk_invites_sent` query param). */
  bulkInvitesSent?: number;
  householdError?: string | null;
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
  householdUpdated,
  householdDeleted,
  invitationEmailSent,
  bulkInvitesSent,
  householdError,
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

  const pendingInviteCount = households.filter(
    (h) => Boolean(h.email?.trim() && h.inviteToken?.trim() && !h.emailSentAt),
  ).length;

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1 py-10">
        <RsvpRealtimeRefresh weddingId={weddingId} />
        <div className="mb-6 flex items-center justify-end">
          <AdminBurgerMenu weddingId={weddingId} />
        </div>
        <div className="mb-8 flex flex-col gap-6 border-b border-[#1A1A1A]/20 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1A1A1A]/60">Dashboard</p>
            <h1 className="mt-2 text-3xl font-medium tracking-[0.02em]">Guests & RSVPs</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={`/admin/edit/${weddingId}`}
                className="inline-flex h-7 items-center rounded-full border border-[#1A1A1A]/25 bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/80 backdrop-blur-[2px] hover:text-[#1A1A1A]"
              >
                ← Step 1: Invitation
              </Link>
              <span className="inline-flex h-7 items-center rounded-full border border-[#1A1A1A]/25 bg-[#1A1A1A]/[0.02] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]">
                Step 2: Dashboard
              </span>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-4 sm:items-end" />
        </div>

        {householdError && !(bulkInvitesSent != null && bulkInvitesSent > 0) ? (
          <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{householdError}</div>
        ) : null}
        {householdUpdated ? (
          <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Guest household updated.
          </div>
        ) : null}
        {householdDeleted ? (
          <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Guest household removed.
          </div>
        ) : null}
        {invitationEmailSent ? (
          <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Invitation email sent.
          </div>
        ) : null}
        {bulkInvitesSent != null && bulkInvitesSent > 0 ? (
          <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">
              Sent {bulkInvitesSent} invitation{bulkInvitesSent === 1 ? "" : "s"}.
            </p>
            {householdError ? (
              <p className="mt-2 text-emerald-950/90">Some messages could not be sent: {householdError}</p>
            ) : null}
          </div>
        ) : null}
        {householdAdded ? (
          <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">Guest added.</p>
            <p className="mt-1 text-emerald-950/90">
              Use <span className="font-medium">Send all invitations</span> above when emails are ready.
            </p>
          </div>
        ) : null}

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="border border-[#181818]/20 bg-white/70 p-4 backdrop-blur-[2px]">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1A1A1A]/60">Households</p>
            <p className="mt-2 text-2xl font-semibold">{households.length}</p>
          </div>
          <div className="border border-[#181818]/20 bg-white/70 p-4 backdrop-blur-[2px]">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1A1A1A]/60">Attending</p>
            <p className="mt-2 text-2xl font-semibold">{counts.yes}</p>
          </div>
          <div className="border border-[#181818]/20 bg-white/70 p-4 backdrop-blur-[2px]">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1A1A1A]/60">Not attending</p>
            <p className="mt-2 text-2xl font-semibold">{counts.no}</p>
          </div>
        </div>

        <div className="border border-[#181818]/20 bg-white/70 backdrop-blur-[2px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/15 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1A1A]/55">Guest list</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={`/dev/email-preview?weddingId=${encodeURIComponent(weddingId)}`}
                className="inline-flex h-9 shrink-0 items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03]"
              >
                Email preview
              </Link>
              <form action={sendAllHouseholdInvitationEmails} className="inline-flex">
                <input type="hidden" name="wedding_id" value={weddingId} />
                <button
                  type="submit"
                  disabled={pendingInviteCount === 0}
                  title={
                    pendingInviteCount === 0
                      ? "No guests with an email are waiting for their first invitation."
                      : `Send to ${pendingInviteCount} guest household${pendingInviteCount === 1 ? "" : "s"} not yet emailed.`
                  }
                  className="inline-flex h-9 shrink-0 items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send all invitations
                </button>
              </form>
              <AddGuestForm weddingId={weddingId} />
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
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {households.map((row) => (
                    <tr key={row.householdId} className="border-b border-[#1A1A1A]/10 align-top">
                      <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                        <div className="space-y-1">
                          <p>{row.householdName}</p>
                          {row.email ? <p className="text-xs font-normal text-[#1A1A1A]/60">{row.email}</p> : null}
                          {row.invitedCount ? (
                            <p className="text-xs font-normal text-[#1A1A1A]/55">Invited: {row.invitedCount}</p>
                          ) : null}
                          {row.inviteToken ? (
                            <p className="break-all font-mono text-[11px] font-normal text-[#1A1A1A]/55">
                              {inviteBaseUrl ? `${inviteBaseUrl}/invite/${row.inviteToken}` : `/invite/${row.inviteToken}`}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">{attendingLabel(row.status)}</td>
                      <td className="px-4 py-3 text-[#1A1A1A]/80">{noteCell(row)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <details className="border border-[#1A1A1A]/15 bg-white/50 px-3 py-2">
                            <summary className="cursor-pointer text-sm font-medium">Edit</summary>
                            <div className="mt-3">
                              <form action={updateHousehold} className="space-y-3">
                                <input type="hidden" name="wedding_id" value={weddingId} />
                                <input type="hidden" name="household_id" value={row.householdId} />
                                <div>
                                  <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70">
                                    Household name
                                  </label>
                                  <input
                                    name="household_name"
                                    type="text"
                                    required
                                    defaultValue={row.householdName}
                                    className="mt-2 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70">
                                    Guest email
                                  </label>
                                  <input
                                    name="email"
                                    type="email"
                                    defaultValue={row.email ?? ""}
                                    placeholder="guest@example.com"
                                    className="mt-2 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70">
                                    Invited guests
                                  </label>
                                  <input
                                    name="invited_count"
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    defaultValue={row.invitedCount ?? 1}
                                    className="mt-2 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="inline-flex h-9 items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03]"
                                >
                                  Save
                                </button>
                              </form>
                            </div>
                          </details>

                          {row.emailSentAt ? (
                            <span
                              className="inline-flex w-fit rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-900"
                              title={`Sent ${new Date(row.emailSentAt).toLocaleString()}`}
                            >
                              Invitation sent
                            </span>
                          ) : null}
                          {row.email?.trim() && row.inviteToken?.trim() ? (
                            <form action={sendHouseholdInvitationEmail}>
                              <input type="hidden" name="wedding_id" value={weddingId} />
                              <input type="hidden" name="household_id" value={row.householdId} />
                              <button
                                type="submit"
                                title={
                                  row.emailSentAt
                                    ? "Sends the invitation email to this guest again."
                                    : "Sends the invitation email to this guest."
                                }
                                className="inline-flex h-9 w-full items-center justify-center border border-[#1A1A1A]/30 bg-transparent px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]/50 hover:bg-[#1A1A1A]/[0.03]"
                              >
                                {row.emailSentAt ? "Send reminder" : "Send invitation"}
                              </button>
                            </form>
                          ) : null}
                          {!row.email?.trim() ? (
                            <span className="text-[11px] text-[#1A1A1A]/55">Add an email to include in a bulk send.</span>
                          ) : null}

                          <form action={deleteHousehold}>
                            <input type="hidden" name="wedding_id" value={weddingId} />
                            <input type="hidden" name="household_id" value={row.householdId} />
                            <button
                              type="submit"
                              className="inline-flex h-9 w-full items-center justify-center border border-red-300 bg-red-50 px-4 text-sm font-medium text-red-900 hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </main>
      </div>
    </InvitationFrame>
  );
}
