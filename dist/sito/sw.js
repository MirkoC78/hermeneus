/* Hermeneus — service worker: tutto in cache per l'uso offline. Versione de6a585e61.
   Le cache hanno un nome legato alla cartella di installazione: all'aggiornamento si cancellano solo
   le versioni precedenti di questa installazione, mai le cache di altre app (o di altre copie di Hermeneus)
   ospitate sullo stesso sito. */
const SCOPE = self.registration.scope;
const PREFIX = 'hermeneus@' + SCOPE + '@';
const CACHE = PREFIX + 'de6a585e61';
// nome usato dalle versioni precedenti, senza cartella: si riconosce come nostro se contiene la nostra pagina
const LEGACY = /^hermeneus-[0-9a-f]{10}$/;
const ASSETS = ["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png","icons/favicon-32.png"];
const ours = (k) => k !== CACHE && (k.startsWith(PREFIX) || (LEGACY.test(k) && caches.open(k).then((c) => c.match(new URL('index.html', SCOPE).href)).then((r) => !!r)));
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => Promise.resolve(ours(k)).then((old) => old && caches.delete(k))))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const cached = (r) => caches.open(CACHE).then((c) => c.match(r));
  if (req.mode === 'navigate') { e.respondWith(cached('index.html').then((r) => r || fetch(req))); return; }
  e.respondWith(cached(req).then((r) => r || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
});
