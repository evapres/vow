/**
 * Invitation location: venue (top-right), optional church, street — plus legacy `location` string.
 */

export type WeddingLocationFields = {
  venue_name?: string | null;
  church_name?: string | null;
  street_address?: string | null;
  location?: string | null;
};

/** Persisted `location` column: comma-separated non-empty parts (venue, church, street). */
export function joinWeddingLocationStorage(venue: string, church: string, street: string): string | null {
  const parts = [venue, church, street].map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function firstCommaSegment(loc: string): { first: string; rest: string } {
  const t = loc.trim();
  if (!t) return { first: "", rest: "" };
  const i = t.indexOf(",");
  if (i === -1) return { first: t, rest: "" };
  return { first: t.slice(0, i).trim(), rest: t.slice(i + 1).trim() };
}

/** Top-right venue label on the invitation. */
export function venueLabelFromWedding(w: WeddingLocationFields): string {
  const v = (w.venue_name ?? "").trim();
  if (v) return v;
  const loc = (w.location ?? "").trim();
  if (!loc) return "";
  return firstCommaSegment(loc).first || loc;
}

/** Celebrate block under the date: church, then venue name, then street (skips empty parts). */
export function celebrateLocationLineFromParts(church: string, venue: string, street: string): string {
  return [church, venue, street].map((s) => s.trim()).filter(Boolean).join(", ");
}

/**
 * Celebrate-block location line(s): church, venue name, street when any structured field is set;
 * otherwise full legacy `location`.
 */
export function detailsLocationFromWedding(w: WeddingLocationFields): string {
  const church = (w.church_name ?? "").trim();
  const venue = (w.venue_name ?? "").trim();
  const street = (w.street_address ?? "").trim();
  if (church || venue || street) {
    return celebrateLocationLineFromParts(church, venue, street);
  }
  return (w.location ?? "").trim();
}

/** Populate the three form fields when DB only has legacy `location`. */
export function hydrateLocationFormFields(w: WeddingLocationFields): {
  venueName: string;
  churchName: string;
  streetAddress: string;
} {
  const vn = (w.venue_name ?? "").trim();
  const cn = (w.church_name ?? "").trim();
  const sa = (w.street_address ?? "").trim();
  if (vn || cn || sa) {
    return { venueName: vn, churchName: cn, streetAddress: sa };
  }
  const loc = (w.location ?? "").trim();
  if (!loc) return { venueName: "", churchName: "", streetAddress: "" };
  const { first, rest } = firstCommaSegment(loc);
  return { venueName: first, churchName: "", streetAddress: rest };
}
