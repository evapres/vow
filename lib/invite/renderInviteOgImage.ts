import path from "node:path";

import sharp from "sharp";

import { ENVELOPE_INVITE_LINE, ENVELOPE_TEMPLATE_FILENAME } from "@/lib/email/envelopeCardCopy";
import { EMAIL_FABRIC_BACKGROUND_FILENAME } from "@/lib/email/emailPublicAssets";

/** Standard Open Graph dimensions. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/** Matches {@link InvitationEmail} shell + envelope layout. */
const SHELL_WIDTH = 520;
const SHELL_RADIUS = 12;
const SHELL_PADDING_Y = 40;
const ENVELOPE_WIDTH = 480;
const ENVELOPE_PADDING_TOP = 180;
const MONOGRAM_OFFSET_TOP = 100;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function readPublicImage(publicDir: string, filenames: string[]): Promise<Buffer | null> {
  for (const name of filenames) {
    try {
      return await sharp(path.join(publicDir, name)).toBuffer();
    } catch {
      continue;
    }
  }
  return null;
}

function buildEnvelopeTextSvg(args: {
  width: number;
  height: number;
  envelopeX: number;
  envelopeY: number;
  envelopeW: number;
  dateLine: string;
  monogram: string | null;
}): string {
  const scale = args.envelopeW / 520;
  const centerX = args.envelopeX + args.envelopeW / 2;
  const inviteY = args.envelopeY + ENVELOPE_PADDING_TOP * scale;
  const dateY = inviteY + 22 * scale;
  const monogramY = dateY + MONOGRAM_OFFSET_TOP * scale;
  const date = escapeXml(args.dateLine || "—  —  —");
  const monogram = args.monogram ? escapeXml(args.monogram) : "";

  const monogramBlock = monogram
    ? `<text x="${centerX}" y="${monogramY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${16 * scale}" fill="#f5efe8" letter-spacing="0.02em">${monogram}</text>`
    : "";

  return `<svg width="${args.width}" height="${args.height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${centerX}" y="${inviteY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${15 * scale}" fill="#111111">${escapeXml(ENVELOPE_INVITE_LINE)}</text>
  <text x="${centerX}" y="${dateY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${15 * scale}" fill="#111111" letter-spacing="0.08em">${date}</text>
  ${monogramBlock}
</svg>`;
}

export type RenderInviteOgImageInput = {
  publicDir: string;
  envelopeCardDateDisplay: string;
  envelopeMonogramDisplay?: string | null;
};

/** Fabric background + cream shell + envelope art + invite/date/monogram (same as email). */
export async function renderInviteOgImage(input: RenderInviteOgImageInput): Promise<Buffer> {
  const fabric = await readPublicImage(input.publicDir, [
    EMAIL_FABRIC_BACKGROUND_FILENAME,
    "invite-bg-light.png",
  ]);
  const envelopeRaw = await readPublicImage(input.publicDir, [ENVELOPE_TEMPLATE_FILENAME]);

  const background =
    fabric != null
      ? await sharp(fabric).resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "center" }).png().toBuffer()
      : await sharp({
          create: {
            width: OG_WIDTH,
            height: OG_HEIGHT,
            channels: 3,
            background: "#ebe6dc",
          },
        })
          .png()
          .toBuffer();

  const shellX = (OG_WIDTH - SHELL_WIDTH) / 2;
  const shellY = SHELL_PADDING_Y;
  const shellH = OG_HEIGHT - SHELL_PADDING_Y * 2;

  const shellSvg = `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${shellX}" y="${shellY}" width="${SHELL_WIDTH}" height="${shellH}" rx="${SHELL_RADIUS}" ry="${SHELL_RADIUS}" fill="rgba(252,250,247,0.78)"/>
</svg>`;

  const composites: sharp.OverlayOptions[] = [{ input: Buffer.from(shellSvg), top: 0, left: 0 }];

  let envelopeX = shellX + (SHELL_WIDTH - ENVELOPE_WIDTH) / 2;
  let envelopeY = shellY + 36;

  if (envelopeRaw) {
    const meta = await sharp(envelopeRaw).metadata();
    const envW = ENVELOPE_WIDTH;
    const envH = Math.round(envW * ((meta.height ?? 600) / (meta.width ?? 520)));
    envelopeX = Math.round((OG_WIDTH - envW) / 2);
    envelopeY = shellY + Math.max(24, Math.round((shellH - envH) * 0.08));

    const envelopeBuf = await sharp(envelopeRaw).resize(envW, envH, { fit: "contain" }).png().toBuffer();
    composites.push({ input: envelopeBuf, top: envelopeY, left: envelopeX });

    const textSvg = buildEnvelopeTextSvg({
      width: OG_WIDTH,
      height: OG_HEIGHT,
      envelopeX,
      envelopeY,
      envelopeW: envW,
      dateLine: input.envelopeCardDateDisplay,
      monogram: input.envelopeMonogramDisplay?.trim() || null,
    });
    composites.push({ input: Buffer.from(textSvg), top: 0, left: 0 });
  } else {
    const fallbackText = buildEnvelopeTextSvg({
      width: OG_WIDTH,
      height: OG_HEIGHT,
      envelopeX: shellX,
      envelopeY: shellY + 120,
      envelopeW: SHELL_WIDTH,
      dateLine: input.envelopeCardDateDisplay,
      monogram: input.envelopeMonogramDisplay?.trim() || null,
    });
    composites.push({ input: Buffer.from(fallbackText), top: 0, left: 0 });
  }

  return sharp(background).composite(composites).png().toBuffer();
}
