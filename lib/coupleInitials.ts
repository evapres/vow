import { toAllCapsNoAccents } from "@/lib/invitationDisplay";

export type CoupleMonogramLetters = { left: string; right: string };

export const GREEK_DEFAULT_MONOGRAM: CoupleMonogramLetters = { left: "Β", right: "Λ" };

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
  const parts = coupleNames.split("&").map((p) => p.trim());
  const left = parts[0]?.match(/\p{L}/u)?.[0];
  const right = parts[1]?.match(/\p{L}/u)?.[0];
  if (!left || !right) return null;
  return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
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