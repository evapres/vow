import Link from "next/link";
import { redirect } from "next/navigation";

import AdminBurgerMenu from "@/app/components/AdminBurgerMenu";
import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInvitationsPage() {
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
        <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
          <main className="flex-1 py-10">
            <div className="mb-6 flex items-center justify-end">
              <AdminBurgerMenu />
            </div>
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              Failed to load invitations: {error.message}
            </div>
          </main>
        </div>
      </InvitationFrame>
    );
  }

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1 py-10">
          <div className="mb-6 flex items-center justify-end">
            <AdminBurgerMenu />
          </div>

          <div className="mb-8 flex flex-col gap-2 border-b border-[#181818]/20 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/60">Admin</p>
              <h1 className="mt-2 text-3xl font-medium tracking-[0.02em]">Invitations</h1>
              <p className="mt-2 text-sm text-[#181818]/65">Choose an invitation to preview, edit, or open the dashboard.</p>
            </div>
            <Link
              href="/admin?new=1"
              className="inline-flex h-10 items-center justify-center border border-[#181818]/20 bg-white/70 px-4 text-sm font-medium text-[#181818] backdrop-blur-[2px] hover:bg-white/85"
            >
              Create new
            </Link>
          </div>

          {weddings && weddings.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {weddings.map((w) => (
                <div key={w.id} className="border border-[#181818]/20 bg-white/70 p-5 backdrop-blur-[2px]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#181818]/60">
                        {w.language === "el" ? "EL" : "EN"}
                      </p>
                      <p className="mt-2 text-lg font-medium tracking-[0.01em]">{w.couple_names || "Untitled"}</p>
                      {w.wedding_date ? (
                        <p className="mt-1 text-sm text-[#181818]/65">
                          {new Date(w.wedding_date).toLocaleDateString(w.language === "el" ? "el-GR" : "en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-[#181818]/55">No date set</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Link
                      href={`/admin/edit/${w.id}`}
                      className="inline-flex h-10 items-center justify-center border border-[#181818]/20 bg-white/60 text-sm font-medium hover:bg-white/80"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/preview/${w.id}`}
                      className="inline-flex h-10 items-center justify-center border border-[#181818]/20 bg-white/60 text-sm font-medium hover:bg-white/80"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/dashboard/${w.id}`}
                      className="inline-flex h-10 items-center justify-center border border-[#181818]/20 bg-white/60 text-sm font-medium hover:bg-white/80"
                    >
                      Dashboard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#181818]/20 bg-white/70 px-5 py-6 text-sm text-[#181818]/70 backdrop-blur-[2px]">
              <h2 className="text-lg font-medium text-[#181818]">No invitations yet</h2>
              <p className="mt-2">Create your first wedding invitation to get started.</p>
              <Link
                href="/admin"
                className="mt-4 inline-flex h-10 items-center justify-center border border-[#181818]/20 bg-white/70 px-4 text-sm font-medium text-[#181818] backdrop-blur-[2px] hover:bg-white/85"
              >
                Add new invitation
              </Link>
            </div>
          )}
        </main>
      </div>
    </InvitationFrame>
  );
}

