// Renders design/figures/anatomy-<condition>.svg and .png from src/lib/anatomy-figure.ts (the same source as the site).
// Run: node --experimental-strip-types scripts/render-figures.mjs [outDir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { anatomyFigureSvg, CONDITIONS } from '../src/lib/anatomy-figure.ts';
import strings from '../src/i18n/en.json' with { type: 'json' };

const out = process.argv[2] ?? new URL('../design/figures/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const condition of CONDITIONS) {
  const raw = anatomyFigureSvg({ condition }, strings.figure);
  // Two pixels per figure unit.
  const [, , vw, vh] = raw.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const width = vw * 2, height = vh * 2;
  const page = await browser.newPage({ viewport: { width, height } });
  const svg = raw
    .replace('<svg ', `<svg width="${width}" height="${height}" font-family="IBM Plex Sans, system-ui, sans-serif" `)
    .replace('class="anatomy-figure"', '');
  writeFileSync(`${out}/anatomy-${condition}.svg`, svg + '\n');
  await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
  await page.screenshot({ path: `${out}/anatomy-${condition}.png`, clip: { x: 0, y: 0, width, height } });
  await page.close();
}
await browser.close();
console.log('wrote', CONDITIONS.length, 'figures to', out);
