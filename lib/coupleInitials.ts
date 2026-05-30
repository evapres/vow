import { toAllCapsNoAccents } from "@/lib/invitationDisplay";

export type CoupleMonogramLetters = { left: string; right: string };

export const GREEK_DEFAULT_MONOGRAM: CoupleMonogramLetters = { left: "Β", right: "Λ" };

/** Split on common “two names” separators (e.g. "Nikos & Eva", "Nikos και Eva"). */
export const COUPLE_NAME_SPLIT = /\s*(?:&|\+|\/|\band\b|και)\s*/i;

export function splitCoupleNameParts(coupleNames: string): string[] {
  return coupleNames
    .split(COUPLE_NAME_SPLIT)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function defaultCoupleInitialsForLanguage(language: "en" | "el"): CoupleMonogramLetters {
  return language === "el" ? GREEK_DEFAULT_MONOGRAM : { left: "", right: "" };
}

export function normalizeCoupleInitialLetter(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/\p{L}/u);
  if (!match) return toAllCapsNoAccents(trimmed).slice(0, 1);
  return toAllCapsNoAccents(match[0]);
}

/** Strip Greek article (ο/η) so monogram uses the given name, not the article. */
export function stripGreekArticlePrefix(segment: string): string {
  return segment.trim().replace(/^(ο|η|Ο|Η)\s+/iu, "").trim();
}

export function monogramLettersFromCoupleNames(coupleNames: string): CoupleMonogramLetters | null {
  const parts = splitCoupleNameParts(coupleNames).map(stripGreekArticlePrefix);
  const left = parts[0]?.match(/\p{L}/u)?.[0];
  const right = parts[1]?.match(/\p{L}/u)?.[0];
  if (!left || !right) return null;
  return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
}

/** Initials saved with the wedding row — derived from `couple_names` when possible. */
export function coupleInitialsForStorage(coupleNames: string): {
  couple_initial_left: string | null;
  couple_initial_right: string | null;
} {
  const derived = monogramLettersFromCoupleNames(coupleNames);
  return {
    couple_initial_left: derived?.left ?? null,
    couple_initial_right: derived?.right ?? null,
  };
}

export function formatCoupleMonogramDisplay(letters: CoupleMonogramLetters): string {
  return `${letters.left} & ${letters.right}`;
}

/** Monogram from saved invitation fields only — never language/name defaults (used in emails). */
export function formatSavedCoupleMonogramDisplay(input: {
  coupleInitialLeft?: string | null;
  coupleInitialRight?: string | null;
}): string | undefined {
  const left = normalizeCoupleInitialLetter(input.coupleInitialLeft);
  const right = normalizeCoupleInitialLetter(input.coupleInitialRight);
  if (!left || !right) return undefined;
  return formatCoupleMonogramDisplay({ left, right });
}

/** Initials for the invitation email / share envelope — from names first, then saved fields. */
export function resolveEnvelopeMonogramLetters(input: {
  coupleNames: string;
  coupleInitialLeft?: string | null;
  coupleInitialRight?: string | null;
}): CoupleMonogramLetters | null {
  const fromNames = monogramLettersFromCoupleNames((input.coupleNames ?? "").trim());
  if (fromNames) return fromNames;

  const left = normalizeCoupleInitialLetter(input.coupleInitialLeft);
  const right = normalizeCoupleInitialLetter(input.coupleInitialRight);
  if (left && right) return { left, right };

  return null;
}

/**
 * Envelope monogram line (e.g. `"N & E"`) for invitation email and OG image.
 * Prefers initials derived from `couple_names` (skips Greek articles).
 */
export function resolveEnvelopeMonogramDisplay(input: {
  coupleNames: string;
  coupleInitialLeft?: string | null;
  coupleInitialRight?: string | null;
}): string | undefined {
  const letters = resolveEnvelopeMonogramLetters(input);
  if (letters) return formatCoupleMonogramDisplay(letters);

  return formatSavedCoupleMonogramDisplay({
    coupleInitialLeft: input.coupleInitialLeft,
    coupleInitialRight: input.coupleInitialRight,
  });
}

export function resolveCoupleMonogramLetters(input: {
  coupleNames: string;
  coupleInitialLeft?: string | null;
  coupleInitialRight?: string | null;
  language?: "en" | "el";
}): CoupleMonogramLetters | undefined {
  const derived = monogramLettersFromCoupleNames(input.coupleNames);
  if (derived) return derived;

  const left = normalizeCoupleInitialLetter(input.coupleInitialLeft);
  const right = normalizeCoupleInitialLetter(input.coupleInitialRight);
  if (left && right) return { left, right };

  if (input.language === "el") {
    return GREEK_DEFAULT_MONOGRAM;
  }

  return { left: left || "A", right: right || "B" };
}