import { NextRequest, NextResponse } from "next/server";

import { generateEnvelopeInviteCardPngBuffer } from "@/lib/email/generateEnvelopeInviteCard";

export const runtime = "nodejs";

/**
 * Composited invite envelope PNG for email `<img src="https://…/api/email-invite-card?…">`.
 * Avoids huge `data:` URLs, which many clients show as raw text instead of an image.
 */
export async function GET(req: NextRequest) {
  const couple = req.nextUrl.searchParams.get("couple")?.trim() || "Couple";
  const date = req.nextUrl.searchParams.get("date")?.trim() || undefined;

  const buf = await generateEnvelopeInviteCardPngBuffer({
    coupleNames: couple,
    weddingDateIso: date,
    siteOrigin: req.nextUrl.origin,
  });

  if (!buf?.length) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300, no-transform",
    },
  });
}
