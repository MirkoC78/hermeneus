/* Test del service worker (HERM-004): con una CacheStorage simulata, installazione e attivazione
   cancellano solo le versioni precedenti di questa installazione; l'avvio senza rete usa la cache. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sito', 'sw.js'), 'utf8');
const errors = [];
let n = 0;
const ok = (what, cond) => { n++; if (!cond) errors.push(what); };

function Storage(base) {
  const stores = new Map();
  const abs = (u) => new URL(typeof u === 'string' ? u : u.url, base).href;
  const cache = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      match: async (r) => m.get(abs(r)),
      put: async (r, res) => { m.set(abs(r), res); },
      addAll: async (list) => { for (const u of list) m.set(abs(u), await sw.fetch(abs(u))); },
    };
  };
  const sw = {
    online: true,
    fetch: async (r) => { if (!sw.online) throw new Error('senza rete'); const u = abs(r); return { url: u, body: 'rete:' + u, clone() { return this; } }; },
    caches: {
      keys: async () => [...stores.keys()],
      open: async (name) => cache(name),
      delete: async (name) => stores.delete(name),
      match: async (r) => { for (const m of stores.values()) if (m.has(abs(r))) return m.get(abs(r)); },
    },
    seed: (name, url, body) => { cache(name); stores.get(name).set(abs(url), { body }); },
    names: () => [...stores.keys()],
  };
  return sw;
}
function boot(scope, env) {
  const on = {};
  const ctx = { URL, Promise, caches: env.caches, fetch: env.fetch, registration: { scope }, location: new URL(scope + 'sw.js'), clients: { claim: async () => {} }, skipWaiting: async () => {}, addEventListener: (t, f) => { on[t] = f; } };
  ctx.self = ctx;
  vm.runInNewContext(SRC, ctx);
  const fire = async (type, request) => { let p; on[type]({ request, waitUntil: (x) => { p = x; }, respondWith: (x) => { p = x; } }); return p && p; };
  return { fire, CACHE: vm.runInNewContext('CACHE', ctx) };
}

(async () => {
  const site = 'https://scuola.test/';
  const scope = site + 'hermeneus/';
  const env = Storage(scope + 'sw.js');
  // cache presenti prima dell'aggiornamento
  env.seed('unrelated-offline-probe', site + 'probe.txt', 'sentinella');
  env.seed('verto-v7', site + 'verto/index.html', 'verto');
  env.seed('hermeneus-aa9a5aa7e6', scope + 'index.html', 'vecchia versione di questa installazione');
  env.seed('hermeneus-bbbbbbbbbb', site + 'altra-classe/index.html', 'vecchia versione di un’altra installazione');
  env.seed('hermeneus@' + site + 'altra-classe/@0123456789', site + 'altra-classe/index.html', 'altra installazione');
  env.seed('hermeneus@' + scope + '@0000000000', scope + 'index.html', 'versione precedente');

  const w = boot(scope, env);
  ok('il nome della cache contiene la cartella', w.CACHE.startsWith('hermeneus@' + scope + '@'));
  await w.fire('install');
  await w.fire('activate');
  const names = env.names();
  for (const k of ['unrelated-offline-probe', 'verto-v7', 'hermeneus-bbbbbbbbbb', 'hermeneus@' + site + 'altra-classe/@0123456789']) ok(`resta la cache «${k}»`, names.includes(k));
  for (const k of ['hermeneus-aa9a5aa7e6', 'hermeneus@' + scope + '@0000000000']) ok(`si cancella la vecchia cache «${k}»`, !names.includes(k));
  ok('la cache nuova esiste', names.includes(w.CACHE));
  const probe = await env.caches.match(site + 'probe.txt');
  ok('la sentinella estranea è intatta', !!probe && probe.body === 'sentinella');

  // avvio senza rete: la pagina arriva dalla cache di questa installazione
  env.online = false;
  const page = await w.fire('fetch', { url: scope, mode: 'navigate', method: 'GET' });
  ok('offline: la pagina viene dalla cache', page && page.body === 'rete:' + scope + 'index.html');
  const icon = await w.fire('fetch', { url: scope + 'icons/icon-192.png', mode: 'no-cors', method: 'GET' });
  ok('offline: le icone vengono dalla cache', icon && icon.url === scope + 'icons/icon-192.png');

  // un secondo aggiornamento cancella la versione appena sostituita, e solo quella
  env.online = true;
  const before = w.CACHE;
  const SRC2 = SRC.replace(/const CACHE = PREFIX \+ '[0-9a-f]+';/, "const CACHE = PREFIX + 'ffffffffff';");
  ok('il test sa cambiare versione', SRC2 !== SRC);
  const on = {};
  const ctx = { URL, Promise, caches: env.caches, fetch: env.fetch, registration: { scope }, location: new URL(scope + 'sw.js'), clients: { claim: async () => {} }, skipWaiting: async () => {}, addEventListener: (t, f) => { on[t] = f; } };
  ctx.self = ctx;
  vm.runInNewContext(SRC2, ctx);
  let p; on.install({ waitUntil: (x) => { p = x; } }); await p;
  on.activate({ waitUntil: (x) => { p = x; } }); await p;
  const after = env.names();
  ok('aggiornamento: la versione sostituita sparisce', !after.includes(before));
  ok('aggiornamento: le cache estranee restano', ['unrelated-offline-probe', 'verto-v7', 'hermeneus-bbbbbbbbbb'].every((k) => after.includes(k)));

  console.log('\nTest del service worker');
  console.log(`  Verifiche: ${n}`);
  console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
  errors.forEach((e) => console.log('  ✗ ' + e));
  if (errors.length) process.exitCode = 1;
})();
