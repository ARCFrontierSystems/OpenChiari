// @ts-check
import { defineConfig } from 'astro/config';
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
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

// Offline helper (public/sw.js is made here, from scripts/sw-template.js): after the build, list every page and the
// files they need, leaving out the downloads, the kit's print files and the large realistic model (kept only once
// someone opens it). The version changes with every build, so phones pick up new text and fixes.
/** @type {import('astro').AstroIntegration} */
const offline = {
  name: 'offline-helper',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      /** @type {string[]} */
      const files = [];
      /** @param {string} folder */
      const walk = (folder) => {
        for (const name of readdirSync(folder)) {
          const path = join(folder, name);
          if (statSync(path).isDirectory()) walk(path);
          else files.push('/' + relative(root, path).split('\\').join('/'));
        }
      };
      walk(root);
      const keep = files
        // Left out up front (kept once used): downloads, kit files, print files, the 3D models, and the large logos and
        // link-preview picture, so the first visit stays light on a phone plan.
        .filter((f) => (f === '/kit/index.html' || !/^\/(downloads|models|kit)\//.test(f)) && !/\.(zip|pdf)$/.test(f) && !/^\/brand\/(logo\.png|logo-dark\.png|share\.png|icon-(180|512)\.png)$/.test(f) && f !== '/sw.js')
        .map((f) => (f.endsWith('/index.html') ? f.slice(0, -'index.html'.length) : f));
      const template = readFileSync(fileURLToPath(new URL('./scripts/sw-template.js', import.meta.url)), 'utf8');
      const version = Date.now().toString(36);
      writeFileSync(join(root, 'sw.js'), template.replace('__VERSION__', version).replace('__FILES__', JSON.stringify(keep)));
    },
  },
};

// Search engines: a sitemap of every page (each with its other-language twin), and robots.txt pointing to it. The
// embed and the shared views (/v/) are left out; they carry "noindex" (src/components/Head.astro).
/** @type {import('astro').AstroIntegration} */
const sitemap = {
  name: 'sitemap',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const site = 'https://openchiari.org';
      /** @type {string[]} */
      const pages = [];
      /** @param {string} folder */
      const walk = (folder) => {
        for (const name of readdirSync(folder)) {
          const path = join(folder, name);
          if (statSync(path).isDirectory()) walk(path);
          else if (name === 'index.html') pages.push('/' + relative(root, folder).split('\\').join('/') + '/');
        }
      };
      walk(root);
      const paths = pages
        .map((p) => p.replace(/^\/\/$/, '/').replace(/^\/\//, '/'))
        .filter((p) => !/^\/(es\/)?(embed|v)\//.test(p))
        .sort();
      /** @param {string} p */
      const twin = (p) => (p.startsWith('/es/') ? p.slice(3) : '/es' + p);
      /** @param {string} p */
      const english = (p) => (p.startsWith('/es/') ? twin(p) : p);
      const urls = paths.map((p) => {
        const alts = paths.includes(twin(p))
          ? ['en', 'es'].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${site}${l === 'es' ? '/es' + english(p) : english(p)}"/>`).join('')
          : '';
        return `<url><loc>${site}${p}</loc>${alts}</url>`;
      });
      writeFileSync(
        join(root, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
      );
      writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`);
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
  integrations: [realisticModel, offline, sitemap],
  // Local previews only: the counter tests open the preview under the name openchiari.org (tests/site.spec.ts).
  vite: { preview: { allowedHosts: ['openchiari.org'] } },
});
