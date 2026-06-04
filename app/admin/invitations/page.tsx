import Link from "next/link";
import { redirect } from "next/navigation";

import AdminShellHeader from "@/app/components/admin/AdminShellHeader";
import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import { createClient } from "@/lib/supabase/server";

import DeleteInvitationButton from "./DeleteInvitationButton";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ deleted?: string; error?: string; from?: string }>;
};

function safeDecodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function AdminInvitationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const deleted = sp.deleted === "1";
  const deleteError = sp.error ? safeDecodeParam(sp.error) : null;
  const fromAdmin = sp.from === "admin";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: weddings, error } = await supabase
    .from("weddings")
    .select("id, couple_names, wedding_date, language, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase invitations query failed:", error);
    return (
      <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
        <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
          <main className="admin-shell-main">
            <AdminShellHeader />
            <div className="m3-banner m3-banner--error" role="alert">
              Failed to load invitations: {error.message}
            </div>
          </main>
        </div>
      </InvitationFrame>
    );
  }

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
        <main className="admin-shell-main">
          <AdminShellHeader />

          {deleted ? (
            <div className="m3-banner m3-banner--success" role="status">
              Invitation deleted.
            </div>
          ) : null}
          {deleteError ? (
            <div className="m3-banner m3-banner--error" role="alert">
              {deleteError}
            </div>
          ) : null}
          {fromAdmin ? (
            <div className="m3-banner m3-banner--info" role="status">
              You already have an invitation. Use <span className="font-medium">Create new</span> to add another
              wedding, or <span className="font-medium">Edit</span> on a card to change the existing one.
            </div>
          ) : null}

          <header className="m3-page-header">
            <h1 className="m3-page-title">Invitations</h1>
            <Link href="/admin/new" className="m3-btn m3-btn--filled">
              Create new
            </Link>
          </header>

          {weddings && weddings.length ? (
            <div className="m3-invitation-grid">
              {weddings.map((w) => (
                <article key={w.id} className="m3-invitation-card">
                  <p className="m3-invitation-card__lang">{w.language === "el" ? "Greek" : "English"}</p>
                  <h2 className="m3-invitation-card__title">{w.couple_names || "Untitled"}</h2>
                  {w.wedding_date ? (
                    <p className="m3-invitation-card__meta">
                      {new Date(w.wedding_date).toLocaleDateString(w.language === "el" ? "el-GR" : "en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="m3-invitation-card__meta">No date set</p>
                  )}

                  <div className="m3-invitation-card__actions">
                    <Link href={`/admin/edit/${w.id}`} className="m3-btn m3-btn--tonal m3-btn--compact">
                      Edit
                    </Link>
                    <Link href={`/preview/${w.id}`} className="m3-btn m3-btn--outlined m3-btn--compact">
                      Preview
                    </Link>
                    <Link href={`/dashboard/${w.id}`} className="m3-btn m3-btn--outlined m3-btn--compact">
                      Guests
                    </Link>
                  </div>
                  <div className="m3-invitation-card__footer">
                    <DeleteInvitationButton weddingId={w.id} coupleNames={w.couple_names ?? ""} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="m3-form-card">
              <h2 className="m3-title-large">No invitations yet</h2>
              <p className="m3-page-intro">Create your first wedding invitation to get started.</p>
            </div>
          )}
        </main>
      </div>
    </InvitationFrame>
  );
}
