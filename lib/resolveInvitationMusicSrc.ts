/**
 * Invitation page music: wedding upload (admin) → optional env URL → optional `/public/invitation-music.mp3`.
 */
export function resolveInvitationMusicSrc(weddingMusicUrl?: string | null): string | null {
  const fromWedding = weddingMusicUrl?.trim();
  if (fromWedding) return fromWedding;

  const fromEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_INVITATION_MUSIC_URL?.trim() : "";
  if (fromEnv) return fromEnv;

  return "/invitation-music.mp3";
}
