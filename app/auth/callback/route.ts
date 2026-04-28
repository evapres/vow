import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith("/") ? next : "/admin";

      // If the client asked for the edit page but doesn't know the wedding id yet,
      // look it up from the DB for the logged-in user.
      if (safeNext === "/admin/edit" || safeNext === "/admin/edit/") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: latestWedding } = await supabase
            .from("weddings")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestWedding?.id) {
            return NextResponse.redirect(`${origin}/admin/edit/${latestWedding.id}`);
          }
        }

        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
