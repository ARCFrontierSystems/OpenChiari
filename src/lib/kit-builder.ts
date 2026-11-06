/**
 * Awareness kit, "Make your own": square posts and stories drawn on the visitor's device (a canvas, downloaded as a
 * PNG). Nothing is uploaded: the visitor's words and logo or photo never leave the browser.
 *
 * The main message is always one of the approved lines (kit.builder.messages in src/i18n), so every graphic that
 * carries the Open Chiari name states only checked facts. Each line names Chiari malformation itself, so it stands
 * alone (Matthew, Nov 5). "What is Chiari malformation?" always comes with its approved answer. The visitor's own words
 * are drawn in a separate box.
 *
 * Reworked Nov 5 (docs/drafts/2026-11-05-make-your-own.md): the awareness ribbon and "Chiari Awareness" label at the
 * top of every graphic, and an optional picture of Chiari (with its caption and the model credit in the small print).
 */
import { RIBBON_PATH } from './ribbon';

export type Theme = 'purple' | 'light' | 'dark';
export type Shape = 'square' | 'story';

export interface GraphicOptions {
  shape: Shape;
  theme: Theme;
  /** The awareness label next to the ribbon ("Chiari Awareness"). */
  label: string;
  message: string;
  /** The approved answer that goes with "What is Chiari malformation?". */
  answer?: string;
  own: string;
  name: string;
  when: string;
  image: ImageBitmap | null;
  /** The picture of Chiari, already loaded, or null to leave it out. */
  figure: HTMLImageElement | null;
  /** Bottom line: the site address. */
  site: string;
  /** Small print: "Not medical advice…", the caption and model credit when the picture shows, and on Spanish pages the translation notice. */
  small: string;
}

export const THEMES: Record<Theme, { bg: string; ink: string; soft: string; accent: string; box: string; panel: string }> = {
  purple: { bg: '#5B027E', ink: '#FFFFFF', soft: '#EBD7F4', accent: '#CB98E1', box: 'rgba(255,255,255,0.10)', panel: '#F5EDF9' },
  light: { bg: '#F5F5F3', ink: '#1C1D21', soft: '#5E5F66', accent: '#5B027E', box: '#FFFFFF', panel: '#FFFFFF' },
  dark: { bg: '#17181C', ink: '#ECEAE4', soft: '#A3A1A9', accent: '#CB98E1', box: 'rgba(255,255,255,0.06)', panel: '#F2EFEA' },
};

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, sans-serif";

/** Splits a word that is wider than the line on its own (a long web address, or a run of letters with no spaces)
 *  into pieces that fit, so nothing runs off the edge of the picture. */
function splitLong(ctx: CanvasRenderingContext2D, word: string, width: number): string[] {
  if (ctx.measureText(word).width <= width) return [word];
  const pieces: string[] = [];
  let piece = '';
  for (const ch of Array.from(word)) {
    if (piece && ctx.measureText(piece + ch).width > width) {
      pieces.push(piece);
      piece = ch;
    } else piece += ch;
  }
  if (piece) pieces.push(piece);
  return pieces;
}

/** Breaks text into lines that fit the width at the current font. */
function lines(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean).flatMap((w) => splitLong(ctx, w, width))) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      out.push(line);
      line = word;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

/** Loads the static picture of Chiari (an SVG string) as an image the canvas can draw. */
export function loadFigure(svg: string): Promise<HTMLImageElement> {
  const sized = svg.replace('<svg ', '<svg width="976" height="1024" ');
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** The ribbon, stroked in the given color, in a square box of the given size with its top-left at x, y. */
function ribbon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.strokeStyle = color;
  ctx.lineWidth = 13;
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(RIBBON_PATH));
  ctx.restore();
}

export async function drawGraphic(canvas: HTMLCanvasElement, o: GraphicOptions): Promise<void> {
  await Promise.all([document.fonts?.load(`600 40px ${SERIF}`), document.fonts?.load(`400 20px ${SANS}`), document.fonts?.load(`600 20px ${SANS}`)]);
  const story = o.shape === 'story';
  const W = 1080, H = story ? 1920 : 1080;
  const PAD = story ? 104 : 84;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const t = THEMES[o.theme];
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';
  const textW = W - 2 * PAD;

  // Top row: the ribbon and "Chiari Awareness" on the left; the visitor's logo or photo on the right (aspect kept).
  let y = PAD;
  const rib = story ? 76 : 64;
  ribbon(ctx, PAD - rib * 0.28, y, rib, t.accent);
  const labelPx = story ? 34 : 28;
  ctx.font = `600 ${labelPx}px ${SANS}`;
  ctx.fillStyle = o.theme === 'light' ? t.accent : t.ink;
  ctx.fillText(o.label, PAD + rib * 0.62, y + (rib - labelPx) / 2);
  let topH = rib;
  if (o.image) {
    const boxW = story ? 300 : 240, boxH = story ? 200 : 150;
    const s = Math.min(boxW / o.image.width, boxH / o.image.height);
    const w = o.image.width * s, h = o.image.height * s;
    ctx.drawImage(o.image, W - PAD - w, y, w, h);
    topH = Math.max(topH, h);
  }
  y += topH + (story ? 72 : 48);

  // Bottom block, measured first so the middle can take the space left.
  const smallPx = 20;
  ctx.font = `400 ${smallPx}px ${SANS}`;
  const smallLines = lines(ctx, o.small, textW);
  const sitePx = story ? 40 : 34;
  const bottomH = sitePx + 18 + smallLines.length * (smallPx * 1.35);

  const ownPx = story ? 38 : 32;
  ctx.font = `400 ${ownPx}px ${SANS}`;
  const ownLines = o.own ? lines(ctx, o.own, textW - 56) : [];
  const meta = [o.name, o.when].filter(Boolean);
  const metaPx = story ? 34 : 28;
  // A long name or place can take more than one line: count the lines it will really use.
  ctx.font = `600 ${metaPx}px ${SANS}`;
  const metaLines = meta.reduce((n, m) => n + lines(ctx, m, textW).length, 0);
  const ownH = (ownLines.length ? ownLines.length * ownPx * 1.35 + 56 : 0) + (metaLines ? metaLines * metaPx * 1.4 + (ownLines.length ? 24 : 0) : 0);

  // The message (and its answer), as large as fits. With the picture: on a story it goes below the message and keeps
  // about 40% of the space; on a square post it goes in a panel beside the message, so it always fits.
  const middleEnd = H - PAD - bottomH - 48 - (ownH ? ownH + 48 : 0);
  const top = y;
  const free = middleEnd - top;
  const side = !!o.figure && !story;
  const panelW = Math.round(textW * 0.4);
  const msgW = side ? textW - panelW - 40 : textW;
  const room = side ? free : free - (o.figure ? free * 0.42 + 40 : 0);
  const maxPx = story ? 112 : side ? 64 : 88;
  const serif = (px: number) => `600 ${px}px ${SERIF}`;
  const sans = (px: number) => `400 ${px}px ${SANS}`;
  const answerPx = (p: number) => Math.max(22, Math.round(p * 0.46));
  const height = (p: number) => {
    ctx.font = serif(p);
    let h = lines(ctx, o.message, msgW).length * p * 1.12;
    if (o.answer) {
      ctx.font = sans(answerPx(p));
      h += 28 + lines(ctx, o.answer, msgW).length * answerPx(p) * 1.35;
    }
    return h;
  };
  let px = maxPx;
  while (px > 30 && height(px) > room) px -= 2;
  ctx.fillStyle = t.ink;
  ctx.font = serif(px);
  for (const l of lines(ctx, o.message, msgW)) {
    ctx.fillText(l, PAD, y);
    y += px * 1.12;
  }
  if (o.answer) {
    y += 28;
    const ap = answerPx(px);
    ctx.font = sans(ap);
    ctx.fillStyle = o.theme === 'light' ? t.ink : t.soft;
    for (const l of lines(ctx, o.answer, msgW)) {
      ctx.fillText(l, PAD, y);
      y += ap * 1.35;
    }
  }

  // The picture of Chiari, on a light panel so it reads on every color.
  const panel = (x: number, py: number, w: number, h: number) => {
    const fig = o.figure!;
    const ratio = fig.width / fig.height;
    const iw = Math.min(w - 32, (h - 32) * ratio);
    const ih = iw / ratio;
    ctx.fillStyle = t.panel;
    ctx.beginPath();
    ctx.roundRect(x, py, w, h, 12);
    ctx.fill();
    ctx.drawImage(fig, x + (w - iw) / 2, py + (h - ih) / 2, iw, ih);
  };
  if (side) {
    const h = Math.max(Math.min(free, panelW * 1.25), y - top);
    panel(PAD + textW - panelW, top, panelW, h);
    y = Math.max(y, top + h);
  } else if (o.figure) {
    y += 40;
    panel(PAD, y, textW, Math.max(200, middleEnd - y));
    y = Math.max(middleEnd, y + 200);
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
