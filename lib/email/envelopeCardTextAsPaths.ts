import fs from "node:fs";
import path from "node:path";

import opentype from "opentype.js";

/** Roboto reads like the email Helvetica/Arial sans stack; paths avoid server font/Gmail issues. */
const FONT_FILENAMES = ["Roboto-Regular.ttf", "NotoSans-Regular.ttf"] as const;

let cachedFont: opentype.Font | null | undefined;

function loadFont(): opentype.Font | null {
  if (cachedFont !== undefined) return cachedFont;
  const dir = path.join(process.cwd(), "lib/email/fonts");
  try {
    for (const name of FONT_FILENAMES) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) {
        cachedFont = opentype.parse(fs.readFileSync(p));
        return cachedFont;
      }
    }
    cachedFont = null;
    return null;
  } catch {
    cachedFont = null;
    return null;
  }
}

/** SVG `d` for one line, horizontally centered on `centerX`, sitting on `baselineY`. */
export function envelopeCardCenteredPathD(
  text: string,
  centerX: number,
  baselineY: number,
  fontSizePx: number,
): string | null {
  const font = loadFont();
  if (!font) return null;
  const w = font.getAdvanceWidth(text, fontSizePx);
  const left = centerX - w / 2;
  const p = font.getPath(text, left, baselineY, fontSizePx);
  const d = p.toPathData(2);
  return d.trim() ? d : null;
}
