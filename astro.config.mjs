// @ts-check
import { defineConfig } from 'astro/config';

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
});
