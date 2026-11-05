/**
 * Explain It picture: a still image of the chosen view, with its name, the required captions, "Not medical advice"
 * and the model credit (CLAUDE.md rules 1 and 3), made on the device for messaging apps that don't show link
 * previews. The sender's note is never on it.
 */

export interface PictureText {
  title: string;
  caption: string;
  advice: string;
  credit: string;
  site: string;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number): number {
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

/** An image of the 2D figure, for browsers without 3D. */
export function figureImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export async function makePicture(view: CanvasImageSource & { width: number; height: number }, text: PictureText): Promise<Blob> {
  await document.fonts?.ready;
  const W = 1200, H = 1500, PAD = 56, VIEW_H = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1A1C20'; // --x-viewport
  ctx.fillRect(0, 0, W, H);
  // The view, fitted into the top part.
  const scale = Math.min((W - 2 * PAD) / view.width, (VIEW_H - PAD) / view.height);
  const w = view.width * scale, h = view.height * scale;
  ctx.drawImage(view, (W - w) / 2, PAD + (VIEW_H - PAD - h) / 2, w, h);
  // The words underneath.
  let y = VIEW_H + 40;
  ctx.fillStyle = '#ECEAE4'; // --x-text
  ctx.font = "600 44px 'Source Serif 4', Georgia, serif";
  y = wrap(ctx, text.title, PAD, y, W - 2 * PAD, 54) + 6;
  ctx.fillStyle = '#D2D0CA'; // --x-text-2
  ctx.font = "400 26px 'IBM Plex Sans', system-ui, sans-serif";
  y = wrap(ctx, text.caption, PAD, y, W - 2 * PAD, 36) + 8;
  ctx.fillStyle = '#ECEAE4';
  ctx.font = "600 24px 'IBM Plex Sans', system-ui, sans-serif";
  y = wrap(ctx, text.advice, PAD, y, W - 2 * PAD, 32) + 4;
  ctx.fillStyle = '#A3A1A9'; // --x-muted
  ctx.font = "400 20px 'IBM Plex Sans', system-ui, sans-serif";
  wrap(ctx, text.credit, PAD, y, W - 2 * PAD, 28);
  ctx.fillStyle = '#7FB3D3'; // --x-accent
  ctx.font = "400 26px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText(text.site, PAD, H - PAD + 6);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no image'))), 'image/png'));
}

/** Share the picture with the phone's share sheet, or save it where sharing files isn't possible. */
export async function sharePicture(blob: Blob, filename: string): Promise<'shared' | 'saved' | 'closed'> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch {
      return 'closed';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  return 'saved';
}
