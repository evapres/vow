import Link from "next/link";

import AddGuestForm from "./AddGuestForm";
import SendInvitationDialog from "./SendInvitationDialog";
import {
  deleteHousehold,
  sendAllHouseholdInvitationEmails,
  updateHousehold,
  updateHouseholdRsvp,
} from "./actions";
import RsvpRealtimeRefresh from "./RsvpRealtimeRefresh";
import { attendingGuestCount, type DashboardHouseholdRow } from "../../lib/rsvps/dashboard";
import DashboardGuestStatCards from "./DashboardGuestStatCards";
import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import AdminShellHeader from "@/app/components/admin/AdminShellHeader";
import InvitationWorkflowTabs from "@/app/components/admin/InvitationWorkflowTabs";
import M3FilledSelect from "@/app/components/m3/M3FilledSelect";
import M3FilledTextField from "@/app/components/m3/M3FilledTextField";

type RsvpsDashboardViewProps = {
  households: DashboardHouseholdRow[];
  weddingId: string;
  householdAdded?: boolean;
  householdUpdated?: boolean;
  rsvpUpdated?: boolean;
  householdDeleted?: boolean;
  invitationEmailSent?: boolean;
  /** Number of invitations sent in the last bulk send (from `bulk_invites_sent` query param). */
  bulkInvitesSent?: number;
  householdError?: string | null;
  /** Current site origin for copy/open (e.g. http://localhost:3000 when developing). */
  inviteBaseUrl?: string;
  /** Public HTTPS origin for Messenger / Instagram (e.g. https://thevow.vip). */
  shareInviteBaseUrl?: string;
  shareHeroImageUrl?: string | null;
  coupleNames?: string | null;
};

function attendingLabel(row: DashboardHouseholdRow): string {
  if (row.status === "attending") {
    const n = attendingGuestCount(row);
    return n === 1 ? "Attending (1 guest)" : `Attending (${n} guests)`;
  }
  if (row.status === "not_attending") return "Not attending";
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
  rsvpUpdated,
  householdDeleted,
  invitationEmailSent,
  bulkInvitesSent,
  householdError,
  inviteBaseUrl,
  shareInviteBaseUrl,
  shareHeroImageUrl,
  coupleNames,
}: RsvpsDashboardViewProps) {
  const pendingInviteCount = households.filter(
    (h) => Boolean(h.email?.trim() && h.inviteToken?.trim() && !h.emailSentAt),
  ).length;

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
        <main className="admin-shell-main">
          <RsvpRealtimeRefresh weddingId={weddingId} />
          <AdminShellHeader />

          <div className="mb-8">
            <h1 className="m3-page-title">Guests & RSVPs</h1>
            <div className="mt-5">
              <InvitationWorkflowTabs weddingId={weddingId} activeStep={2} dashboardEnabled />
            </div>
          </div>

          {householdError && !(bulkInvitesSent != null && bulkInvitesSent > 0) ? (
            <div className="m3-banner m3-banner--error" role="alert">
              {householdError}
            </div>
          ) : null}
          {householdUpdated ? (
            <div className="m3-banner m3-banner--success" role="status">
              Guest household updated.
            </div>
          ) : null}
          {rsvpUpdated ? (
            <div className="m3-banner m3-banner--success" role="status">
              RSVP status saved.
            </div>
          ) : null}
          {householdDeleted ? (
            <div className="m3-banner m3-banner--success" role="status">
              Guest household removed.
            </div>
          ) : null}
          {invitationEmailSent ? (
            <div className="m3-banner m3-banner--success" role="status">
              Invitation email sent.
            </div>
          ) : null}
          {bulkInvitesSent != null && bulkInvitesSent > 0 ? (
            <div className="m3-banner m3-banner--success" role="status">
              <p className="m3-banner__title">
                Sent {bulkInvitesSent} invitation{bulkInvitesSent === 1 ? "" : "s"}.
              </p>
              {householdError ? (
                <p className="m3-banner__detail">Some messages could not be sent: {householdError}</p>
              ) : null}
            </div>
          ) : null}
          {householdAdded ? (
            <div className="m3-banner m3-banner--success" role="status">
              <p className="m3-banner__title">Guest added.</p>
              <p className="m3-banner__detail">
                Use Send invitation on their row to email or copy the invite link.
              </p>
            </div>
          ) : null}

          <DashboardGuestStatCards households={households} />

          <div className="m3-form-card m3-data-card">
            <div className="m3-data-card__toolbar">
              <p className="m3-data-card__title">Guest list</p>
              <div className="m3-data-card__actions">
                <Link
                  href={`/dashboard/${encodeURIComponent(weddingId)}/email-preview`}
                  className="m3-btn m3-btn--outlined m3-btn--compact"
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
                    className="m3-btn m3-btn--tonal m3-btn--compact"
                  >
                    Send all email invitations
                  </button>
                </form>
                <AddGuestForm weddingId={weddingId} />
              </div>
            </div>

            {households.length === 0 ? (
              <p className="m3-empty-state">No guest households yet. Add a guest with the button above.</p>
            ) : (
              <div className="m3-table-wrap">
                <table className="m3-table">
                  <thead>
                    <tr>
                      <th scope="col">Household</th>
                      <th scope="col">Attending status</th>
                      <th scope="col">RSVP note</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {households.map((row) => (
                      <tr key={row.householdId}>
                        <td>
                          <div className="space-y-1">
                            <p className="font-medium">{row.householdName}</p>
                            {row.email ? <p className="m3-table__muted">{row.email}</p> : null}
                            {row.invitedCount ? (
                              <p className="m3-table__muted">Invited: {row.invitedCount}</p>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          {attendingLabel(row)}
                          <details className="m3-panel mt-2">
                            <summary className="m3-panel__summary">Edit RSVP</summary>
                            <div className="m3-panel__body">
                              <form action={updateHouseholdRsvp} className="space-y-3">
                                <input type="hidden" name="wedding_id" value={weddingId} />
                                <input type="hidden" name="household_id" value={row.householdId} />
                                <M3FilledSelect
                                  name="status"
                                  label="RSVP status"
                                  defaultValue={row.status}
                                  required
                                >
                                  <option value="pending">No response yet</option>
                                  <option value="attending">Attending</option>
                                  <option value="not_attending">Not attending</option>
                                </M3FilledSelect>
                                <M3FilledTextField
                                  name="attending_count"
                                  type="number"
                                  min={1}
                                  inputMode="numeric"
                                  label="Guests attending"
                                  defaultValue={row.attendingCount ?? row.invitedCount ?? 1}
                                  supportingText="Used when status is Attending."
                                />
                                <M3FilledTextField
                                  name="rsvp_note"
                                  label="RSVP note"
                                  defaultValue={row.rsvpNote ?? ""}
                                  placeholder="Optional"
                                />
                                <button type="submit" className="m3-btn m3-btn--filled m3-btn--compact">
                                  Save RSVP
                                </button>
                              </form>
                            </div>
                          </details>
                        </td>
                        <td className="m3-table__muted">{noteCell(row)}</td>
                        <td>
                          <div className="flex flex-col gap-2">
                            <details className="m3-panel">
                              <summary className="m3-panel__summary">Edit household</summary>
                              <div className="m3-panel__body">
                                <form action={updateHousehold} className="space-y-3">
                                  <input type="hidden" name="wedding_id" value={weddingId} />
                                  <input type="hidden" name="household_id" value={row.householdId} />
                                  <M3FilledTextField
                                    name="household_name"
                                    label="Household name"
                                    required
                                    defaultValue={row.householdName}
                                  />
                                  <M3FilledTextField
                                    name="email"
                                    type="email"
                                    label="Guest email"
                                    defaultValue={row.email ?? ""}
                                    placeholder="guest@example.com"
                                    supportingText="Optional. Leave blank if you share the invite link on social media."
                                  />
                                  <M3FilledTextField
                                    name="invited_count"
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    label="Invited guests"
                                    defaultValue={row.invitedCount ?? 1}
                                  />
                                  <button type="submit" className="m3-btn m3-btn--filled m3-btn--compact">
                                    Save
                                  </button>
                                </form>
                              </div>
                            </details>

                            {row.emailSentAt ? (
                              <span
                                className="m3-chip m3-chip--success w-fit"
                                title={`Sent ${new Date(row.emailSentAt).toLocaleString()}`}
                              >
                                Invitation sent
                              </span>
                            ) : null}
                            {row.inviteToken?.trim() ? (
                              <SendInvitationDialog
                                weddingId={weddingId}
                                householdId={row.householdId}
                                inviteToken={row.inviteToken}
                                email={row.email}
                                emailSentAt={row.emailSentAt}
                                coupleNames={coupleNames ?? ""}
                                inviteBaseUrl={inviteBaseUrl}
                                shareInviteBaseUrl={shareInviteBaseUrl}
                                shareHeroImageUrl={shareHeroImageUrl}
                              />
                            ) : null}

                            <form action={deleteHousehold}>
                              <input type="hidden" name="wedding_id" value={weddingId} />
                              <input type="hidden" name="household_id" value={row.householdId} />
                              <button
                                type="submit"
                                className="m3-btn m3-btn--danger m3-btn--compact m3-btn--block"
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
