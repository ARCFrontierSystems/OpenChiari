import en from './en.json';
import esJson from './es.json';

// English at the site root, Spanish under /es/ (astro.config.mjs). Every page reads its language from its address
// (Astro.currentLocale), so the same page file serves both; src/pages/es/ holds one small file per page that shows it.
// The Spanish text (es.json) is pending medical-translator review (CLAUDE.md "Translations"); every Spanish page says so.
export type Strings = typeof en;
export type Locale = 'en' | 'es';
// Typed as the English table, so the type check fails if any Spanish text is missing.
const es: Strings = esJson;
const tables: Record<Locale, Strings> = { en, es };

export function toLocale(locale?: string): Locale {
  return locale === 'es' ? 'es' : 'en';
}

export function getStrings(locale?: string): Strings {
  return tables[toLocale(locale)];
}

// One place for every page address, so links stay consistent as pages are built.
export const routes = {
  home: '/',
  explorer: '/explorer/',
  explain: '/explain/',
  compare: '/explorer/compare/',
  studies: '/studies/',
  prep: '/prep/',
  children: '/children/',
  model: '/model/',
  support: '/support/',
  kit: '/kit/',
  impact: '/impact/',
  openSource: '/impact/#open-source',
  about: '/about/',
  privacy: '/privacy/',
  evidence: '/evidence/',
  es: '/es/',
  tour: '/tour/',
} as const;
export type Routes = { [K in keyof typeof routes]: string };

/** A site address in the given language: '/explorer/' becomes '/es/explorer/' in Spanish. */
export function localePath(path: string, locale?: string): string {
  return toLocale(locale) === 'es' && path.startsWith('/') && !path.startsWith('/es/') ? `/es${path}` : path;
}

/** Every page address in the given language. */
export function getRoutes(locale?: string): Routes {
  return Object.fromEntries(Object.entries(routes).map(([k, v]) => [k, k === 'es' ? v : localePath(v, locale)])) as Routes;
}

/** The same page in the other language ('/es/prep/' and '/prep/'). */
export function otherLanguagePath(pathname: string): string {
  if (pathname === '/es' || pathname.startsWith('/es/')) return pathname.slice(3) || '/';
  return `/es${pathname}`;
}

export const externalLinks = {
  ninds: 'https://www.ninds.nih.gov/publications/chiari-malformation',
  zAnatomy: 'https://github.com/Z-Anatomy/Models-of-human-anatomy',
  // Support page: each organization's own pages (from the Support mockup; confirm with each before launch)
  bjcsfDonate: 'https://bobbyjonescsf.org/donate-online/',
  bjcsfRegistry: 'https://bobbyjonescsf.org/keytoacure/',
  conquerDonate: 'https://conquerchiari.org/donate',
  conquerInfo: 'https://www.conquerchiari.org/',
  asapDonate: 'https://asap.org/donate/',
  asapInfo: 'https://asap.org/',
  email: 'mailto:hello@openchiari.org',
  // Research studies: the registry itself, and its search for recruiting Chiari and syringomyelia studies (the fallback
  // when the list isn't available).
  // The code, public since November 5, 2026.
  repository: 'https://github.com/ARCFrontierSystems/OpenChiari',
  // Support page, "Connect with others": communities run by others (checked Nov 2026; sources in
  // docs/audits/sources/2026-11-05-communities/). The Inspire address is the one Bobby Jones CSF links to.
  bensFriends: 'https://chiarisupport.org/',
  bjcsfInspire: 'https://www.inspire.com/groups/chiari-syringomyelia/',
  asapSupport: 'https://asap.org/find-support/',
  femacpa: 'https://femacpa.com/quienes-somos',
  ctgov: 'https://clinicaltrials.gov',
  ctgovSearch: 'https://clinicaltrials.gov/search?cond=Chiari%20OR%20Syringomyelia&aggFilters=status:rec',
  ctgovStudy: 'https://clinicaltrials.gov/study/',
} as const;
