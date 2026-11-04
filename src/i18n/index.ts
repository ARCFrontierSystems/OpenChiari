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
  es: '/es/',
  // The guided tour is Phase 4; until then it opens the Explorer (approved by Matthew).
  tour: '/explorer/',
} as const;

export const externalLinks = {
  ninds: 'https://www.ninds.nih.gov/publications/chiari-malformation',
  zAnatomy: 'https://github.com/Z-Anatomy/Models-of-human-anatomy',
} as const;
