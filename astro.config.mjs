// @ts-check
import { defineConfig } from 'astro/config';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The realistic model (Phase 2): Matthew approved it for the public site on 2026-11-04, after it passed the accuracy
// checks (CLAUDE.md rule 1a; audits in docs/audits/). Its web files (model/realistic/web/, made by web.mjs) are
// copied into every build and served by the dev server, so the Explorer can load them on request.
const realisticDir = fileURLToPath(new URL('./model/realistic/web/', import.meta.url));

/** @type {import('astro').AstroIntegration} */
const realisticModel = {
  name: 'realistic-model',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/models\/realistic\/(realistic-(?:desktop|phone)\.glb)$/);
        if (!m || !existsSync(realisticDir + m[1])) return next();
        res.setHeader('Content-Type', 'model/gltf-binary');
        res.end(readFileSync(realisticDir + m[1]));
      });
    },
    'astro:build:done': ({ dir }) => {
      cpSync(realisticDir, fileURLToPath(new URL('./models/realistic/', dir)), { recursive: true });
    },
  },
};

// Static site. English at the root, Spanish under /es/ (built in Phase 4).
export default defineConfig({
  site: 'https://openchiari.org',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [realisticModel],
});
