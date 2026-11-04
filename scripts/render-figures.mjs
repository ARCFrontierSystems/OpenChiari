// Renders design/figures/anatomy-<condition>.svg and .png from src/lib/anatomy-figure.ts (the same source as the site).
// Run: node --experimental-strip-types scripts/render-figures.mjs [outDir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { anatomyFigureSvg, CONDITIONS } from '../src/lib/anatomy-figure.ts';
import strings from '../src/i18n/en.json' with { type: 'json' };

const out = process.argv[2] ?? new URL('../design/figures/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1156 } });
for (const condition of CONDITIONS) {
  const svg = anatomyFigureSvg({ condition }, strings.figure)
    .replace('<svg ', '<svg width="1440" height="1156" font-family="IBM Plex Sans, system-ui, sans-serif" ')
    .replace('class="anatomy-figure"', '');
  writeFileSync(`${out}/anatomy-${condition}.svg`, svg + '\n');
  await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
  await page.screenshot({ path: `${out}/anatomy-${condition}.png`, clip: { x: 0, y: 0, width: 1440, height: 1156 } });
}
await browser.close();
console.log('wrote', CONDITIONS.length, 'figures to', out);
