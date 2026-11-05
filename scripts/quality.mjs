/**
 * Impact page quality report: measures the built site and writes src/data/quality.json.
 * - Lighthouse on the home page, phone and desktop: accessibility and speed scores.
 * - The axe accessibility scans of every page (the "accessibility:" tests): passed, or issues found.
 * Usage: npm run build && npx astro preview --port 4323 & node scripts/quality.mjs http://localhost:4323
 * Never fails the publish: anything it can't measure stays "not measured yet".
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4323';
const OUT = new URL('../src/data/quality.json', import.meta.url);
const chromeFlags = '--headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader';
const data = { _note: 'Written by scripts/quality.mjs when the site is published.', lastRun: new Date().toISOString().slice(0, 10), phone: { accessibility: null, speed: null }, desktop: { accessibility: null, speed: null }, wcag: null };

for (const [form, extra] of [['phone', []], ['desktop', ['--preset=desktop']]]) {
  try {
    const out = `lighthouse-quality-${form}.json`;
    execFileSync('npx', ['--yes', 'lighthouse@13.6.0', base + '/', '--quiet', `--chrome-flags=${chromeFlags}`, '--output=json', `--output-path=${out}`, '--only-categories=performance,accessibility', ...extra], { stdio: 'inherit', timeout: 600000 });
    const r = JSON.parse(readFileSync(out, 'utf8'));
    data[form] = { accessibility: Math.round(r.categories.accessibility.score * 100), speed: Math.round(r.categories.performance.score * 100) };
  } catch (error) {
    console.warn(`::warning::Lighthouse (${form}) didn't run: ${error.message}`);
  }
}

try {
  let report;
  try {
    report = execFileSync('npx', ['playwright', 'test', '-g', '^accessibility:', '--reporter=json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 900000 });
  } catch (error) {
    report = error.stdout; // failing tests exit non-zero; the report is still there
  }
  const stats = JSON.parse(report).stats;
  data.wcag = stats.unexpected === 0 && stats.expected > 0 ? 'pass' : 'issues';
  console.log(`Accessibility scans: ${stats.expected} passed, ${stats.unexpected} with issues.`);
} catch (error) {
  console.warn(`::warning::Accessibility scans didn't run: ${error.message}`);
}

writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log('Quality report:', data);
