import { NextResponse } from "next/server";

import { loadOwnedWeddingMedia } from "@/lib/adminWeddingMedia";

type RouteContext = { params: Promise<{ weddingId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { weddingId } = await context.params;
  const media = await loadOwnedWeddingMedia(weddingId, "music");

  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  if ("redirect" in media) {
    return NextResponse.redirect(media.redirect);
  }

  return new NextResponse(new Uint8Array(media.bytes), {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
