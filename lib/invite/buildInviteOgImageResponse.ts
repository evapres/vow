import path from "node:path";

import { formatEnvelopeCardDate } from "@/lib/email/envelopeCardCopy";
import { formatCoupleMonogramDisplay, resolveCoupleMonogramLetters } from "@/lib/coupleInitials";

import { getInviteByToken } from "./loadInviteByToken";
import { loadInviteHeroImageBytes } from "./loadInviteHeroImageBytes";
import { renderInviteOgImage } from "./renderInviteOgImage";

function imageBytesResponse(bytes: Buffer, contentType: string): Response {
  const type = contentType.split(";")[0]?.trim() || "image/jpeg";
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

/** PNG/JPEG for share previews and Web Share — uses the couple image when set. */
export async function buildInviteOgImageResponse(token: string): Promise<Response | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const loaded = await getInviteByToken(trimmed);
  if (!loaded) return null;

  const { wedding } = loaded;

  const hero = await loadInviteHeroImageBytes(wedding);
  if (hero) {
    return imageBytesResponse(hero.bytes, hero.contentType);
  }

  const publicDir = path.join(process.cwd(), "public");

  try {
    const png = await renderInviteOgImage({
      publicDir,
      envelopeCardDateDisplay: formatEnvelopeCardDate(wedding.wedding_date) || "—  —  —",
      envelopeMonogramDisplay: (() => {
        const letters = resolveCoupleMonogramLetters({
          coupleNames: (wedding.couple_names ?? "").trim() || "Couple",
          coupleInitialLeft: wedding.couple_initial_left,
          coupleInitialRight: wedding.couple_initial_right,
          language: wedding.language === "el" ? "el" : "en",
        });
        return letters ? formatCoupleMonogramDisplay(letters) : null;
      })(),
    });
    return imageBytesResponse(png, "image/png");
  } catch (error) {
    console.error("[buildInviteOgImageResponse]", error);
    return null;
  }
}
