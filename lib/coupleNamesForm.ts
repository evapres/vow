import { splitCoupleNameParts, stripGreekArticlePrefix } from "@/lib/coupleInitials";

export type GreekArticle = "ο" | "η";

export type CoupleNamesFormValues =
  | {
      language: "en";
      person1Name: string;
      person2Name: string;
    }
  | {
      language: "el";
      person1Article: GreekArticle;
      person1Name: string;
      person2Article: GreekArticle;
      person2Name: string;
    };

const GREEK_ARTICLE_PREFIX = /^(ο|η|Ο|Η)\s+/u;

export function formatGreekArticleForDisplay(article: GreekArticle): string {
  return article === "η" ? "η" : "Ο";
}

export function parseGreekArticle(segment: string): GreekArticle {
  const m = segment.trim().match(/^(ο|η|Ο|Η)/iu);
  if (m && m[1].toLowerCase() === "η") return "η";
  return "ο";
}

export function parseGreekNameOnly(segment: string): string {
  return segment.trim().replace(GREEK_ARTICLE_PREFIX, "").trim();
}

function formatGreekPerson(article: GreekArticle, name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${formatGreekArticleForDisplay(article)} ${trimmed}`;
}

/** Stored invitation string: `Ο Βασίλης & η Λυδία` or `Nestor & Evangelia`. */
export function buildCoupleNames(values: CoupleNamesFormValues): string {
  if (values.language === "el") {
    const left = formatGreekPerson(values.person1Article, values.person1Name);
    const right = formatGreekPerson(values.person2Article, values.person2Name);
    if (left && right) return `${left} & ${right}`;
    return left || right;
  }
  const left = values.person1Name.trim();
  const right = values.person2Name.trim();
  if (left && right) return `${left} & ${right}`;
  return left || right;
}

export function parseCoupleNames(coupleNames: string, language: "en" | "el"): CoupleNamesFormValues {
  const parts = splitCoupleNameParts(coupleNames);
  if (language === "el") {
    return {
      language: "el",
      person1Article: parseGreekArticle(parts[0] ?? ""),
      person1Name: parseGreekNameOnly(parts[0] ?? ""),
      person2Article: parseGreekArticle(parts[1] ?? ""),
      person2Name: parseGreekNameOnly(parts[1] ?? ""),
    };
  }
  return {
    language: "en",
    person1Name: parts[0] ?? "",
    person2Name: parts[1] ?? "",
  };
}

export function coupleNamesFromFormData(
  formData: FormData,
  language: "en" | "el",
): string {
  const person1Name = String(formData.get("couple_person_1_name") ?? "").trim();
  const person2Name = String(formData.get("couple_person_2_name") ?? "").trim();

  if (language === "el") {
    const person1Article = parseGreekArticle(String(formData.get("couple_person_1_article") ?? "ο"));
    const person2Article = parseGreekArticle(String(formData.get("couple_person_2_article") ?? "ο"));
    return buildCoupleNames({
      language: "el",
      person1Article,
      person1Name,
      person2Article,
      person2Name,
    });
  }

  return buildCoupleNames({ language: "en", person1Name, person2Name });
}

/** Names only (no Greek articles), joined with ` & ` — for email subject and link previews. */
export function formatCoupleNamesWithoutArticles(coupleNames: string): string {
  const parts = splitCoupleNameParts(coupleNames)
    .map(stripGreekArticlePrefix)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} & ${parts[1]}`;
  if (parts.length === 1) return parts[0];
  return coupleNames.trim() || "Couple";
}

/** e.g. `You are invited - Nestor & Evangelia` */
export function buildYouAreInvitedTitle(coupleNames: string): string {
  return `You are invited - ${formatCoupleNamesWithoutArticles(coupleNames)}`;
}

export function validateCoupleNamesForm(values: CoupleNamesFormValues): string | null {
  if (values.language === "el") {
    if (!values.person1Name.trim() || !values.person2Name.trim()) {
      return "Both partner names are required.";
    }
    return null;
  }
  if (!values.person1Name.trim() || !values.person2Name.trim()) {
    return "Both partner names are required.";
  }
  return null;
}
