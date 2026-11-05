// The text for scripts that run in the visitor's browser, in the page's language (<html lang>).
import en from './en.json';
import es from './es.json';
import { localePath as toPath } from './index';

export const lang: 'en' | 'es' = document.documentElement.lang === 'es' ? 'es' : 'en';
const table: typeof en = lang === 'es' ? es : en;
export default table;
/** A site address in this page's language. */
export const localePath = (path: string) => toPath(path, lang);
