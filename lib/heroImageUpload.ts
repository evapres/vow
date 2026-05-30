import type { SupabaseClient } from "@supabase/supabase-js";

export const WEDDING_HERO_BUCKET = "wedding-heroes";
const MAX_HERO_BYTES = 4 * 1024 * 1024;

/** Upload hero to Supabase Storage and return a public HTTPS URL (not base64). */
export async function persistHeroImageFile(
  db: SupabaseClient,
  weddingId: string,
  file: File,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Couple image must be an image file.");
  }
  if (file.size > MAX_HERO_BYTES) {
    throw new Error("Couple image is too large (max 4MB).");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${weddingId}/hero.${ext}`;

  const { error } = await db.storage.from(WEDDING_HERO_BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(
      `Could not upload couple image. Run the wedding-heroes storage migration in Supabase, then try again. (${error.message})`,
    );
  }

  const { data } = db.storage.from(WEDDING_HERO_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
