export type InvitationLanguage = "en" | "el";

/** Format wedding date for the invitation header row (e.g. 11 JULY 2026). */
export function formatHeaderDateLabel(
  input: string | null | undefined,
  language?: InvitationLanguage,
): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return toAllCapsNoAccents(String(input));
  const locale = language === "el" ? "el-GR" : "en-GB";
  const formatted = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  // Strip combining marks before uppercase so CSS uppercase never leaves stray accents.
  return toAllCapsNoAccents(formatted);
}

/** Uppercase display helper: remove all Unicode combining marks (accents), then uppercase. */
export function toAllCapsNoAccents(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toUpperCase();
}

export const inviteMetaCaptionClass =
  "text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70";

/**
 * Build a local datetime string from a date-only field (`YYYY-MM-DD`) and optional `HH:MM`.
 * Defaults time to 20:00 when missing.
 */
export function combineWeddingDateAndTime(
  date: string | null | undefined,
  time: string | null | undefined,
): string | null {
  const d = date?.trim();
  if (!d) return null;
  const raw = time?.trim() || "20:00";
  const [h = "20", m = "00"] = raw.split(":");
  const hh = h.padStart(2, "0").slice(0, 2);
  const mm = m.padStart(2, "0").slice(0, 2);
  return `${d}T${hh}:${mm}:00`;
}

/** Parse stored `wedding_date` into values for `<input type="date">` and `<input type="time">`. */
export function splitWeddingDateTimeForForm(
  stored: string | null | undefined,
): { date: string; time: string } {
  if (!stored?.trim()) return { date: "", time: "20:00" };
  const s = stored.trim();
  if (s.includes("T")) {
    const [d, tail] = s.split("T");
    const raw = (tail ?? "20:00:00").slice(0, 5);
    const hm = /^\d{2}:\d{2}$/.test(raw) ? raw : "20:00";
    return { date: d ?? "", time: hm };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { date: s, time: "20:00" };
  return { date: "", time: "20:00" };
}

/** e.g. Saturday, July 11, 2026 at 8:00 PM (omits time when local midnight) */
export function formatDetailsDateTime(
  input: string | null | undefined,
  language?: InvitationLanguage,
): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  const isGreek = language === "el";
  const weekday = new Intl.DateTimeFormat(isGreek ? "el-GR" : "en-US", { weekday: "long" }).format(d);
  const hasTime =
    d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
  const datePart = new Intl.DateTimeFormat(isGreek ? "el-GR" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
  if (!hasTime) return `${weekday}, ${datePart}`;
  let timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  if (isGreek) {
    // Match the reference copy: ΣΑΒΒΑΤΟ, 11 ΙΟΥΛΙΟΥ 2026 ΣΤΙΣ 8:00 Μ.Μ.
    timePart = timePart.replace(/\bPM\b/i, "Μ.Μ.").replace(/\bAM\b/i, "Π.Μ.");
    return `${toAllCapsNoAccents(weekday)}, ${toAllCapsNoAccents(datePart)} ΣΤΙΣ ${timePart}`;
  }
  return `${weekday}, ${datePart} at ${timePart}`;
}
