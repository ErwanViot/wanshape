import type { Session } from '../types/session';
import { computeDifficulty } from './sessionDifficulty';

interface ShareData {
  session: Session;
  realMinutes: number;
  amrapRounds: number;
  /** Already-translated label for difficulty (e.g. "Easy" / "Accessible") */
  difficultyLabel: string;
}

const CARD_SIZE = 1080;
const BG_COLOR = '#0a0a0a';
const BRAND_PRIMARY = '#4F46E5';
const BRAND_SECONDARY = '#3B82F6';
const ACCENT = '#00E5A0';
const WHITE = '#ffffff';
const MUTED = 'rgba(255,255,255,0.5)';

const DIFFICULTY_COLORS: Record<string, string> = {
  accessible: ACCENT,
  modere: '#FBBF24',
  intense: '#EF4444',
};

const DIFFICULTY_EMOJI: Record<string, string> = {
  accessible: '✅',
  modere: '💪',
  intense: '🔥',
};

/** Load logo image from /logo-wan2fit.png */
function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = '/logo-wan2fit.png';
  });
}

/** Draw rounded rectangle */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Generate the branded share card as a Blob */
export async function generateShareCard({
  session,
  realMinutes,
  amrapRounds,
  difficultyLabel,
}: ShareData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d')!;

  // --- Background ---
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // Gradient orb top-right
  const grad1 = ctx.createRadialGradient(850, 150, 0, 850, 150, 500);
  grad1.addColorStop(0, 'rgba(79, 70, 229, 0.25)');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // Gradient orb bottom-left
  const grad2 = ctx.createRadialGradient(200, 900, 0, 200, 900, 450);
  grad2.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // --- Logo ---
  try {
    const logo = await loadLogo();
    const logoSize = 72;
    ctx.drawImage(logo, 80, 70, logoSize, logoSize);
  } catch {
    // Fallback: text logo
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.fillText('W', 80, 110);
  }

  // Brand name next to logo
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 30px Inter, system-ui, sans-serif';
  ctx.fillText('Wan2Fit', 168, 118);

  // --- "Séance terminée" badge ---
  const badgeText = 'SÉANCE TERMINÉE';
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  const badgeWidth = ctx.measureText(badgeText).width + 40;
  const badgeX = 80;
  const badgeY = 200;

  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY);
  badgeGrad.addColorStop(0, BRAND_PRIMARY);
  badgeGrad.addColorStop(1, BRAND_SECONDARY);
  ctx.fillStyle = badgeGrad;
  roundRect(ctx, badgeX, badgeY, badgeWidth, 40, 20);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + 20, badgeY + 20);
  ctx.textBaseline = 'alphabetic';

  // --- Session title ---
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 56px Satoshi, Inter, system-ui, sans-serif';

  // Word wrap title
  const maxWidth = CARD_SIZE - 160;
  const titleWords = session.title.split(' ');
  const titleLines: string[] = [];
  let currentLine = '';
  for (const word of titleWords) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) titleLines.push(currentLine);

  let titleY = 310;
  for (const line of titleLines) {
    ctx.fillText(line, 80, titleY);
    titleY += 68;
  }

  // --- Focus tags ---
  if (session.focus.length > 0) {
    const focusText = session.focus.join(' · ');
    ctx.fillStyle = MUTED;
    ctx.font = '26px Inter, system-ui, sans-serif';
    ctx.fillText(focusText, 80, titleY + 20);
  }

  // --- Stats cards ---
  const difficulty = computeDifficulty(session);
  const diffColor = DIFFICULTY_COLORS[difficulty.level] ?? ACCENT;

  const stats: { value: string; label: string; color: string }[] = [
    { value: `${realMinutes}`, label: 'minutes', color: WHITE },
    { value: `${session.blocks.length}`, label: 'blocs', color: WHITE },
    { value: difficultyLabel, label: 'difficulté', color: diffColor },
  ];
  if (amrapRounds > 0) {
    stats.push({ value: `${amrapRounds}`, label: 'rounds', color: '#FBBF24' });
  }

  const statsY = 560;
  const cardWidth = stats.length <= 3 ? 260 : 200;
  const cardGap = Math.floor((CARD_SIZE - 160 - cardWidth * stats.length) / Math.max(stats.length - 1, 1));
  const statCardHeight = 140;

  stats.forEach((stat, i) => {
    const x = 80 + i * (cardWidth + cardGap);

    // Card background
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, x, statsY, cardWidth, statCardHeight, 20);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, statsY, cardWidth, statCardHeight, 20);
    ctx.stroke();

    // Value
    ctx.fillStyle = stat.color;
    ctx.font = 'bold 44px Satoshi, Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stat.value, x + cardWidth / 2, statsY + 65);

    // Label
    ctx.fillStyle = MUTED;
    ctx.font = '22px Inter, system-ui, sans-serif';
    ctx.fillText(stat.label, x + cardWidth / 2, statsY + 105);
    ctx.textAlign = 'left';
  });

  // --- Decorative line ---
  const lineY = 780;
  const lineGrad = ctx.createLinearGradient(80, lineY, CARD_SIZE - 80, lineY);
  lineGrad.addColorStop(0, BRAND_PRIMARY);
  lineGrad.addColorStop(0.5, ACCENT);
  lineGrad.addColorStop(1, BRAND_SECONDARY);
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, lineY);
  ctx.lineTo(CARD_SIZE - 80, lineY);
  ctx.stroke();

  // --- Trophy emoji + motivational text ---
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 34px Satoshi, Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆  +1 séance dans la boîte !', CARD_SIZE / 2, 860);

  // --- CTA ---
  ctx.fillStyle = MUTED;
  ctx.font = '24px Inter, system-ui, sans-serif';
  ctx.fillText('Rejoins le mouvement → wan2fit.fr', CARD_SIZE / 2, 940);
  ctx.textAlign = 'left';

  // --- Border frame ---
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 2;
  roundRect(ctx, 20, 20, CARD_SIZE - 40, CARD_SIZE - 40, 32);
  ctx.stroke();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))), 'image/png');
  });
}

/** Build the share text message */
function buildShareText({ session, realMinutes, amrapRounds, difficultyLabel }: ShareData): string {
  const difficulty = computeDifficulty(session);
  const emoji = DIFFICULTY_EMOJI[difficulty.level] ?? '💪';
  let stats = `${session.title} · ${realMinutes} min · ${difficultyLabel}`;
  if (amrapRounds > 0) {
    stats += ` · ${amrapRounds} rounds AMRAP`;
  }
  return `🏆 +1 séance dans la boîte !\n${emoji} ${stats}\nRejoins le mouvement →`;
}

const SHARE_URL = 'https://wan2fit.fr';

/** Share session via Web Share API with image, or fallback to clipboard + download */
export async function shareSession(data: ShareData): Promise<'shared' | 'copied'> {
  const text = buildShareText(data);
  const imageBlob = await generateShareCard(data);
  const file = new File([imageBlob], 'wan2fit-session.png', { type: 'image/png' });

  // Web Share API with files support
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      text,
      url: SHARE_URL,
      files: [file],
    });
    return 'shared';
  }

  // Web Share API without files
  if (navigator.share) {
    await navigator.share({ text, url: SHARE_URL });
    return 'shared';
  }

  // Fallback: copy text + download image
  await navigator.clipboard.writeText(`${text}\n${SHARE_URL}`);

  const url = URL.createObjectURL(imageBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wan2fit-session.png';
  a.click();
  URL.revokeObjectURL(url);

  return 'copied';
}
