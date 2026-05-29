import { toAllCapsNoAccents } from "@/lib/invitationDisplay";
import { normalizeCoupleInitialLetter } from "@/lib/coupleInitials";

/** Split on common “two names” separators (matches admin copy like "Nikos & Eva" or "Nikos και Eva"). */
const COUPLE_NAME_SPLIT = /\s*(?:&|\+|\/|\band\b|και)\s*/i;

function firstLetterInitial(segment: string): string {
  const trimmed = segment.trim();
  const m = trimmed.match(/\p{L}/u);
  if (!m) return "";
  return toAllCapsNoAccents(m[0]).slice(0, 1);
}

/** Short monogram for the envelope flap, e.g. `"Nikos & Eva"` → `"N&E"`. */
export function coupleEnvelopeInitialsAmpersand(
  coupleNames: string,
  overrides?: { left?: string | null; right?: string | null },
): string {
  const overrideLeft = normalizeCoupleInitialLetter(overrides?.left);
  const overrideRight = normalizeCoupleInitialLetter(overrides?.right);
  if (overrideLeft && overrideRight) return `${overrideLeft}&${overrideRight}`;

  const raw = (coupleNames ?? "").trim();
  if (!raw) return "";
  if (raw.toLowerCase() === "couple") return "A&B";

  const parts = raw.split(COUPLE_NAME_SPLIT).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const a = firstLetterInitial(parts[0]!);
    const b = firstLetterInitial(parts[1]!);
    if (a && b) return `${a}&${b}`;
  }

  const chunk = parts[0] ?? raw;
  const words = chunk.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const a = firstLetterInitial(words[0]!);
    const b = firstLetterInitial(words[words.length - 1]!);
    if (a && b) return `${a}&${b}`;
  }

  if (words.length === 1) {
    return firstLetterInitial(words[0]!) || toAllCapsNoAccents(words[0]).slice(0, 1);
  }

  return "A&B";
}
