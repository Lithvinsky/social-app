/**
 * One-off: turn near-black pixels in public/orbit-logo.png transparent.
 * Run from frontend/: node scripts/make-orbit-logo-transparent.mjs
 * (requires: npm i -D sharp)
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { renameSync, unlinkSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pngPath = join(__dirname, "..", "public", "orbit-logo.png");
const tmpPath = join(__dirname, "..", "public", "orbit-logo.png.tmp");

const THRESH = 48; // pixels darker than this (RGB max) → transparent

const image = sharp(pngPath).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

const out = Buffer.from(data);
for (let i = 0; i < out.length; i += 4) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  if (r <= THRESH && g <= THRESH && b <= THRESH) {
    out[i + 3] = 0;
  }
}

await sharp(out, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png()
  .toFile(tmpPath);

unlinkSync(pngPath);
renameSync(tmpPath, pngPath);

console.log("Wrote transparent background:", pngPath);
