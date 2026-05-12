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

const TEMPLATE_FILENAME = "email-invite-envelope-template.png";
const TEMPLATE_DISK_PATH = path.join(process.cwd(), "public", TEMPLATE_FILENAME);

/**
 * Template bytes for Sharp. On Vercel/serverless, `public/` is often not on the function disk — then we fetch from the deployed site.
 */
async function loadEnvelopeTemplateBuffer(siteOrigin?: string): Promise<Buffer | null> {
  try {
    if (fs.existsSync(TEMPLATE_DISK_PATH)) {
      return fs.readFileSync(TEMPLATE_DISK_PATH);
    }
  } catch {
    // ignore
  }

  const origin = siteOrigin?.trim().replace(/\/$/, "");
  if (!origin || !origin.startsWith("http")) return null;
  const url = `${origin}/${TEMPLATE_FILENAME}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

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

/**
 * Fonts bundled with Sharp’s SVG renderer (librsvg on Linux). Do not use @font-face / WOFF2 here —
 * embedded fonts often fail and render as “tofu” boxes in the PNG emailed to clients.
 */
const SVG_SANS_LIGHT =
  "DejaVu Sans, Liberation Sans, Bitstream Vera Sans, Helvetica, Arial, sans-serif";

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

export type GenerateEnvelopeInviteCardInput = {
  coupleNames: string;
  weddingDateIso: string | null | undefined;
  /** Used to fetch `/email-invite-envelope-template.png` when the file is not on serverless disk. */
  siteOrigin?: string;
};

/**
 * Renders the envelope + card PNG (transparent backdrop, dynamic text).
 * Used by `/api/email-invite-card` so emails can use a normal `https://` img src.
 */
export async function generateEnvelopeInviteCardPngBuffer(
  input: GenerateEnvelopeInviteCardInput,
): Promise<Buffer | null> {
  const templateBuffer = await loadEnvelopeTemplateBuffer(input.siteOrigin);
  if (!templateBuffer?.length) return null;

  const meta = await sharp(templateBuffer).metadata();
  const W = meta.width ?? 736;
  const H = meta.height ?? 981;
  const cx = W / 2;

  const dateStr = formatEnvelopeCardDate(input.weddingDateIso);
  const line2 = dateStr || "—  —  —";
  const initials = coupleInitialsLabel(input.coupleNames) || "—";

  const y1 = Math.round(H * LAYOUT.inviteBaselineY);
  const y2 = Math.round(H * LAYOUT.dateBaselineY);
  const yMono = Math.round(H * LAYOUT.initialsBaselineY);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <text x="${cx}" y="${y1}" text-anchor="middle" fill="#3d2328" font-family="${SVG_SANS_LIGHT}"
    font-size="${Math.round(W * 0.03)}" font-weight="300" letter-spacing="0.02em">${escapeXml(INVITE_LINE)}</text>
  <text x="${cx}" y="${y2}" text-anchor="middle" fill="#4a2a32" font-family="${SVG_SANS_LIGHT}"
    font-size="${Math.round(W * 0.033)}" font-weight="300" letter-spacing="0.06em">${escapeXml(line2)}</text>
  <text x="${cx}" y="${yMono}" text-anchor="middle" fill="#f0e6dc" font-family="${SVG_SANS_LIGHT}"
    font-size="${Math.round(W * 0.04)}" font-weight="300">${escapeXml(initials)}</text>
</svg>`;

  try {
    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();
    const composed = await sharp(templateBuffer).composite([{ input: overlay, left: 0, top: 0 }]).png({ compressionLevel: 9 }).toBuffer();
    const transparent = await applyNearWhiteTransparency(composed);
    return await sharp(transparent).resize({ width: OUT_WIDTH }).png({ compressionLevel: 9 }).toBuffer();
  } catch {
    return null;
  }
}
