// Weekly check of every link that leaves openchiari.org (Phase A, Nov 5). Run after a build:
//   node scripts/check-links.mjs            (checks the links found in dist/)
//   node scripts/check-links.mjs --list     (only lists them)
// A link that is gone (404 or 410) or whose site no longer exists fails the check, so GitHub emails the owner.
// Sites that turn automated visitors away (403, 429, bot checks) are reported but don't fail it: a person should
// open those by hand. No bot check is ever bypassed.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
/** @type {Map<string, Set<string>>} link -> pages it appears on */
const links = new Map();
/** @param {string} folder */
function walk(folder) {
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) {
      const page = '/' + path.slice(root.length).replace(/index\.html$/, '');
      for (const [, href] of readFileSync(path, 'utf8').matchAll(/href="(https?:\/\/[^"]+)"/g)) {
        const url = href.replace(/&amp;/g, '&');
        if (new URL(url).hostname.endsWith('openchiari.org')) continue;
        if (!links.has(url)) links.set(url, new Set());
        links.get(url).add(page);
      }
    }
  }
}
walk(root);

if (process.argv.includes('--list')) {
  for (const [url, pages] of links) console.log(url, '←', [...pages].slice(0, 3).join(', '));
  console.log(`${links.size} outside links`);
  process.exit(0);
}

/** @param {string} url */
async function check(url) {
  const headers = { 'user-agent': 'Mozilla/5.0 (compatible; OpenChiariLinkCheck/1.0; +https://openchiari.org/about/)' };
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, headers, redirect: 'follow', signal: AbortSignal.timeout(25000) });
      if (method === 'HEAD' && (res.status === 405 || res.status === 403 || res.status === 404)) continue; // some sites only answer GET
      return { status: res.status };
    } catch (error) {
      if (method === 'GET') return { status: 0, error: String(error?.cause?.code ?? error?.name ?? error) };
    }
  }
  return { status: 0, error: 'no answer' };
}

const gone = [], blocked = [], ok = [];
const queue = [...links.keys()];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const { status, error } = await check(url);
      const where = [...links.get(url)].slice(0, 3).join(', ');
      if (status >= 200 && status < 400) ok.push(url);
      else if (status === 404 || status === 410 || error === 'ENOTFOUND') gone.push(`${status || error}  ${url}  (on ${where})`);
      else blocked.push(`${status || error}  ${url}  (on ${where})`);
    }
  }),
);
console.log(`${ok.length} of ${links.size} outside links answered.`);
if (blocked.length) console.log(`\nCouldn't check automatically (open these by hand):\n${blocked.join('\n')}`);
if (gone.length) {
  console.log(`\nGone or moved (fix these):\n${gone.join('\n')}`);
  process.exit(1);
}
