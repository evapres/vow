import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

/** `YYYY-MM-DD…` → `DD MM YYYY` (spaced). */
export function formatEnvelopeCardDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const [, y, mo, day] = m;
  return `${day} ${mo} ${y}`;
}

/**
 * First letter of each partner name from `couple_names` (e.g. `Alex & Sam` → `A & S`).
 * Splits on `&`, `+`, or the word `and` (ASCII case-insensitive).
 */
export function coupleInitialsLabel(coupleNames: string): string {
  const raw = coupleNames.trim();
  if (!raw) return "";
  const parts = raw
    .split(/\s*(?:&|\+|\band\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  const letters = parts.map((p) => {
    const m = p.match(/[\p{L}\p{N}]/u);
    return m ? m[0].toUpperCase() : "";
  }).filter(Boolean);
  if (letters.length >= 2) return `${letters[0]} & ${letters[1]}`;
  if (letters.length === 1) return letters[0];
  return "";
}

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const TEMPLATE_REL = path.join("public", "email-invite-envelope-template.png");

const NOTO_SANS_WOFF2 = path.join(
  process.cwd(),
  "node_modules/@fontsource/noto-sans/files/noto-sans-latin-300-normal.woff2",
);

/** Email column width — composited asset is scaled to this after overlay. */
const OUT_WIDTH = 520;

/**
 * Pixels at or above this RGB (per channel) become transparent (studio white backdrop).
 * Card/beige and envelope stay below this.
 */
const WHITE_KEY_R = 248;
const WHITE_KEY_G = 248;
const WHITE_KEY_B = 248;

/**
 * Layout tuned for `public/email-invite-envelope-template.png` (burgundy envelope, blank beige card).
 * Coordinates are fractions of template width/height.
 */
const LAYOUT = {
  inviteBaselineY: 0.495,
  dateBaselineY: 0.555,
  initialsBaselineY: 0.755,
} as const;

const INVITE_LINE = "You are invited";

/** CSS `font-family` for card copy in SVG (sans). */
const CARD_FONT_FAMILY = "'Noto Sans', system-ui, -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif";

let notoSans300Woff2Base64: string | null | undefined;

function notoSansFontFaceBlock(): string {
  if (notoSans300Woff2Base64 === undefined) {
    notoSans300Woff2Base64 = fs.existsSync(NOTO_SANS_WOFF2)
      ? fs.readFileSync(NOTO_SANS_WOFF2).toString("base64")
      : null;
  }
  if (!notoSans300Woff2Base64) return "";
  return `<style type="text/css"><![CDATA[
@font-face {
  font-family: "Noto Sans";
  font-style: normal;
  font-weight: 300;
  src: url(data:font/woff2;base64,${notoSans300Woff2Base64}) format("woff2");
}
]]></style>`;
}

/** Turn near-white backdrop pixels transparent; output RGBA PNG. */
async function applyNearWhiteTransparency(pngBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const stride = channels;
  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * stride;
      const r = data[si]!;
      const g = data[si + 1]!;
      const b = data[si + 2]!;
      const oi = (y * width + x) * 4;
      if (r >= WHITE_KEY_R && g >= WHITE_KEY_G && b >= WHITE_KEY_B) {
        out[oi] = 0;
        out[oi + 1] = 0;
        out[oi + 2] = 0;
        out[oi + 3] = 0;
      } else {
        out[oi] = r;
        out[oi + 1] = g;
        out[oi + 2] = b;
        out[oi + 3] = 255;
      }
    }
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

/**
 * Renders the envelope + card template with “You are invited”, dynamic date on the card,
 * and couple initials on the burgundy flap. Near-white background becomes transparent.
 * Returns a PNG data URL for `<Img src="…">`, or `null` if the template is missing or rendering fails.
 */
export async function generateEnvelopeInviteCardDataUrl(input: {
  coupleNames: string;
  weddingDateIso: string | null | undefined;
}): Promise<string | null> {
  const templatePath = path.join(process.cwd(), TEMPLATE_REL);
  if (!fs.existsSync(templatePath)) return null;

  const meta = await sharp(templatePath).metadata();
  const W = meta.width ?? 736;
  const H = meta.height ?? 981;
  const cx = W / 2;

  const dateStr = formatEnvelopeCardDate(input.weddingDateIso);
  const line2 = dateStr || "—  —  —";
  const initials = coupleInitialsLabel(input.coupleNames) || "—";

  const y1 = Math.round(H * LAYOUT.inviteBaselineY);
  const y2 = Math.round(H * LAYOUT.dateBaselineY);
  const yMono = Math.round(H * LAYOUT.initialsBaselineY);

  const fontFace = notoSansFontFaceBlock();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${fontFace}</defs>
  <text x="${cx}" y="${y1}" text-anchor="middle" fill="#3d2328" font-family="${CARD_FONT_FAMILY}"
    font-size="${Math.round(W * 0.03)}" font-weight="300" letter-spacing="0.02em">${escapeXml(INVITE_LINE)}</text>
  <text x="${cx}" y="${y2}" text-anchor="middle" fill="#4a2a32" font-family="${CARD_FONT_FAMILY}"
    font-size="${Math.round(W * 0.033)}" font-weight="300" letter-spacing="0.06em">${escapeXml(line2)}</text>
  <text x="${cx}" y="${yMono}" text-anchor="middle" fill="#f0e6dc"
    font-family="Georgia, Times New Roman, Times, serif" font-size="${Math.round(W * 0.04)}">${escapeXml(initials)}</text>
</svg>`;

  try {
    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();
    const composed = await sharp(templatePath).composite([{ input: overlay, left: 0, top: 0 }]).png({ compressionLevel: 9 }).toBuffer();
    const transparent = await applyNearWhiteTransparency(composed);
    const out = await sharp(transparent).resize({ width: OUT_WIDTH }).png({ compressionLevel: 9 }).toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}
