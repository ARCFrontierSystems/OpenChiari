/**
 * Impact page totals: reads https://openchiari.org/api/totals (Open Chiari's own counters, functions/api/totals.js)
 * into src/data/impact.json before the site is built. Totals only.
 * If the counters can't be read, the last file is kept and the script still exits successfully.
 */
import { writeFileSync } from 'node:fs';

const URL_TOTALS = process.argv[2] ?? 'https://openchiari.org/api/totals';
const OUT = new URL('../src/data/impact.json', import.meta.url);
const KEYS = ['visit', 'explore', 'explain', 'study', 'embedSites'];
try {
  const res = await fetch(URL_TOTALS, { headers: { Accept: 'application/json' } });
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) throw new Error(`answered ${res.status}`);
  const body = await res.json();
  const totals = Object.fromEntries(KEYS.map((k) => [k, Number.isFinite(body[k]) ? body[k] : null]));
  writeFileSync(OUT, JSON.stringify({ _note: 'Written by scripts/fetch-totals.mjs from /api/totals when the site is published (every morning). null = not counted yet.', updated: new Date().toISOString().slice(0, 10), totals }, null, 2) + '\n');
  console.log('Impact totals:', totals);
} catch (error) {
  console.warn(`::warning::Impact totals were not read (${error.message}); the last ones are kept.`);
}
