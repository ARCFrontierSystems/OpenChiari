/**
 * Awareness kit, "Make your own": square posts and stories drawn on the visitor's device (a canvas, downloaded as a
 * PNG). Nothing is uploaded: the visitor's words and logo or photo never leave the browser.
 *
 * The main message is always one of the approved lines (kit.builder.messages in src/i18n), so every graphic that
 * carries the Open Chiari name states only checked facts. The visitor's own words are drawn in a separate box.
 */

export type Theme = 'purple' | 'light' | 'dark';
export type Shape = 'square' | 'story';

export interface GraphicOptions {
  shape: Shape;
  theme: Theme;
  message: string;
  own: string;
  name: string;
  when: string;
  image: ImageBitmap | null;
  /** Bottom line: the site address. */
  site: string;
  /** Small print: "Not medical advice…" and, on Spanish pages, the translation notice. */
  small: string;
}

export const THEMES: Record<Theme, { bg: string; ink: string; soft: string; accent: string; box: string }> = {
  purple: { bg: '#5B027E', ink: '#FFFFFF', soft: '#EBD7F4', accent: '#CB98E1', box: 'rgba(255,255,255,0.10)' },
  light: { bg: '#F5F5F3', ink: '#1C1D21', soft: '#5E5F66', accent: '#5B027E', box: '#FFFFFF' },
  dark: { bg: '#17181C', ink: '#ECEAE4', soft: '#A3A1A9', accent: '#CB98E1', box: 'rgba(255,255,255,0.06)' },
};

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, sans-serif";

/** Breaks text into lines that fit the width at the current font. */
function lines(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      out.push(line);
      line = word;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

/** The largest font size (down to min) at which the text fits in maxLines lines. */
function fit(ctx: CanvasRenderingContext2D, text: string, width: number, font: (px: number) => string, start: number, min: number, maxLines: number): number {
  let px = start;
  for (; px > min; px -= 2) {
    ctx.font = font(px);
    if (lines(ctx, text, width).length <= maxLines) return px;
  }
  ctx.font = font(min);
  return min;
}

export async function drawGraphic(canvas: HTMLCanvasElement, o: GraphicOptions): Promise<void> {
  await Promise.all([document.fonts?.load(`600 40px ${SERIF}`), document.fonts?.load(`400 20px ${SANS}`), document.fonts?.load(`600 20px ${SANS}`)]);
  const W = 1080, H = o.shape === 'story' ? 1920 : 1080;
  const PAD = o.shape === 'story' ? 104 : 84;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const t = THEMES[o.theme];
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';
  const textW = W - 2 * PAD;

  // Top: the visitor's logo or photo (kept within a box, aspect kept), or the accent bar.
  let y = PAD;
  if (o.image) {
    const box = o.shape === 'story' ? 260 : 170;
    const s = Math.min(box / o.image.width, box / o.image.height);
    ctx.drawImage(o.image, PAD, y, o.image.width * s, o.image.height * s);
    y += o.image.height * s + 48;
  } else {
    ctx.fillStyle = t.accent;
    ctx.fillRect(PAD, y, 120, 10);
    y += 10 + (o.shape === 'story' ? 80 : 56);
  }

  // Bottom block, measured first so the message can take the space left.
  const smallPx = 20;
  ctx.font = `400 ${smallPx}px ${SANS}`;
  const smallLines = lines(ctx, o.small, textW);
  const sitePx = o.shape === 'story' ? 40 : 34;
  const bottomH = sitePx + 18 + smallLines.length * (smallPx * 1.35);

  ctx.font = `400 30px ${SANS}`;
  const ownPx = o.shape === 'story' ? 38 : 32;
  ctx.font = `400 ${ownPx}px ${SANS}`;
  const ownLines = o.own ? lines(ctx, o.own, textW - 56) : [];
  const meta = [o.name, o.when].filter(Boolean);
  const metaPx = o.shape === 'story' ? 34 : 28;
  const ownH = (ownLines.length ? ownLines.length * ownPx * 1.35 + 56 : 0) + (meta.length ? meta.length * metaPx * 1.4 + (ownLines.length ? 24 : 0) : 0);

  // The message, as large as fits.
  const room = H - PAD - bottomH - 48 - (ownH ? ownH + 48 : 0) - y;
  const maxPx = o.shape === 'story' ? 112 : 88;
  const serif = (px: number) => `600 ${px}px ${SERIF}`;
  let px = fit(ctx, o.message, textW, serif, maxPx, 40, 8);
  while (px > 40 && lines(ctx, o.message, textW).length * px * 1.12 > room) {
    px -= 2;
    ctx.font = serif(px);
  }
  ctx.fillStyle = t.ink;
  for (const l of lines(ctx, o.message, textW)) {
    ctx.fillText(l, PAD, y);
    y += px * 1.12;
  }
  y += 48;

  // The visitor's own words, in their own box, and their name or event.
  if (ownLines.length) {
    const h = ownLines.length * ownPx * 1.35 + 56;
    ctx.fillStyle = t.box;
    ctx.fillRect(PAD, y, textW, h);
    ctx.fillStyle = t.accent;
    ctx.fillRect(PAD, y, 8, h);
    ctx.fillStyle = t.ink;
    ctx.font = `400 ${ownPx}px ${SANS}`;
    let yy = y + 28;
    for (const l of ownLines) {
      ctx.fillText(l, PAD + 40, yy);
      yy += ownPx * 1.35;
    }
    y += h + 24;
  }
  if (meta.length) {
    ctx.fillStyle = t.soft;
    ctx.font = `600 ${metaPx}px ${SANS}`;
    for (const m of meta) {
      for (const l of lines(ctx, m, textW)) {
        ctx.fillText(l, PAD, y);
        y += metaPx * 1.4;
      }
    }
  }

  // Bottom: the site and the small print.
  let by = H - PAD - bottomH;
  ctx.fillStyle = o.theme === 'light' ? t.accent : t.ink;
  ctx.font = `600 ${sitePx}px ${SANS}`;
  ctx.fillText(o.site, PAD, by);
  by += sitePx + 18;
  ctx.fillStyle = t.soft;
  ctx.font = `400 ${smallPx}px ${SANS}`;
  for (const l of smallLines) {
    ctx.fillText(l, PAD, by);
    by += smallPx * 1.35;
  }
}
