// Open Chiari offline helper (service worker). Lets the site work without a signal once it has been opened,
// for example in a hospital waiting room. Made at build time by astro.config.mjs from scripts/sw-template.js:
// FILES is every page and the files they need (not the downloads or the large realistic model, which are kept
// only once someone opens them). Everything stays on the visitor's device; nothing is sent anywhere.
// Pages: the newest version from the site when there's a connection, the saved copy when there isn't.
// The visitor counter (/api/) is never saved or answered from the device.
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = `openchiari-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('openchiari-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    // Pages: network first, so medical text is always the latest; the saved copy only when offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(url.pathname, response.clone()));
          return response;
        })
        .catch(() => caches.match(url.pathname).then((hit) => hit || caches.match(url.pathname.replace(/\/?$/, '/')) || caches.match('/'))),
    );
    return;
  }
  // Files (scripts, styles, fonts, pictures, the 3D models): the saved copy first; anything new is saved as it's used.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok && !url.pathname.startsWith('/downloads/') && !url.pathname.endsWith('.zip') && !url.pathname.endsWith('.pdf')) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
