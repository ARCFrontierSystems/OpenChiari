// Builds the three downloads offered on the Open model page, into public/downloads/:
//   openchiari-model-gltf.zip     the web model (all four views in one glTF file, as the Explorer loads it)
//   openchiari-model-blender.zip  the same model in Blender, one collection per view
//   openchiari-figures.zip        the labeled 2D figure for each view, as PNG images and one PDF
// Each zip also holds CREDIT.txt (the credit line from docs/COPY.md "Open model") and LICENSE.md (LICENSE-MODEL.md),
// so the credit travels with the files (CLAUDE.md rule 3).
// Run after the model or figures change: node --experimental-strip-types scripts/make-downloads.mjs
// (needs model/realistic/.venv for Blender)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { anatomyFigureSvg } from '../src/lib/anatomy-figure.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'public/downloads');
mkdirSync(out, { recursive: true });
const strings = JSON.parse(readFileSync(join(root, 'src/i18n/en.json'), 'utf8'));
const m = strings.model;
const work = mkdtempSync(join(tmpdir(), 'oc-downloads-'));

const credit = [m.creditIntro, '', m.creditLine, '', `${m.licenseLabel}: ${m.license} (https://creativecommons.org/licenses/by-sa/4.0/)`, '', m.footnote, ''].join('\n');
function pack(name, files) {
  const dir = join(work, name);
  mkdirSync(dir, { recursive: true });
  for (const [to, from] of Object.entries(files)) (typeof from === 'string' && from.startsWith('/') ? copyFileSync(from, join(dir, to)) : writeFileSync(join(dir, to), from));
  writeFileSync(join(dir, 'CREDIT.txt'), credit);
  copyFileSync(join(root, 'LICENSE-MODEL.md'), join(dir, 'LICENSE.md'));
  rmSync(join(out, `${name}.zip`), { force: true });
  execFileSync('zip', ['-q', '-X', '-r', join(out, `${name}.zip`), '.'], { cwd: dir });
  console.log('wrote', `public/downloads/${name}.zip`);
}

// 1. Web model: the Explorer's desktop file (glTF binary, meshopt-compressed; each structure's extras.conditions
//    lists the views it belongs to).
const web = join(root, 'model/realistic/web/realistic-desktop.glb');
pack('openchiari-model-gltf', { 'openchiari-model.glb': web });

// 2. Blender: the same model unpacked (no compression), imported with one collection per view.
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(web);
for (const e of doc.getRoot().listExtensionsUsed()) if (['EXT_meshopt_compression', 'KHR_mesh_quantization'].includes(e.extensionName)) e.dispose();
await doc.transform(dequantize());
await io.write(join(work, 'unpacked.glb'), doc);
writeFileSync(join(work, 'readme.txt'), credit);
execFileSync(join(root, 'model/realistic/.venv/bin/python'), ['-I', join(root, 'model/realistic/make_blend.py'), join(work, 'unpacked.glb'), join(work, 'openchiari-model.blend'), join(work, 'readme.txt')], { stdio: 'ignore' });
pack('openchiari-model-blender', { 'openchiari-model.blend': join(work, 'openchiari-model.blend') });

// 3. Figure set: the site's own figure code (src/lib/anatomy-figure.ts), labeled, one page per view, with the
//    condition name, the illustration caption and the credit under it.
const fonts = ['source-serif-4/files/source-serif-4-latin-600-normal.woff2', 'ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2', 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'];
const [serif, sans, mono] = fonts.map((f) => `url(data:font/woff2;base64,${readFileSync(join(root, 'node_modules/@fontsource', f)).toString('base64')})`);
const conditions = ['typical', 'chiari', 'syrinx', 'surgery'];
const x = strings.explorer;
const footer = strings.footer;
const creditText = `${footer.factsBefore} ${footer.ninds}${footer.modelBefore} ${footer.zAnatomy} ${footer.modelAfter}`;
const page = (c) => `<section class="page">
  <h1>${x.conditions[c].label}</h1>
  ${anatomyFigureSvg({ condition: c, flow: true, labels: true, measure: true }, strings.figure)}
  <p class="cap">${x.captionIllustration} · ${x.captionFlow}</p>
  <p class="credit">${creditText}</p>
  <p class="credit">${footer.notAdvice} ${footer.notAdviceRest.wide}</p>
</section>`;
const css = `@font-face{font-family:'Source Serif 4';font-weight:600;src:${serif}}
@font-face{font-family:'IBM Plex Sans';font-weight:400;src:${sans}}
@font-face{font-family:'IBM Plex Mono';font-weight:400;src:${mono}}
@page{size:A4 landscape;margin:12mm}
body{margin:0;background:#fff;color:#1C1D21;font-family:'IBM Plex Sans',sans-serif}
.page{width:1000px;padding:24px;box-sizing:border-box;break-after:page}
h1{font-family:'Source Serif 4',serif;font-weight:600;font-size:26px;margin:0 0 8px}
svg{display:block;width:100%;height:auto}
.cap{font-size:14px;margin:8px 0 4px}.credit{font-size:11px;color:#5E5F66;margin:2px 0}`;
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 2 });
const files = {};
for (const c of conditions) {
  await tab.setContent(`<!doctype html><meta charset="utf-8"><style>${css}</style>${page(c)}`);
  await tab.evaluate(() => document.fonts.ready);
  const png = join(work, `figure-${c}.png`);
  await tab.locator('.page').screenshot({ path: png });
  files[`openchiari-figure-${c}.png`] = png;
}
await tab.setContent(`<!doctype html><meta charset="utf-8"><style>${css}</style>${conditions.map(page).join('')}`);
await tab.evaluate(() => document.fonts.ready);
await tab.pdf({ path: join(work, 'figures.pdf'), format: 'A4', landscape: true, printBackground: true });
files['openchiari-figures.pdf'] = join(work, 'figures.pdf');
await browser.close();
pack('openchiari-figures', files);

rmSync(work, { recursive: true, force: true });
