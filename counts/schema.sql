-- Open Chiari's counters (Cloudflare D1). Totals only: nothing about who visited is ever stored.
CREATE TABLE IF NOT EXISTS counts (
  name TEXT PRIMARY KEY,        -- visit, explore, explain, study
  n INTEGER NOT NULL DEFAULT 0
);
-- Websites that show the embedded model: the site's address only (for example conquerchiari.org), never a person.
CREATE TABLE IF NOT EXISTS embed_sites (
  host TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL
);
