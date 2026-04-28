import Link from "next/link";
import { redirect } from "next/navigation";

import InvitationFrame from "@/app/components/InvitationFrame";
import { createClient } from "@/lib/supabase/server";

import AdminNewWeddingForm from "./AdminNewWeddingForm";

type PageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

function safeDecodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { created, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <InvitationFrame includeInviteGutter={false}>
        <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
          <main className="flex-1 py-10">
            <p>
              Please log in.{" "}
              <Link href="/login" className="underline underline-offset-4">
                Go to login
              </Link>
            </p>
          </main>
        </div>
      </InvitationFrame>
    );
  }

  // If this user already has a wedding, land them on the edit screen after login.
  // Keeps magic-link login behavior consistent across environments.
  if (!created) {
    const { data: latestWedding } = await supabase
      .from("weddings")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestWedding?.id) {
      redirect(`/admin/edit/${latestWedding.id}`);
    }
  }

  return (
    <InvitationFrame includeInviteGutter={false}>
      <div className="flex min-h-full flex-col bg-transparent font-sans text-[#181818]">
        <main className="flex-1 py-10">
          <div className="mb-8 border-b border-[#181818]/20 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/60">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-[0.02em]">New wedding</h1>
            <p className="mt-2 text-sm text-[#181818]/65">
              Details are saved to Supabase and appear on invitation pages that use this wedding.
            </p>
          </div>

          {created ? (
            <div className="mb-6 border border-[#181818]/20 bg-transparent px-4 py-3 text-sm">
              <p className="font-medium text-[#181818]">Wedding created.</p>
              <p className="mt-1 text-[#181818]/75">
                <span className="font-medium text-[#181818]/90">ID:</span>{" "}
                <code className="text-xs">{created}</code>
              </p>
              <p className="mt-3">
                <Link
                  href={`/dashboard/${created}`}
                  className="text-sm font-medium text-[#181818] underline underline-offset-4 hover:text-[#181818]/80"
                >
                  Open RSVP dashboard
                </Link>
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {safeDecodeParam(error)}
            </div>
          ) : null}

          <AdminNewWeddingForm />
        </main>
      </div>
    </InvitationFrame>
  );
}
