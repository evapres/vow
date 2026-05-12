/**
 * Turns near-white studio pixels in `public/email-invite-envelope-template.png` transparent
 * so the email fabric shows through. Re-run after replacing the source PNG:
 *   npm run envelope:transparent
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const repoRoot = path.join(__dirname, "..");
const pngPath = path.join(repoRoot, "public", "email-invite-envelope-template.png");

/** Only almost-white (keeps the beige card and burgundy envelope). */
const KEY = 252;

async function main() {
  const input = fs.readFileSync(pngPath);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const stride = channels;
  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * stride;
      const r = data[si];
      const g = data[si + 1];
      const b = data[si + 2];
      const oi = (y * width + x) * 4;
      if (r >= KEY && g >= KEY && b >= KEY) {
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

  const tmp = pngPath + ".tmp.png";
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  fs.renameSync(tmp, pngPath);
  console.log("Transparent backdrop:", pngPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
