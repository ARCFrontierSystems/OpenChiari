// @ts-check
import { defineConfig } from 'astro/config';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The realistic model (Phase 2) is not public until it passes the accuracy checks and Matthew approves it
// (CLAUDE.md rule 1a). Its files are copied into the site, and its button switched on, only in a preview build:
//   PUBLIC_REALISTIC_PREVIEW=1 npm run build   (or npm run dev)
const preview = process.env.PUBLIC_REALISTIC_PREVIEW === '1';
const realisticDir = fileURLToPath(new URL('./model/realistic/web/', import.meta.url));

/** @type {import('astro').AstroIntegration} */
const realisticPreview = {
  name: 'realistic-preview',
  hooks: {
    'astro:server:setup': ({ server }) => {
      if (!preview) return;
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/models\/realistic\/(realistic-(?:desktop|phone)\.glb)$/);
        if (!m || !existsSync(realisticDir + m[1])) return next();
        res.setHeader('Content-Type', 'model/gltf-binary');
        res.end(readFileSync(realisticDir + m[1]));
      });
    },
    'astro:build:done': ({ dir }) => {
      if (!preview) return;
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
  integrations: [realisticPreview],
});
