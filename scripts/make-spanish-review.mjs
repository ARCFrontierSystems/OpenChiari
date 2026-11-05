// Writes docs/SPANISH-REVIEW.md: every piece of site text side by side, English | Spanish | the independent blind
// back-translation, with the medical sentences marked, so a medical translator can review the Spanish site quickly.
// Run after the English or Spanish text changes: node scripts/make-spanish-review.mjs
// (The back-translation, docs/audits/sources/2026-11-05-spanish/back-translation.json, was made by an agent that had
// not seen the English; see docs/audits/2026-11-05-spanish-backtranslation.md. Rows changed since then say so.)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => JSON.parse(readFileSync(join(root, f), 'utf8'));
const en = read('src/i18n/en.json');
const es = read('src/i18n/es.json');
const backFile = 'docs/audits/sources/2026-11-05-spanish/back-translation.json';
const back = existsSync(join(root, backFile)) ? read(backFile) : {};
const studies = read('src/data/study-summaries.json').studies;

// Identifiers, not text.
const KEEP = new Set(['id', 'num', 'page', 'href', 'checked', '_note']);
// Text that states or implies a medical fact (CLAUDE.md rule 1): the translator should check these first.
const MEDICAL = [
  /^metaDescription$/, /^calm\.(lede|figCaption)$/, /^home\.(lede|figCaption|whatIs|feel|myths)/, /^home\.tools\.items\.\d+\.(wide|narrow)$/,
  /^figure\./, /^explorer\.(conditions|parts)\..*(note|noteShort|text|name|label)$/, /^explorer\.caption/, /^explain\.(starterNote|lookingChiari|help)/,
  /^tour\.steps\.\d+\.text$/, /^compare\.notes\./, /^kit\.(quote|socialHeadline|cardLine)/, /^prep\.(groups|diagramCaption)/,
  /^studies\.before/, /^model\.(checks|footnote)$/, /^footer\.notAdvice/, /^about\.how\.checks$/, /^impact\.accuracy/, /^studySummaries\./,
];
const rows = [];
function walk(a, b, c, path, key) {
  if (KEEP.has(key) || (key === 'conditions' && Array.isArray(a))) return;
  if (Array.isArray(a) || (a && typeof a === 'object')) {
    for (const k of Object.keys(a)) walk(a[k], b?.[k], c?.[k], path ? `${path}.${k}` : k, k);
  } else if (typeof a === 'string' && a.trim()) {
    rows.push({ key: path, en: a, es: b ?? '(missing)', back: c ?? '', medical: MEDICAL.some((r) => r.test(path)) });
  }
}
walk(en, es, back, '', '');
for (const [nct, s] of Object.entries(studies)) {
  for (const f of ['summary', 'whatYoudDo']) {
    if (!s[f]) continue;
    rows.push({ key: `studySummaries.${nct}.${f}`, en: s[f], es: s.es?.[f] ?? '(no Spanish yet)', back: back.studySummaries?.[nct]?.[f] ?? '', medical: true });
  }
}

const cell = (t) => String(t).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const medical = rows.filter((r) => r.medical);
const table = (list) => [
  '| Key | English (approved) | Spanish (on the site) | Blind back-translation |',
  '| --- | --- | --- | --- |',
  ...list.map((r) => `| \`${r.key}\` | ${cell(r.en)} | ${cell(r.es)} | ${cell(r.back)} |`),
].join('\n');

writeFileSync(join(root, 'docs/SPANISH-REVIEW.md'), `# Spanish translation: review sheet

For the medical translator. **Status: pending review.** The Spanish site is public with a notice on every page saying
so (Matthew's decision, 2026-11-05); the English is the reference.

How the Spanish was made and checked:
1. Terms from the word list, \`docs/SPANISH-GLOSSARY.md\` (official MedlinePlus en español pages where possible).
2. Translated from the approved English (\`src/i18n/en.json\`, word for word from \`docs/COPY.md\`), using the earlier
   Spanish Home text in COPY.md where the English hadn't changed.
3. An independent agent translated the Spanish back into English **without seeing the English**, then compared the two
   (\`docs/audits/2026-11-05-spanish-backtranslation.md\`). Its findings were fixed; the back-translation column shows
   what it read *before* those fixes, so a few rows differ on purpose.

Known deliberate differences: the Explain It starter note says the same thing in fewer words, to fit the 280-character
limit; "(en inglés)" is added where content stays in English (official study listings, the downloadable figure set);
Support adds "Sus sitios web pueden estar solo en inglés."

Please check the **medical sentences** first (${medical.length} rows), then the rest (${rows.length - medical.length} rows).
Made by \`scripts/make-spanish-review.mjs\`; rebuild it after any text change.

## Medical sentences

${table(medical)}

## Everything else (buttons, menus, page text)

${table(rows.filter((r) => !r.medical))}
`);
console.log(`wrote docs/SPANISH-REVIEW.md: ${rows.length} rows, ${medical.length} medical`);
