/**
 * Builds the citable copy of the Open Chiari model for Zenodo (docs/ZENODO.md): dataset/openchiari-dataset-<version>.zip.
 *
 * It holds only Open Chiari's own work, all under CC BY-SA 4.0 except the scripts (MIT): the Simple model, figures,
 * printable plaques, the scripts that build and check them, EVIDENCE.md, the audit reports and a fresh
 * `model:check` result. Saved copies of other sites' pages (docs/audits/sources/) are left out: they aren't ours
 * to license. The realistic model is left out until it passes the accuracy checks (CLAUDE.md "Don't").
 *
 * Run: node scripts/make-dataset.mjs [version]   (default 1.0.0)
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const version = process.argv[2] ?? '1.0.0';
const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'dataset');
const name = `openchiari-dataset-${version}`;
const dir = join(out, name);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const copy = (from, to = from) => cpSync(join(root, from), join(dir, to), { recursive: true });
for (const f of ['LICENSE-MODEL.md', 'CITATION.cff', 'docs/EVIDENCE.md', 'design/figures', 'model/simple', 'src/lib/anatomy-shapes.json']) copy(f);
copy('LICENSE', 'LICENSE-CODE-MIT.txt');
for (const f of ['openchiari-model-gltf.zip', 'openchiari-model-blender.zip', 'openchiari-figures.zip', 'openchiari-print.zip']) copy(`public/downloads/${f}`, `downloads/${f}`);
mkdirSync(join(dir, 'docs/audits'), { recursive: true });
for (const f of readdirSync(join(root, 'docs/audits')).filter((f) => f.endsWith('.md'))) copy(`docs/audits/${f}`);

// The model's measurements against EVIDENCE.md, as of this copy.
const check = execFileSync('node', [join(root, 'model/simple/check.mjs')], { cwd: root, encoding: 'utf8' });
writeFileSync(join(dir, 'model-check.txt'), check);

const zenodo = JSON.parse(readFileSync(join(root, '.zenodo.json'), 'utf8'));
const text = zenodo.description.replace(/<\/p><p>/g, '\n\n').replace(/<[^>]+>/g, '');
writeFileSync(
  join(dir, 'README.md'),
  `# ${zenodo.title}\n\nVersion ${version}. https://openchiari.org\n\n${text}\n\n` +
    `## What's here\n\n` +
    `- \`downloads/\`: the Simple model (glTF and Blender), the figures and the 3D-printable plaques, as offered on openchiari.org/model/\n` +
    `- \`design/figures/\`: the midline figure in four conditions\n` +
    `- \`model/simple/\`: the scripts that build the model (\`build.mjs\`) and check its measurements (\`check.mjs\`), and their reference data\n` +
    `- \`src/lib/anatomy-shapes.json\`: the midline shapes shared by the figures and the model\n` +
    `- \`docs/EVIDENCE.md\`: every shape and measurement with its source; \`docs/audits/\`: independent accuracy reports\n` +
    `- \`model-check.txt\`: the automatic measurement check for this copy\n\n` +
    `Licenses: model, figures and documents CC BY-SA 4.0 (LICENSE-MODEL.md); scripts MIT (LICENSE-CODE-MIT.txt).\n`,
);

rmSync(join(out, `${name}.zip`), { force: true });
execFileSync('zip', ['-r', '-q', `${name}.zip`, name], { cwd: out });
rmSync(dir, { recursive: true, force: true });
console.log(`wrote dataset/${name}.zip`);
