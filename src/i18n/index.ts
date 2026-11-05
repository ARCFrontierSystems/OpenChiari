import en from './en.json';

// Spanish (es.json) is added with the Spanish Home page in a later phase.
export type Strings = typeof en;
export type Locale = 'en';

export function getStrings(_locale: Locale = 'en'): Strings {
  return en;
}

// One place for every page address, so links stay consistent as pages are built.
export const routes = {
  home: '/',
  explorer: '/explorer/',
  explain: '/explain/',
  studies: '/studies/',
  prep: '/prep/',
  model: '/model/',
  support: '/support/',
  kit: '/kit/',
  impact: '/impact/',
  openSource: '/impact/#open-source',
  about: '/about/',
  privacy: '/privacy/',
  evidence: '/evidence/',
  es: '/es/',
  // The guided tour is Phase 4; until then it opens the Explorer (approved by Matthew).
  tour: '/explorer/',
} as const;

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
  ctgov: 'https://clinicaltrials.gov',
  ctgovSearch: 'https://clinicaltrials.gov/search?cond=Chiari%20OR%20Syringomyelia&aggFilters=status:rec',
  ctgovStudy: 'https://clinicaltrials.gov/study/',
} as const;
