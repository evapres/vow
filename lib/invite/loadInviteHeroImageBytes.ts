import "server-only";

import { publicHeroImageUrlForShare } from "./heroImageForShare";

export function heroImageBytesFromDataUrl(raw: string): { bytes: Buffer; contentType: string } | null {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(raw.trim());
  if (!match) return null;
  try {
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length === 0) return null;
    return { bytes, contentType: match[1]?.trim() || "image/jpeg" };
  } catch {
    return null;
  }
}

/** Couple hero bytes for OG / share preview — HTTPS fetch or inline `data:` (no auth). */
export async function loadInviteHeroImageBytes(wedding: {
  hero_image_url: string | null;
}): Promise<{ bytes: Buffer; contentType: string } | null> {
  const raw = wedding.hero_image_url?.trim();
  if (!raw) return null;

  if (raw.startsWith("data:")) {
    return heroImageBytesFromDataUrl(raw);
  }

  const publicUrl = publicHeroImageUrlForShare(raw);
  if (!publicUrl) return null;

  try {
    const res = await fetch(publicUrl, { cache: "no-store", redirect: "follow" });
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0) return null;
    return {
      bytes,
      contentType: res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg",
    };
  } catch {
    return null;
  }
}
