/** The purple awareness ribbon, drawn as one stroke (a loop on top, two crossing tails). viewBox 0 0 100 100. */
export const RIBBON_PATH = 'M31 95 L58.5 51 C70 32 65 10 50 10 C35 10 30 32 41.5 51 L69 95';

/** The ribbon as an SVG, in the given color, for behind a sticker's words. */
export function ribbonSvg(color: string): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="${RIBBON_PATH}" fill="none" stroke="${color}" stroke-width="13" stroke-linejoin="round"/></svg>`;
}
