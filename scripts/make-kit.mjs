// Builds the Awareness kit (Chiari Awareness Month, September) into public/kit/, from design/mockups/Kit.dc.html:
//   social-post.png              square social post, 1080 × 1080
//   quote-card-square.png        quote card, 1080 × 1080
//   quote-card-story.png         quote card, 1080 × 1920 (stories)
//   wallet-cards.pdf             Explain It wallet cards, 8 per US Letter page, cut lines, QR code to the 3D view
//   poster-letter.pdf            event poster and handout, US Letter, with logo space
//   poster-a4.pdf                the same, A4
//   preview-*.png                small pictures of each item, for the kit page
//   open-chiari-awareness-kit.zip  all of the above, with CREDIT.txt and LICENSE.md
// All text comes from src/i18n/en.json (docs/COPY.md "Awareness kit" and approved Home text). Graphics showing the
// model carry the model credit (CLAUDE.md rule 3); the poster also says "Not medical advice".
// Run after the text or figure changes: node --experimental-strip-types scripts/make-kit.mjs
// Spanish (from src/i18n/es.json, pending medical-translator review) into public/kit/es/: add --locale es
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import qrcode from 'qrcode-generator';
import { anatomyFigureSvg } from '../src/lib/anatomy-figure.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const locale = process.argv.includes('--locale') ? process.argv[process.argv.indexOf('--locale') + 1] : 'en';
const spanish = locale === 'es';
const out = join(root, spanish ? 'public/kit/es' : 'public/kit');
mkdirSync(out, { recursive: true });
const s = JSON.parse(readFileSync(join(root, spanish ? 'src/i18n/es.json' : 'src/i18n/en.json'), 'utf8'));
const k = s.kit;
// The model credit exactly as CLAUDE.md rule 3 gives it (built from the footer's pieces, like make-downloads.mjs).
const credit = `${s.footer.modelBefore.replace(/^\.\s*/, '')} ${s.footer.zAnatomy} ${s.footer.modelAfter}`;
// The approved short caption for a Chiari I picture: what it shows, the required tonsil note, and "Illustration".
const caption = s.home.figCaption.narrow;
const notAdvice = `${s.footer.notAdvice} ${s.footer.notAdviceRest.wide}`;
// The wallet card's QR code opens the shared 3D view: Chiari I, side view, flow and measure on, free to explore.
const CARD_URL = spanish ? 'https://openchiari.org/es/v/#c1.side.f.m.x' : 'https://openchiari.org/v/#c1.side.f.m.x';

const font = (f) => `url(data:font/woff2;base64,${readFileSync(join(root, 'node_modules/@fontsource', f)).toString('base64')})`;
const logo = `data:image/png;base64,${readFileSync(join(root, 'public/brand/logo.png')).toString('base64')}`;
const css = `
@font-face{font-family:'Source Serif 4';font-weight:600;src:${font('source-serif-4/files/source-serif-4-latin-600-normal.woff2')}}
@font-face{font-family:'IBM Plex Sans';font-weight:400;src:${font('ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2')}}
@font-face{font-family:'IBM Plex Sans';font-weight:600;src:${font('ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2')}}
@font-face{font-family:'IBM Plex Mono';font-weight:400;src:${font('ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')}}
*{box-sizing:border-box}
body{margin:0;color:#1C1D21;font-family:'IBM Plex Sans',sans-serif}
.serif{font-family:'Source Serif 4',serif;font-weight:600}
.mono{font-family:'IBM Plex Mono',monospace}
.figure .anatomy-figure{width:100%;height:100%}
@page{margin:0}
`;
const figure = (opts) => anatomyFigureSvg({ condition: 'chiari', flow: false, labels: false, dark: false, ...opts }, s.figure);
const qr = (text) => {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
};

const pages = {
  social: `<div class="social" style="width:1080px;height:1080px;padding:72px;display:flex;flex-direction:column;background:#F5F5F3">
    <img src="${logo}" style="height:96px;align-self:flex-start" alt="">
    <p class="serif" style="font-size:76px;line-height:1.1;margin:36px 0 0">${k.socialHeadline}</p>
    <div class="figure" style="flex:1;margin:24px 0;min-height:0">${figure({ measure: true })}</div>
    <p style="font-size:34px;margin:0;color:#5B027E;font-weight:600">${k.socialFooter}</p>
    <p style="font-size:17px;margin:14px 0 0;color:#5E5F66">${caption} ${notAdvice} ${credit}${spanish ? ' ' + s.translation.noticeShort : ''}</p>
  </div>`,
  quoteSquare: `<div style="width:1080px;height:1080px;padding:96px;display:flex;flex-direction:column;justify-content:center;background:#5B027E;color:#fff">
    <span style="display:block;width:120px;height:10px;background:#CB98E1;margin-bottom:56px"></span>
    <p class="serif" style="font-size:92px;line-height:1.12;margin:0">${k.quote}</p>
    <p style="font-size:36px;margin:64px 0 0;color:#EBD7F4">${k.quoteFooter}</p>
    <p style="font-size:30px;margin:16px 0 0;color:#EBD7F4">openchiari.org</p>
    ${spanish ? `<p style="font-size:22px;margin:40px 0 0;color:#EBD7F4">${s.translation.noticeShort}</p>` : ''}
  </div>`,
  quoteStory: `<div style="width:1080px;height:1920px;padding:120px 96px;display:flex;flex-direction:column;justify-content:center;background:#5B027E;color:#fff">
    <span style="display:block;width:140px;height:12px;background:#CB98E1;margin-bottom:72px"></span>
    <p class="serif" style="font-size:112px;line-height:1.1;margin:0">${k.quote}</p>
    <p style="font-size:42px;margin:96px 0 0;color:#EBD7F4">${k.quoteFooter}</p>
    <p style="font-size:36px;margin:20px 0 0;color:#EBD7F4">openchiari.org</p>
    ${spanish ? `<p style="font-size:26px;margin:48px 0 0;color:#EBD7F4">${s.translation.noticeShort}</p>` : ''}
  </div>`,
  // US Letter, 2 × 4 business-card-size cards (3.5 × 2 in) with dashed cut lines.
  cards: `<div style="width:8.5in;height:11in;padding:0.5in 0.75in;display:grid;grid-template-columns:3.5in 3.5in;grid-auto-rows:2in;gap:0.25in 0">
    ${Array.from({ length: 8 }, () => `<div style="border:1px dashed #A9A8A2;padding:0.18in 0.2in;display:flex;gap:0.16in;align-items:center">
      <div style="flex:1">
        <p class="serif" style="font-size:15pt;line-height:1.15;margin:0">${k.cardLine1}</p>
        <p style="font-size:${spanish ? '9pt' : '10pt'};line-height:1.35;margin:0.08in 0 0">${k.cardLine2}</p>
        <p class="mono" style="font-size:8pt;margin:0.1in 0 0;color:#5B027E">openchiari.org</p>
        ${spanish ? `<p style="font-size:6pt;line-height:1.3;margin:0.05in 0 0;color:#5E5F66">${s.translation.noticeShort}</p>` : ''}
      </div>
      <div style="width:1.15in;height:1.15in">${qr(CARD_URL)}</div>
    </div>`).join('')}
  </div>`,
  poster: (w, h) => `<div style="width:${w};height:${h};padding:0.75in;display:flex;flex-direction:column;background:#fff">
    <img src="${logo}" style="height:0.8in;align-self:flex-start" alt="">
    <p class="serif" style="font-size:40pt;line-height:1.1;margin:0.35in 0 0">${k.posterTitle}</p>
    <p style="font-size:15pt;line-height:1.5;margin:0.2in 0 0;max-width:6.4in">${s.home.whatIs.whatItIs.wide}</p>
    <p style="font-size:15pt;line-height:1.5;margin:0.12in 0 0;max-width:6.4in">${s.home.whatIs.whoHasIt.wide}</p>
    <div class="figure" style="flex:1;min-height:0;margin:0.25in 0">${figure({ measure: true })}</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:0.3in">
      <div style="font-size:9pt;color:#5E5F66;line-height:1.45;max-width:4.6in">
        <p class="mono" style="font-size:14pt;margin:0 0 0.08in;color:#5B027E">openchiari.org · #ChiariAwarenessMonth</p>
        <p style="margin:0"><strong style="color:#1C1D21">${s.footer.notAdvice}</strong> ${s.footer.notAdviceRest.wide} ${caption}</p>
        <p style="margin:0">${credit}</p>
        ${spanish ? `<p style="margin:0.04in 0 0">${s.translation.notice}</p>` : ''}
      </div>
      <div style="width:2in;height:1in;border:1.5px dashed #A9A8A2;display:flex;align-items:center;justify-content:center;color:#A9A8A2;font-size:11pt">${k.logoSpace}</div>
    </div>
  </div>`,
};

const browser = await chromium.launch();
const tab = await browser.newPage({ deviceScaleFactor: 1 });
async function render(html, viewport) {
  if (viewport) await tab.setViewportSize(viewport);
  await tab.setContent(`<!doctype html><html lang="${locale}"><meta charset="utf-8"><style>${css}</style>${html}`);
  await tab.evaluate(() => document.fonts.ready);
}
async function png(name, html, width, height) {
  await render(html, { width, height });
  await tab.screenshot({ path: join(out, name), clip: { x: 0, y: 0, width, height } });
  console.log('wrote', join(out, name));
}
async function pdf(name, html, format) {
  await render(html, { width: 816, height: 1056 });
  await tab.pdf({ path: join(out, name), format, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  console.log('wrote', join(out, name));
}

await png('social-post.png', pages.social, 1080, 1080);
await png('quote-card-square.png', pages.quoteSquare, 1080, 1080);
await png('quote-card-story.png', pages.quoteStory, 1080, 1920);
await pdf('wallet-cards.pdf', pages.cards, 'Letter');
await pdf('poster-letter.pdf', pages.poster('8.5in', '11in'), 'Letter');
await pdf('poster-a4.pdf', pages.poster('210mm', '297mm'), 'A4');

// Small pictures of each item for the kit page (the PDFs shown as their first page).
async function preview(name, html, width, height, scale) {
  await tab.setViewportSize({ width: Math.round(width * scale), height: Math.round(height * scale) });
  await tab.setContent(`<!doctype html><html lang="${locale}"><meta charset="utf-8"><style>${css} html{zoom:${scale}}</style>${html}`);
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(out, name), clip: { x: 0, y: 0, width: Math.round(width * scale), height: Math.round(height * scale) } });
  console.log('wrote', join(out, name));
}
await preview('preview-social.png', pages.social, 1080, 1080, 0.5);
await preview('preview-quote.png', pages.quoteSquare, 1080, 1080, 0.5);
await preview('preview-cards.png', pages.cards, 816, 1056, 0.62);
await preview('preview-poster.png', pages.poster('8.5in', '11in'), 816, 1056, 0.62);
await browser.close();

// The ZIP: every file, plus the credit and license, so the credit travels with the graphics.
const work = mkdtempSync(join(tmpdir(), 'oc-kit-'));
const dir = join(work, 'open-chiari-awareness-kit');
mkdirSync(dir);
for (const f of ['social-post.png', 'quote-card-square.png', 'quote-card-story.png', 'wallet-cards.pdf', 'poster-letter.pdf', 'poster-a4.pdf']) copyFileSync(join(out, f), join(dir, f));
writeFileSync(join(dir, 'CREDIT.txt'), [k.license, '', credit, '', s.model.footnote, '', ...(spanish ? [s.translation.notice, ''] : []), spanish ? 'https://openchiari.org/es/kit/' : 'https://openchiari.org/kit/', ''].join('\n'));
copyFileSync(join(root, 'LICENSE-MODEL.md'), join(dir, 'LICENSE.md'));
rmSync(join(out, 'open-chiari-awareness-kit.zip'), { force: true });
execFileSync('zip', ['-q', '-X', '-r', join(out, 'open-chiari-awareness-kit.zip'), 'open-chiari-awareness-kit'], { cwd: work });
rmSync(work, { recursive: true, force: true });
console.log('wrote', join(out, 'open-chiari-awareness-kit.zip'));
