/**
 * POST /api/count   body: {"e": "visit" | "explore" | "explain" | "study" | "embed", "site": "example.org"}
 *
 * Adds 1 to a total in Open Chiari's counter database (Cloudflare D1, binding COUNTS). That is all it does:
 * - it stores no IP address, device, browser, page address, note, time of day or anything after the # in a link;
 * - "site" is used only for "embed": the address of the website showing the embedded model, kept once in a list;
 * - it answers only requests from openchiari.org's own pages, as a basic guard against outside scripts.
 * Nothing here can tell one visitor from another. The Impact page shows the totals (GET /api/totals).
 */
const EVENTS = new Set(['visit', 'explore', 'explain', 'study', 'embed']);
const OWN = /^https:\/\/(www\.)?openchiari\.org$/;
const HOST = /^(?=.{1,100}$)([a-z0-9-]+\.)+[a-z]{2,}$/;

export async function onRequestPost({ request, env }) {
  const done = new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  if (!env.COUNTS || !OWN.test(request.headers.get('Origin') ?? '')) return done;
  let body;
  try {
    body = JSON.parse((await request.text()).slice(0, 300));
  } catch {
    return done;
  }
  const e = String(body?.e ?? '');
  if (!EVENTS.has(e)) return done;
  try {
    if (e === 'embed') {
      const host = String(body.site ?? '').toLowerCase().replace(/^www\./, '');
      if (!HOST.test(host) || /(^|\.)openchiari\.org$/.test(host)) return done;
      await env.COUNTS.prepare('INSERT OR IGNORE INTO embed_sites (host, first_seen) VALUES (?, ?)').bind(host, new Date().toISOString().slice(0, 10)).run();
    } else {
      await env.COUNTS.prepare('INSERT INTO counts (name, n) VALUES (?, 1) ON CONFLICT(name) DO UPDATE SET n = n + 1').bind(e).run();
    }
  } catch {
    // A counting problem never shows to the visitor.
  }
  return done;
}

export const onRequest = () => new Response('Use POST.', { status: 405, headers: { Allow: 'POST' } });
