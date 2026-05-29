import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ created?: string; error?: string; new?: string; create?: string }>;
};

/** Entry point: list invitations, or start at /admin/new if none exist yet. */
export default async function AdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  if (sp.new === "1" || sp.create === "1" || sp.created || sp.error) {
    const qs = new URLSearchParams();
    if (sp.created) qs.set("created", sp.created);
    if (sp.error) qs.set("error", sp.error);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`/admin/new${suffix}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { count, error: countError } = await supabase
    .from("weddings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!countError && count === 0) {
    redirect("/admin/new");
  }

  redirect("/admin/invitations?from=admin");
}
