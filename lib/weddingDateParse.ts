/**
 * Stored wedding datetimes from {@link combineWeddingDateAndTime} have no offset (`2026-07-11T20:00:00`).
 * `new Date(...)` treats those as *host-local* wall time, so Vercel (UTC) shows a different clock than
 * a browser in Greece. We pin naive values to this zone for display + email.
 */
export const WEDDING_EVENT_TIME_ZONE =
  (typeof process !== "undefined" && process.env.WEDDING_EVENT_TIME_ZONE?.trim()) || "Europe/Athens";

const NAIVE_WEDDING =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

export type WeddingInstantParse = {
  instant: Date;
  /** When false, show calendar date only (civil midnight / UTC midnight for absolute ISO). */
  showTime: boolean;
};

function civilWallMatchesUtc(
  utcMs: number,
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  timeZone: string,
): boolean {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(new Date(utcMs));
  let gy = 0;
  let gmo = 0;
  let gd = 0;
  let gh = 0;
  let gmi = 0;
  let gs = 0;
  for (const p of parts) {
    if (p.type === "year") gy = +p.value;
    if (p.type === "month") gmo = +p.value;
    if (p.type === "day") gd = +p.value;
    if (p.type === "hour") gh = +p.value;
    if (p.type === "minute") gmi = +p.value;
    if (p.type === "second") gs = +p.value;
  }
  return gy === y && gmo === mo && gd === d && gh === h && gmi === mi && gs === s;
}

/** Map civil Y-M-D H:M:S in `timeZone` to the corresponding UTC instant (naive DB strings). */
function naiveCivilDateTimeToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  timeZone: string,
): Date {
  const windowStart = Date.UTC(y, mo - 1, d) - 40 * 3600 * 1000;
  const windowEnd = Date.UTC(y, mo - 1, d) + 40 * 3600 * 1000;
  const step = s % 60 === 0 && s === Math.floor(s) ? 60_000 : 1000;
  for (let t = windowStart; t <= windowEnd; t += step) {
    if (civilWallMatchesUtc(t, y, mo, d, h, mi, s, timeZone)) {
      return new Date(t);
    }
  }
  return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
}

/**
 * Parse DB `wedding_date` into a UTC instant + whether to show a time line.
 * Naive ISO (no `Z` / offset) is interpreted as civil time in {@link WEDDING_EVENT_TIME_ZONE}.
 */
export function parseWeddingStoredForDisplay(stored: string | null | undefined): WeddingInstantParse | null {
  if (!stored?.trim()) return null;
  const s = stored.trim();

  const m = s.match(NAIVE_WEDDING);
  if (m) {
    const y = +m[1]!;
    const mo = +m[2]!;
    const d = +m[3]!;
    const hasClock = m[4] !== undefined;
    const hh = hasClock ? +m[4]! : 20;
    const mmi = hasClock ? +m[5]! : 0;
    const ss = m[6] !== undefined ? +m[6]! : 0;
    const showTime = hasClock ? hh !== 0 || mmi !== 0 || ss !== 0 : true;
    const instant = naiveCivilDateTimeToUtc(y, mo, d, hh, mmi, ss, WEDDING_EVENT_TIME_ZONE);
    return { instant, showTime };
  }

  const instant = new Date(s);
  if (Number.isNaN(instant.getTime())) return null;
  const showTime =
    instant.getUTCHours() !== 0 ||
    instant.getUTCMinutes() !== 0 ||
    instant.getUTCSeconds() !== 0 ||
    instant.getUTCMilliseconds() !== 0;
  return { instant, showTime };
}
