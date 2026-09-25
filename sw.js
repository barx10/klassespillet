// Frakoblet bruk. Alle filene lagres ved installasjon. Deretter svarer appen
// alltid fra lageret og henter nye versjoner i bakgrunnen, så en ny versjon
// vises neste gang appen åpnes. Ingen versjonsnummer å huske ved publisering.

const LAGER = 'klassespillet';
const FILER = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/stil.css',
  'js/app.js',
  'js/diagram.js',
  'js/lager.js',
  'js/landskap.js',
  'js/logg.js',
  'js/okt.js',
  'js/regler.js',
  'js/veiledning.js',
  'fonts/atkinson-next-latin.woff2',
  'fonts/atkinson-next-latin-ext.woff2',
  'fonts/bricolage-latin.woff2',
  'fonts/bricolage-latin-ext.woff2',
  'ikoner/ikon.svg',
  'ikoner/ikon-180.png',
  'ikoner/ikon-192.png',
  'ikoner/ikon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(LAGER).then((c) => c.addAll(FILER)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Adressen med eller uten index.html er samme side.
  const nokkel = e.request.mode === 'navigate' ? './' : e.request;
  e.respondWith(caches.open(LAGER).then(async (c) => {
    const lagret = await c.match(nokkel, { ignoreSearch: true });
    const hent = fetch(e.request).then((svar) => {
      if (svar.ok) c.put(nokkel, svar.clone());
      return svar;
    });
    if (lagret) {
      e.waitUntil(hent.catch(() => {}));
      return lagret;
    }
    return hent;
  }));
});
