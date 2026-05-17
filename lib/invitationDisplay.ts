import { parseWeddingStoredForDisplay, WEDDING_EVENT_TIME_ZONE } from "./weddingDateParse";

export type InvitationLanguage = "en" | "el";

const weddingDisplayZone = { timeZone: WEDDING_EVENT_TIME_ZONE } as const;

/** Format wedding date for the invitation header row (e.g. 11 JULY 2026). */
export function formatHeaderDateLabel(
  input: string | null | undefined,
  language?: InvitationLanguage,
): string {
  if (!input) return "";
  const parsed = parseWeddingStoredForDisplay(input);
  if (!parsed) return toAllCapsNoAccents(String(input));
  const locale = language === "el" ? "el-GR" : "en-GB";
  const formatted = new Intl.DateTimeFormat(locale, {
    ...weddingDisplayZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed.instant);
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

/**
 * RSVP deadline for invite UI and emails (date only, no weekday or time).
 * English: "June 15 2026"; Greek: "15 Ιουνίου 2026".
 */
const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatRsvpDeadlineLabel(
  iso: string | null | undefined,
  language: InvitationLanguage = "en",
): string {
  if (!iso?.trim()) return "";
  const raw = iso.trim();
  const isoMatch = raw.match(ISO_DATE_PREFIX);
  if (!isoMatch) return raw;

  const dateOnly = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const parsed =
    parseWeddingStoredForDisplay(`${dateOnly}T12:00:00`) ??
    (() => {
      const fallback = new Date(`${dateOnly}T12:00:00Z`);
      return Number.isNaN(fallback.getTime()) ? null : { instant: fallback, showTime: false };
    })();
  if (!parsed) return raw;

  const locale = language === "el" ? "el-GR" : "en-US";
  const parts = new Intl.DateTimeFormat(locale, {
    ...weddingDisplayZone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).formatToParts(parsed.instant);
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  if (language === "el") return `${day} ${month} ${year}`.trim();
  return `${month} ${day} ${year}`.trim();
}

/** English email line: "Please RSVP before June 15 2026". */
export function formatRsvpBeforeEmailLine(iso: string | null | undefined): string {
  const label = formatRsvpDeadlineLabel(iso, "en");
  if (!label) return "Please RSVP using the link in this email.";
  return `Please RSVP before ${label}`;
}

/** Small caps line: wrap copy with {@link toAllCapsNoAccents} (not CSS `uppercase`). */
export const inviteMetaCaptionClass =
  "text-[9px] font-semibold tracking-[0.16em] text-white/70 sm:text-[10px] sm:tracking-[0.22em]";

/**
 * Noto Serif (text face), light — 15px on mobile, 18px from `sm` up.
 * Reception note, Greek invite line, RSVP deadline, “how many guests” (el), etc.
 */
export const inviteNotoSerifLight18Class =
  "text-[15px] font-light leading-[24px] tracking-[0.5px] [font-family:var(--font-noto-serif)] sm:text-[18px] sm:leading-[32px] sm:tracking-[1px]";

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

/** e.g. Saturday, July 11, 2026 at 8:00 PM (omits time when stored civil / UTC clock is midnight) */
export function formatDetailsDateTime(
  input: string | null | undefined,
  language?: InvitationLanguage,
): string {
  if (!input) return "";
  const parsed = parseWeddingStoredForDisplay(input);
  if (!parsed) return String(input);
  const { instant: d, showTime: hasTime } = parsed;
  const isGreek = language === "el";
  const weekday = new Intl.DateTimeFormat(isGreek ? "el-GR" : "en-US", {
    ...weddingDisplayZone,
    weekday: "long",
  }).format(d);
  const datePart = new Intl.DateTimeFormat(isGreek ? "el-GR" : "en-US", {
    ...weddingDisplayZone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
  if (!hasTime) return `${weekday}, ${datePart}`;
  let timePart = new Intl.DateTimeFormat("en-US", {
    ...weddingDisplayZone,
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

/**
 * Split {@link formatDetailsDateTime} output into date + time lines (email body).
 * English uses " at …"; Greek uses " ΣΤΙΣ …".
 */
export function splitDetailsDateTimeLines(combined: string): { dateLine: string; timeLine: string } {
  const t = combined.trim();
  const english = t.match(/^(.+?)\s+at\s+(.+)$/i);
  if (english) {
    return { dateLine: english[1]!.trim(), timeLine: english[2]!.trim() };
  }
  const greek = t.match(/^(.+?)\s+ΣΤΙΣ\s+(.+)$/);
  if (greek) {
    return { dateLine: greek[1]!.trim(), timeLine: greek[2]!.trim() };
  }
  return { dateLine: t, timeLine: "" };
}
