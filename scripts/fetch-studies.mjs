/**
 * Research studies: fetches recruiting Chiari and syringomyelia studies from the ClinicalTrials.gov API v2 and writes
 * src/data/studies.json with the date it was processed (CLAUDE.md, "Studies").
 *
 * Runs before every publish, and publishing runs every morning (.github/workflows/deploy.yml), so the list is at most
 * a day old. Visitors' browsers never contact ClinicalTrials.gov; they get this file as part of the site.
 *
 * Only facts from the registry are kept (title, status, type, ages, sites, sponsor, the official summary). Plain
 * summaries written by Open Chiari live separately in src/data/study-summaries.json and appear only once Matthew has
 * approved them. Studies that don't have one yet are listed at the end, so they can be written.
 *
 * If ClinicalTrials.gov can't be reached, the last file is kept (its processed date shows how old it is) and the
 * script still exits successfully, so a registry outage never stops the site from publishing.
 *
 *   node scripts/fetch-studies.mjs            fetch and write
 *   node scripts/fetch-studies.mjs --from f   use a saved API response (for testing)
 *   node scripts/fetch-studies.mjs --out f    write somewhere else (CI checks the registry still answers)
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';

const outIdx = process.argv.indexOf('--out');
const OUT = outIdx > 0 ? process.argv[outIdx + 1] : new URL('../src/data/studies.json', import.meta.url);
const SUMMARIES = new URL('../src/data/study-summaries.json', import.meta.url);
const API = 'https://clinicaltrials.gov/api/v2/studies';
const QUERY = { 'query.cond': 'Chiari OR Syringomyelia', 'filter.overallStatus': 'RECRUITING', pageSize: '100', format: 'json' };

const isChiari = (s) => /chiari/i.test(s);
const isSyrinx = (s) => /syring|syrinx|hydromyel/i.test(s);

/** Text from the registry can carry Markdown escapes ("\>") and stray spacing. */
const clean = (s = '') => s.replace(/\\([\\`*_{}\[\]()#+\-.!>])/g, '$1').replace(/\s+/g, ' ').trim();

/** The first two sentences (at most about 450 characters), for the card before a plain summary is approved. */
export function firstSentences(text, n = 2) {
  const t = clean(text);
  const out = [];
  // A sentence ends at . ! or ? followed by a space and a capital letter or digit, except after common abbreviations.
  const re = /[.!?](?=\s+[A-Z0-9(])/g;
  let start = 0;
  let m;
  while (out.length < n && (m = re.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 6), m.index + 1);
    if (/\b(e\.g|i\.e|etc|vs|Dr|Mr|Ms|Mrs|al|approx|No|Fig|St)\.$/i.test(before) || /\b[A-Z]\.$/.test(before)) continue;
    out.push(t.slice(start, m.index + 1).trim());
    start = m.index + 1;
  }
  if (out.length < n && start < t.length) out.push(t.slice(start).trim());
  let s = out.join(' ');
  if (s.length > 450) s = s.slice(0, s.lastIndexOf(' ', 440)) + '…';
  return s;
}

function toStudy(raw) {
  const p = raw.protocolSection ?? {};
  const id = p.identificationModule ?? {};
  const cond = p.conditionsModule ?? {};
  const elig = p.eligibilityModule ?? {};
  const design = p.designModule ?? {};
  const topics = [...(cond.conditions ?? []), ...(cond.keywords ?? []), id.briefTitle ?? '', id.officialTitle ?? ''];
  const conditions = [];
  if (topics.some(isChiari)) conditions.push('chiari');
  if (topics.some(isSyrinx)) conditions.push('syringomyelia');
  const ages = elig.stdAges ?? [];
  const sites = (p.contactsLocationsModule?.locations ?? [])
    .filter((l) => !l.status || l.status === 'RECRUITING' || l.status === 'NOT_YET_RECRUITING')
    .map((l) => ({ facility: clean(l.facility), city: clean(l.city), state: clean(l.state), zip: clean(l.zip), country: clean(l.country) }));
  return {
    nct: id.nctId,
    title: clean(id.briefTitle),
    status: p.statusModule?.overallStatus ?? 'RECRUITING',
    type: design.studyType === 'INTERVENTIONAL' ? 'trial' : design.studyType === 'OBSERVATIONAL' ? 'observational' : 'other',
    children: ages.includes('CHILD'),
    adults: ages.includes('ADULT') || ages.includes('OLDER_ADULT'),
    conditions,
    sponsor: clean(p.sponsorCollaboratorsModule?.leadSponsor?.name),
    officialSummary: firstSentences(p.descriptionModule?.briefSummary ?? ''),
    sites,
    lastUpdated: p.statusModule?.lastUpdatePostDateStruct?.date ?? null,
  };
}

async function fetchAll() {
  const studies = [];
  let token = '';
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ ...QUERY, ...(token ? { pageToken: token } : {}) });
    const res = await fetch(`${API}?${params}`, { headers: { Accept: 'application/json', 'User-Agent': 'OpenChiari-studies-refresh' } });
    if (!res.ok) throw new Error(`ClinicalTrials.gov answered ${res.status}`);
    const body = await res.json();
    studies.push(...(body.studies ?? []));
    token = body.nextPageToken ?? '';
    if (!token) break;
  }
  return studies;
}

const fromIdx = process.argv.indexOf('--from');
let raw;
try {
  raw = fromIdx > 0 ? JSON.parse(readFileSync(process.argv[fromIdx + 1], 'utf8')).studies : await fetchAll();
} catch (error) {
  console.warn(`::warning::Research studies were not refreshed (${error.message}); the last list is kept.`);
  process.exit(0);
}

const studies = raw
  .map(toStudy)
  .filter((s) => s.nct && s.status === 'RECRUITING' && s.conditions.length && s.type !== 'other')
  .sort((a, b) => a.title.localeCompare(b.title));
const data = {
  source: 'ClinicalTrials.gov API v2',
  query: QUERY,
  processed: new Date().toISOString().slice(0, 10),
  studies,
};
writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');

const approved = existsSync(SUMMARIES) ? JSON.parse(readFileSync(SUMMARIES, 'utf8')).studies ?? {} : {};
const waiting = studies.filter((s) => !approved[s.nct]);
console.log(`${studies.length} recruiting studies written (processed ${data.processed}).`);
const report = waiting.length
  ? `Studies waiting for a plain summary (${waiting.length}):\n${waiting.map((s) => `- ${s.nct}: ${s.title}`).join('\n')}\n`
  : 'Every listed study has an approved plain summary.\n';
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Research studies\n\n${studies.length} recruiting, processed ${data.processed}.\n\n${report}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `waiting=${waiting.map((s) => s.nct).join(',')}\n`);
