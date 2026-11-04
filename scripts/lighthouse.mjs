/**
 * Lighthouse checks (mobile profile) for the main pages, run against the built site.
 * Usage: npm run build && npx astro preview --port 4323 & node scripts/lighthouse.mjs http://localhost:4323
 *
 * Thresholds:
 * - Every page: accessibility >= 95, best practices >= 90, SEO >= 90, largest paint <= 2.5 s.
 * - Home: performance >= 90.
 * - Explorer: performance is reported, not enforced. Test machines have no graphics chip, so
 *   setting up 3D runs in software there and inflates "blocking time" far beyond a real phone.
 *   The Explorer runs with reduced motion so Lighthouse measures loading, not the flow animation.
 * Results are written to lighthouse-results.json (used later by the Impact page's quality report).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4323';
const chrome = process.env.CHROME_PATH;
const pages = [
  { name: 'Home', path: '/', minPerformance: 90 },
  { name: '3D Explorer', path: '/explorer/', minPerformance: null, flags: ['--force-prefers-reduced-motion'] },
];
const min = { accessibility: 95, 'best-practices': 90, seo: 90 };

const results = [];
const problems = [];
for (const page of pages) {
  const out = `lighthouse-${page.path.replace(/\W/g, '') || 'home'}.json`;
  const chromeFlags = ['--headless=new', '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...(page.flags ?? [])].join(' ');
  execFileSync(
    'npx',
    ['--yes', 'lighthouse@13.6.0', base + page.path, '--quiet', `--chrome-flags=${chromeFlags}`, '--output=json', `--output-path=${out}`,
      '--only-categories=performance,accessibility,best-practices,seo'],
    { stdio: 'inherit', env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) }, timeout: 600000 },
  );
  const report = JSON.parse(readFileSync(out, 'utf8'));
  const score = (k) => Math.round(report.categories[k].score * 100);
  const lcp = report.audits['largest-contentful-paint'].numericValue / 1000;
  const r = {
    page: page.name,
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    largestPaintSeconds: Math.round(lcp * 10) / 10,
  };
  results.push(r);
  for (const [k, v] of Object.entries(min)) if (score(k) < v) problems.push(`${page.name}: ${k} ${score(k)} (needs ${v})`);
  if (page.minPerformance && r.performance < page.minPerformance) problems.push(`${page.name}: performance ${r.performance} (needs ${page.minPerformance})`);
  if (lcp > 2.5) problems.push(`${page.name}: largest paint ${r.largestPaintSeconds} s (needs 2.5 s or less)`);
}

writeFileSync('lighthouse-results.json', JSON.stringify({ date: new Date().toISOString(), results }, null, 2) + '\n');
const table = ['| Page | Speed | Accessibility | Best practices | SEO | Largest paint |', '| --- | --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.page} | ${r.performance} | ${r.accessibility} | ${r.bestPractices} | ${r.seo} | ${r.largestPaintSeconds} s |`)].join('\n');
console.log('\n' + table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, '### Lighthouse (mobile)\n\n' + table + '\n');
if (problems.length) {
  console.error('\nFAILED:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nLighthouse checks passed.');
