/**
 * Build the master 1024×1024 icons that @capacitor/assets fans out into
 * every iOS / Android size.
 *
 * Source: public/icon-512.png — the official Wan2Fit logo (W in circle).
 * 512 → 1024 is a 2× upscale; sharp's lanczos3 keeps the bold strokes
 * crisp enough for SpringBoard. The PNG ships with a white background
 * which we keep — iOS rounds the corners, the colour stays brand-true.
 *
 * Outputs (in resources/):
 *   - icon.png              1024×1024 — used by iOS as the App Icon source.
 *   - icon-foreground.png   1024×1024 — Android adaptive foreground (logo
 *                           centred at 58% of the canvas to survive the
 *                           system safe-area mask).
 *   - icon-background.png   1024×1024 — solid white Android adaptive
 *                           background, matches the source PNG's bg.
 *
 * Run with: tsx scripts/generate-app-icon.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'resources');
const SOURCE_PATH = join(ROOT, 'public/icon-512.png');

const SIZE = 1024;
const WHITE_BG = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 };
const FOREGROUND_INSET = 0.58;

async function upscaledLogo(targetSizePx: number): Promise<Buffer> {
  return sharp(SOURCE_PATH)
    .resize({
      width: targetSizePx,
      height: targetSizePx,
      fit: 'contain',
      kernel: 'lanczos3',
      background: WHITE_BG,
    })
    .png()
    .toBuffer();
}

async function compose(targetSize: number, logoScale: number, background: typeof WHITE_BG): Promise<Buffer> {
  const logoSize = Math.round(targetSize * logoScale);
  const offset = Math.round((targetSize - logoSize) / 2);
  const logo = await upscaledLogo(logoSize);

  return sharp({
    create: {
      width: targetSize,
      height: targetSize,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toBuffer();
}

async function solidBackground(targetSize: number): Promise<Buffer> {
  return sharp({
    create: { width: targetSize, height: targetSize, channels: 4, background: WHITE_BG },
  })
    .png()
    .toBuffer();
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // iOS: full-bleed logo on its native white background.
  const iconCombined = await upscaledLogo(SIZE);
  writeFileSync(join(OUT, 'icon.png'), iconCombined);

  // Android adaptive: logo inset on a transparent canvas (foreground)
  // over a solid white square (background).
  const iconForeground = await compose(SIZE, FOREGROUND_INSET, WHITE_BG);
  writeFileSync(join(OUT, 'icon-foreground.png'), iconForeground);

  const iconBackground = await solidBackground(SIZE);
  writeFileSync(join(OUT, 'icon-background.png'), iconBackground);

  console.log('[icon] generated 3 master files in resources/ from public/icon-512.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
