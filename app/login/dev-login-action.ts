"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";

/** Local dev only — magic link without email (bypasses Supabase redirect-to-production in mail). */
export async function generateDevLoginLink(
  email: string,
  redirectTo: string,
): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Not available in production." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_KEY?.trim() ??
    "";

  if (!url || !serviceKey) {
    return {
      ok: false,
      error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API).",
    };
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, error: "Enter your email first." };
  }

  const supabase = createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: trimmedEmail,
    options: { redirectTo },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const link = data?.properties?.action_link;
  if (!link) {
    return { ok: false, error: "No link returned from Supabase." };
  }

  return { ok: true, link };
}
