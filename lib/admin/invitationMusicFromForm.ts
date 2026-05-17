const MAX_MUSIC_BYTES = 8 * 1024 * 1024;

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
]);

/**
 * Reads invitation music from admin form.
 * - `clear_music=1` → null (remove)
 * - new file → data URL
 * - otherwise → undefined (no change on update)
 */
export async function invitationMusicUrlFromForm(
  formData: FormData,
): Promise<string | null | undefined> {
  if (formData.get("clear_music") === "1") return null;

  const file = formData.get("invitation_music");
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (file.size > MAX_MUSIC_BYTES) {
    throw new Error("Invitation music is too large (max 8MB).");
  }

  const type = file.type || "audio/mpeg";
  if (!ALLOWED_AUDIO_TYPES.has(type) && !file.name.toLowerCase().endsWith(".mp3")) {
    throw new Error("Invitation music must be an MP3 or other supported audio file.");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  return `data:${type};base64,${buf.toString("base64")}`;
}
