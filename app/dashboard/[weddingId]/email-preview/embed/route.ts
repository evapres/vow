import { NextRequest, NextResponse } from "next/server";

import { buildInvitationEmailProps } from "@/lib/email/buildInvitationEmailProps";
import { loadInvitationEmailPreviewContext } from "@/lib/email/loadInvitationEmailPreviewContext";
import { renderInvitationEmailHtml } from "@/lib/email/renderInvitationEmail";
import { createClient } from "@/lib/supabase/server";

/** Same HTML as Resend; full document so layout matches real email clients. */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ weddingId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { weddingId } = await context.params;
  if (!weddingId?.trim()) {
    return new NextResponse("Missing wedding", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const householdId = req.nextUrl.searchParams.get("householdId")?.trim();

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401, headers: { "Content-Type": "text/plain" } });
  }

  const ctx = await loadInvitationEmailPreviewContext(supabase, user.id, weddingId.trim(), householdId);
  if (!ctx) {
    return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const siteOrigin = host ? `${proto}://${host}` : "";

  const emailProps = await buildInvitationEmailProps({
    wedding: ctx.wedding,
    household: ctx.household,
    siteOrigin,
  });

  const html = await renderInvitationEmailHtml(emailProps);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
