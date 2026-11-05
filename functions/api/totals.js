/**
 * GET /api/totals  ->  {"visit": 1240, "explore": 410, "explain": 85, "study": 32, "embedSites": 3}
 * The totals the Impact page shows (read when the site is published each morning). Totals only.
 */
export async function onRequestGet({ env }) {
  const totals = { visit: 0, explore: 0, explain: 0, study: 0, embedSites: 0 };
  if (env.COUNTS) {
    const rows = await env.COUNTS.prepare('SELECT name, n FROM counts').all();
    for (const r of rows.results ?? []) if (r.name in totals) totals[r.name] = r.n;
    const sites = await env.COUNTS.prepare('SELECT COUNT(*) AS n FROM embed_sites').first();
    totals.embedSites = sites?.n ?? 0;
  }
  return Response.json(totals, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
