export type HeroImagePosition = "center" | "top" | "bottom";

export const HERO_IMAGE_POSITIONS: HeroImagePosition[] = ["center", "top", "bottom"];

export function parseHeroImagePosition(value: unknown): HeroImagePosition {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "top" || s === "bottom") return s;
  return "center";
}

export function heroImageObjectPositionClass(position: HeroImagePosition): string {
  if (position === "top") return "object-top";
  if (position === "bottom") return "object-bottom";
  return "object-center";
}

export const HERO_IMAGE_POSITION_LABELS: Record<HeroImagePosition, string> = {
  center: "Center",
  top: "Top",
  bottom: "Bottom",
};
