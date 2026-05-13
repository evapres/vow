/**
 * Invitation emails use Latin script for venue / address lines so guests
 * (and maps) can read them even when the web invitation is edited in Greek.
 */

const GREEK_SCRIPT = /\p{Script=Greek}/u;

/** Base Greek letter (after NFD + strip marks) → Latin (lower). Digraph letters use two chars. */
const GREEK_BASE_TO_LATIN: Record<string, string> = {
  α: "a",
  β: "v",
  γ: "g",
  δ: "d",
  ε: "e",
  ζ: "z",
  η: "i",
  θ: "th",
  ι: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "x",
  ο: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "y",
  φ: "f",
  χ: "ch",
  ψ: "ps",
  ω: "o",
  // Archaic / extended letters sometimes pasted into addresses
  ϐ: "v",
  ϑ: "th",
  ϕ: "f",
  ϖ: "p",
  ϰ: "k",
  ϱ: "r",
  ϵ: "e",
};

function stripCombiningMarks(input: string): string {
  return input.normalize("NFD").replace(/\p{M}/gu, "");
}

function transliterateGreekToLatinLetters(input: string): string {
  let out = "";
  for (const ch of stripCombiningMarks(input)) {
    const lower = ch.toLowerCase();
    const mapped = GREEK_BASE_TO_LATIN[lower];
    if (mapped !== undefined) {
      const upper = ch !== lower && ch === ch.toUpperCase();
      if (upper && mapped.length === 1) {
        out += mapped.toUpperCase();
      } else if (upper && mapped.length > 1) {
        out += mapped.charAt(0).toUpperCase() + mapped.slice(1);
      } else {
        out += mapped;
      }
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * If the line contains Greek script, return a Latin transliteration; otherwise return it unchanged.
 * Comma-separated parts are trimmed; internal whitespace is normalized to single spaces.
 */
export function locationLineForEmailInLatinScript(line: string): string {
  const trimmed = line.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  if (!GREEK_SCRIPT.test(trimmed)) return trimmed;

  const latin = transliterateGreekToLatinLetters(trimmed);
  return latin.replace(/\s+/g, " ").trim();
}
