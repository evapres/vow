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

export function monogramLettersFromCoupleNames(coupleNames: string): CoupleMonogramLetters | null {
  const parts = splitCoupleNameParts(coupleNames);
  const left = parts[0]?.match(/\p{L}/u)?.[0];
  const right = parts[1]?.match(/\p{L}/u)?.[0];
  if (!left || !right) return null;
  return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
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

export function resolveCoupleMonogramLetters(input: {
  coupleNames: string;
  coupleInitialLeft?: string | null;
  coupleInitialRight?: string | null;
  language?: "en" | "el";
}): CoupleMonogramLetters | undefined {
  const left = normalizeCoupleInitialLetter(input.coupleInitialLeft);
  const right = normalizeCoupleInitialLetter(input.coupleInitialRight);
  if (left && right) return { left, right };

  if (input.language === "el") {
    return {
      left: left || GREEK_DEFAULT_MONOGRAM.left,
      right: right || GREEK_DEFAULT_MONOGRAM.right,
    };
  }

  const derived = monogramLettersFromCoupleNames(input.coupleNames);
  if (derived) return derived;

  return { left: "A", right: "B" };
}