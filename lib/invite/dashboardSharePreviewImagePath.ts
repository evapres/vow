/** Authenticated dashboard route — couple image or envelope PNG for link-preview UI. */
export function dashboardSharePreviewImagePath(weddingId: string): string {
  return `/api/dashboard/wedding/${encodeURIComponent(weddingId.trim())}/share-preview`;
}
