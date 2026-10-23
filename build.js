/* HERMENEUS — costruzione.
   Produce: dist/hermeneus.html (file unico autonomo, caratteri incorporati)
            dist/sito/ (index.html, manifest.webmanifest, sw.js, icone, licenze) da pubblicare su qualunque hosting statico HTTPS.
   Uso: node build.js */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = __dirname;
const r = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// 1. Calcolo anticipato: token e argomenti delle frasi della banca (il browser non deve rianalizzarle)
require('./src/greek.js');
const E = require('./src/morph.js');
E.loadLexicon(require('./src/lexicon.js'));
const SN = require('./src/sentence.js');
const B = require('./src/bank.js');
const pack = (t) => (t.p ? [t.p] : [E.LEX.indexOf(t.a.e), t.a.key, t.a.f]);
const pre = {
  bank: B.BANK.map((b, i) => {
    const lx = SN.lexicalize(b[0]);
    if (!lx.ok) throw new Error(`frase ${i + 1} non verificata: ${b[0]}`);
    const { tags } = SN.sentenceReqs(lx.tokens, b[2].split(/\s+/));
    return { tok: lx.tokens.map(pack), tags: SN.ORDER.filter((t) => tags.has(t)) };
  }),
};

// 2. Caratteri incorporati (WOFF2 in base64), con gli stessi intervalli Unicode di Fontsource
const R_LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const R_GREEK = 'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF';
const R_GREEK_EXT = 'U+1F00-1FFF';
const FONTS = [
  ['Gentium Plus', 400, 'gentium-plus-greek-400-normal', R_GREEK], ['Gentium Plus', 400, 'gentium-plus-greek-ext-400-normal', R_GREEK_EXT], ['Gentium Plus', 400, 'gentium-plus-latin-400-normal', R_LATIN],
  ['Gentium Plus', 700, 'gentium-plus-greek-700-normal', R_GREEK], ['Gentium Plus', 700, 'gentium-plus-greek-ext-700-normal', R_GREEK_EXT], ['Gentium Plus', 700, 'gentium-plus-latin-700-normal', R_LATIN],
  ['GFS Didot', 400, 'gfs-didot-greek-400-normal', R_GREEK], ['GFS Didot', 400, 'gfs-didot-greek-ext-400-normal', R_GREEK_EXT], ['GFS Didot', 400, 'gfs-didot-latin-400-normal', R_LATIN],
  ['Fira Sans', 400, 'fira-sans-latin-400-normal', R_LATIN], ['Fira Sans', 500, 'fira-sans-latin-500-normal', R_LATIN], ['Fira Sans', 600, 'fira-sans-latin-600-normal', R_LATIN], ['Fira Sans', 700, 'fira-sans-latin-700-normal', R_LATIN],
];
const fontCSS = FONTS.map(([fam, w, file, range]) => {
  const b64 = fs.readFileSync(path.join(ROOT, 'fonts', file + '.woff2')).toString('base64');
  return `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${range}}`;
}).join('\n');

// 3. Script nell'ordine di dipendenza
const MODULES = ['src/greek.js', 'src/morph.js', 'src/lexicon.js', 'src/sentence.js', 'src/italian.js', 'src/semantic.js', 'src/generator.js', 'src/course.js', 'src/lessons.js', 'src/topics.js', 'src/bank.js'];
const code = MODULES.map((m) => `/* ---- ${m} ---- */\n` + r(m)).join('\n;\n') + `\n;window.HERM_PRE = ${JSON.stringify(pre)};\n;\n` + r('src/app.js');
const css = r('src/app.css');
const png = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets', f)).toString('base64');
const version = crypto.createHash('sha256').update(code + css + fontCSS).digest('hex').slice(0, 10);

function page(site) {
  const head = site
    ? `<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icons/favicon-32.png" sizes="32x32">\n<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">`
    : `<link rel="icon" href="${png('favicon-32.png')}" sizes="32x32">\n<link rel="apple-touch-icon" href="${png('apple-touch-icon.png')}">`;
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Hermeneus</title>
<meta name="description" content="Palestra di traduzione dal greco antico e verso il greco per il biennio del liceo classico: frasi sugli argomenti studiati, teoria, lessico, tutto offline e senza account.">
<meta name="theme-color" content="#F3EEE2">
<meta name="color-scheme" content="light dark">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Hermeneus">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
<meta name="generator" content="Hermeneus ${version}">
${head}
<style>
${fontCSS}
${css}
</style>
</head>
<body>
<a class="sr" href="#main">Vai al contenuto</a>
<div id="app" class="app"><noscript><p style="padding:20px">Hermeneus ha bisogno di JavaScript attivo nel browser.</p></noscript></div>
<script>window.HERM_SITE = ${site ? 'true' : 'false'};</script>
<script>
${code}
</script>
</body>
</html>
`;
}

const DIST = path.join(ROOT, 'dist');
const SITE = path.join(DIST, 'sito');
fs.mkdirSync(path.join(SITE, 'icons'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'hermeneus.html'), page(false));
fs.writeFileSync(path.join(SITE, 'index.html'), page(true));
for (const f of fs.readdirSync(path.join(ROOT, 'assets'))) fs.copyFileSync(path.join(ROOT, 'assets', f), path.join(SITE, 'icons', f));
fs.copyFileSync(path.join(ROOT, 'fonts', 'LICENZE-CARATTERI.txt'), path.join(SITE, 'LICENZE-CARATTERI.txt'));
fs.writeFileSync(path.join(SITE, 'manifest.webmanifest'), JSON.stringify({
  name: 'Hermeneus — Ἑρμηνεύς', short_name: 'Hermeneus', description: 'Palestra di traduzione greco-italiano per il biennio del liceo classico.',
  lang: 'it', dir: 'ltr', start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
  background_color: '#F3EEE2', theme_color: '#22508F', categories: ['education'],
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
fs.writeFileSync(path.join(SITE, 'sw.js'), `/* Hermeneus — service worker: tutto in cache per l'uso offline. Versione ${version}. */
const CACHE = 'hermeneus-${version}';
const ASSETS = ${JSON.stringify(ASSETS)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(caches.match('index.html').then((r) => r || fetch(req))); return; }
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
});
`);
fs.writeFileSync(path.join(SITE, 'LEGGIMI.txt'), `HERMENEUS — pacchetto per la pubblicazione (versione ${version})

Contenuto
  index.html             l'applicazione completa (caratteri incorporati)
  manifest.webmanifest   dati per l'installazione su telefono
  sw.js                  service worker: rende l'app utilizzabile senza rete
  icons/                 icone dell'app
  LICENZE-CARATTERI.txt  licenze SIL OFL 1.1 di Gentium Plus, GFS Didot, Fira Sans

Pubblicazione
  Carica l'intera cartella su un hosting statico con HTTPS (per esempio GitHub Pages,
  Netlify, Cloudflare Pages o lo spazio web della scuola). Non serve un server: niente
  database, niente account, nessun dato degli studenti lascia il dispositivo.
  L'installazione («Installa» / «Aggiungi alla schermata Home») richiede HTTPS.

Aggiornamenti
  Ricostruisci con «node build.js» e ricarica i file: il service worker cambia nome di cache
  a ogni versione e sostituisce la vecchia copia offline al primo accesso.
`);
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + ' KB';
console.log(`Hermeneus ${version}`);
console.log('  dist/hermeneus.html   ' + kb(path.join(DIST, 'hermeneus.html')));
console.log('  dist/sito/index.html  ' + kb(path.join(SITE, 'index.html')));
console.log('  frasi precalcolate: ' + pre.bank.length);
