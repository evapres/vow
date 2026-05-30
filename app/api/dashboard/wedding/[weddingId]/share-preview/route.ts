import path from "node:path";
import { NextResponse } from "next/server";

import { loadOwnedWeddingMedia } from "@/lib/adminWeddingMedia";
import { formatEnvelopeCardDate } from "@/lib/email/envelopeCardCopy";
import { formatCoupleMonogramDisplay, resolveCoupleMonogramLetters } from "@/lib/coupleInitials";
import { loadInviteHeroImageBytes } from "@/lib/invite/loadInviteHeroImageBytes";
import { renderInviteOgImage } from "@/lib/invite/renderInviteOgImage";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ weddingId: string }> };

function imageBytesResponse(bytes: Buffer, contentType: string): NextResponse {
  const type = contentType.split(";")[0]?.trim() || "image/png";
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

/** Authenticated share-preview image for the dashboard (couple photo or envelope composite). */
export async function GET(_request: Request, context: RouteContext) {
  const { weddingId } = await context.params;
  const id = weddingId?.trim();
  if (!id) {
    return new NextResponse("Missing wedding", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select(
      "id, couple_names, wedding_date, language, hero_image_url, couple_initial_left, couple_initial_right",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !wedding) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ownedMedia = await loadOwnedWeddingMedia(id, "hero");
  if (ownedMedia && !("redirect" in ownedMedia)) {
    return imageBytesResponse(ownedMedia.bytes, ownedMedia.contentType);
  }
  if (ownedMedia && "redirect" in ownedMedia) {
    const fromUrl = await loadInviteHeroImageBytes({ hero_image_url: ownedMedia.redirect });
    if (fromUrl) {
      return imageBytesResponse(fromUrl.bytes, fromUrl.contentType);
    }
  }

  const hero = await loadInviteHeroImageBytes(wedding);
  if (hero) {
    return imageBytesResponse(hero.bytes, hero.contentType);
  }

  const publicDir = path.join(process.cwd(), "public");

  try {
    const letters = resolveCoupleMonogramLetters({
      coupleNames: (wedding.couple_names ?? "").trim() || "Couple",
      coupleInitialLeft: wedding.couple_initial_left,
      coupleInitialRight: wedding.couple_initial_right,
      language: wedding.language === "el" ? "el" : "en",
    });

    const png = await renderInviteOgImage({
      publicDir,
      envelopeCardDateDisplay: formatEnvelopeCardDate(wedding.wedding_date) || "—  —  —",
      envelopeMonogramDisplay: letters ? formatCoupleMonogramDisplay(letters) : null,
    });
    return imageBytesResponse(png, "image/png");
  } catch (err) {
    console.error("[share-preview]", err);
    return new NextResponse("Could not render preview", { status: 500 });
  }
}
