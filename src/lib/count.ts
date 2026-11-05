/**
 * Open Chiari's counters (functions/api/count.js): the browser sends only the name of what happened, and the server
 * adds 1 to a total. No cookies, no storage on the device, nothing about the visitor, and never the address of the
 * page or anything after the # in a link (CLAUDE.md rule 2).
 *
 * Counts are sent only from openchiari.org itself, so test runs, previews and copies of the site don't add to them.
 */
export type CountEvent = 'visit' | 'explore' | 'explain' | 'study' | 'embed';

const sent = new Set<string>();
const live = () => /^(www\.)?openchiari\.org$/.test(location.hostname);

/** Adds 1 to a total, at most once per page load for each kind of thing. */
export function count(e: CountEvent, site?: string) {
  if (!live() || sent.has(e)) return;
  sent.add(e);
  try {
    void fetch('/api/count', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(site ? { e, site } : { e }),
    }).catch(() => {});
  } catch {
    // Counting never gets in the visitor's way.
  }
}

/** A visit is counted when someone arrives from outside the site (or types the address); moving between pages isn't. */
export function countVisit() {
  if (location.pathname.startsWith('/embed')) return;
  let fromHere = false;
  try {
    fromHere = !!document.referrer && new URL(document.referrer).host === location.host;
  } catch {
    // An unreadable referrer counts as arriving from outside.
  }
  if (!fromHere) count('visit');
}
