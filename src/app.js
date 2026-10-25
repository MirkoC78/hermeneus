/* HERMENEUS — applicazione: percorso guidato a unità e lezioni, palestra, teoria, lessico, profilo.
   Tutto resta sul dispositivo: nessun account, nessun servizio esterno (il Wikizionario è un collegamento facoltativo). */
(function () {
'use strict';
const G = window.GreekOrtho, E = window.HermEngine, SN = window.HermSentence, LS = window.HermLessons, C = window.HERM_COURSE;
const { TOPICS, GROUPS } = window.HERM_TOPICS;
const B = window.HERM_BANK;
E.loadLexicon(window.HERM_LEX);
const TOPIC = Object.fromEntries(TOPICS.map((t, i) => [t.id, Object.assign({}, t, { n: i + 1 })]));
const ORDER = TOPICS.map((t) => t.id);
const UNITS = C.UNITS;
const FLAT = LS.FLAT;
const SITE = !!window.HERM_SITE;
const SV = window.HermSave;
const HC = window.HermCheck;

/* ---------- Utilità ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = (a) => [...new Set(a)];
const gr = (s, cls = '') => `<span class="gr ${cls}" lang="grc">${esc(s)}</span>`;
function dayKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function addDays(k, n) { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n)); }
function daysBetween(a, b) { const [y1, m1, d1] = a.split('-').map(Number); const [y2, m2, d2] = b.split('-').map(Number); return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 864e5); }

/* ---------- Icone ---------- */
const svg = (d, o = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${o}>${d}</svg>`;
const I = {
  road: svg('<path d="M9 3 6 21M15 3l3 18M12 4v2.5M12 10v3M12 17v3"/>'),
  gym: svg('<path d="M4 20h16M6 20V9M10 20V9M14 20V9M18 20V9M3 9l9-5 9 5z"/>'),
  books: svg('<path d="M5 4h4v16H5zM10 4h4v16h-4z"/><path d="m15.5 5 3.6-.9 2.4 15.5-3.6.9z"/>'),
  words: svg('<rect x="4" y="5" width="12" height="15" rx="2"/><path d="M8 3h11a1 1 0 0 1 1 1v14"/><path d="M7.5 10h5M7.5 13.5h5"/>'),
  me: svg('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1-3.7 3.7-5.6 7-5.6s6 1.9 7 5.6"/>'),
  flame: svg('<path d="M12.5 3c.4 2.8-1.1 4.4-2.5 6S7 12 7 14.8C7 18.2 9.3 21 12.3 21c3.3 0 5.7-2.6 5.7-6.1 0-2.5-1.3-4.4-2.6-5.6.1 1.6-.5 2.9-1.6 3.5.4-3.4-.4-6.6-1.3-8.8Z" fill="currentColor" stroke="none"/>'),
  bolt: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>'),
  star: svg('<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" fill="currentColor" stroke="none"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  book: svg('<path d="M4 5.5C7 4.5 10 4.5 12 6.5c2-2 5-2 8-1V19c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6.5V20"/>'),
  dumbbell: svg('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'),
  laurel: svg('<path d="M12 21v-6M8 21h8"/><path d="M12 15c-4 0-6.5-3-6.5-7M12 15c4 0 6.5-3 6.5-7"/><path d="M5.5 8c1.5.2 2.6 1 3 2.4M18.5 8c-1.5.2-2.6 1-3 2.4M6.5 4.5c1.2.6 1.8 1.6 1.8 3M17.5 4.5c-1.2.6-1.8 1.6-1.8 3"/>'),
  trophy: svg('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4v3h-4z"/>'),
  check2: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  play: svg('<path d="M7 5v14l11-7z" fill="currentColor" stroke="none"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.4"'),
  back: svg('<path d="M15 6 9 12l6 6"/>'),
  chev: svg('<path d="m9 6 6 6-6 6"/>', 'class="chev"'),
  translate: svg('<path d="M4 6h8M8 4v2c0 4-1.8 6.6-4.5 8"/><path d="M5.8 9.5c1 2.2 2.7 3.6 5 4.2"/><path d="m13 20 4-9 4 9M14.5 17h5"/>'),
  pen: svg('<path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M14 6.5l3 3"/>'),
  lens: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/>'),
  table: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>'),
  cards: svg('<rect x="6" y="3.5" width="13" height="16" rx="2" transform="rotate(8 12 12)"/><rect x="4" y="5" width="13" height="16" rx="2"/>'),
  retry: svg('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>'),
  alpha: svg('<path d="M5 18c4 0 5-12 9-12 2 0 2.5 2 2.5 4M13.5 12c.7 3 2 6 5.5 6"/>'),
  spark: svg('<path d="M12 3c.5 4.6 2.4 6.9 7 7.5-4.6.6-6.5 2.9-7 7.5-.5-4.6-2.4-6.9-7-7.5 4.6-.6 6.5-2.9 7-7.5Z"/>'),
  sound: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  keys: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10"/>'),
  tiles: svg('<rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/>'),
  bulb: svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>'),
  method: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>'),
  link: svg('<path d="M9 7H6a3 3 0 0 0 0 6h3M15 7h3a3 3 0 0 1 0 6h-3M8 10h8"/>'),
  install: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5Z"/>'),
  share: svg('<path d="M12 15V4M8 7.5 12 4l4 3.5"/><path d="M6 11v8h12v-8"/>'),
  plus: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>'),
  accent: svg('<path d="M10 4 7 9"/><path d="M5 20c2-6 4-9 7-9s5 3 7 9"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  match: svg('<path d="M4 7h6M4 12h6M4 17h6M14 7h6M14 12h6M14 17h6"/>'),
};
const MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect x="1" y="1" width="62" height="62" rx="18" fill="#7C5CFF"/><text x="33" y="45" text-anchor="middle" font-family="GFS Didot, Gentium Plus, serif" font-size="36" fill="#FFFFFF">Ἑ</text></svg>';

/* ---------- Ermes, la guida ---------- */
// Hermes, dio dei messaggeri e degli interpreti, in versione da cartone: elmo alato, riccioli, tunica e mantello,
// caduceo e sandali alati. Umori: idle, happy, think, sad, cheer
let ermesN = 0;
function ermes(mood = 'idle', size = 96) {
  const O = '#2B2440', SK = '#FFD2AE', SK2 = '#F2B48C', HAIR = '#5B3A2E', GOLD = '#FFC233', GOLD2 = '#E09A12', W = '#FFFFFF', W2 = '#E4DDFF', CAPE = '#7C5CFF', CAPE2 = '#5B3FD6', SNAKE = '#2DB57E';
  const st = (w = 2.2) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const ln = (d, w = 2.4, col = O) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // braccio: contorno scuro e pelle sopra, così resta leggibile anche piccolo
  const arm = (d) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="9.4" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${SK}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const eye = (x, y, rx = 4.4, ry = 5.6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${O}"/><circle cx="${x + 1.5}" cy="${y - 2}" r="1.7" fill="${W}"/><circle cx="${x - 1.3}" cy="${y + 1.8}" r=".8" fill="${W}"/>`;
  const face = {
    idle: eye(49, 58) + eye(71, 58) + ln('M44.5 50.4q4.5-2.4 9 0M66.5 50.4q4.5-2.4 9 0', 2) + ln('M54.5 68.6q5.5 4 11 0'),
    happy: ln('M44.5 59q4.5-5.4 9 0M66.5 59q4.5-5.4 9 0', 2.8) + ln('M44.5 49.6q4.5-2.6 9 0M66.5 49.6q4.5-2.6 9 0', 2) + `<path d="M52.8 66.8q7.2 8.6 14.4 0z" fill="#7A2E45" ${st(1.6)}/><path d="M56 70.6q4 2.2 8 0" fill="none" stroke="#FF8FAB" stroke-width="2.2" stroke-linecap="round"/>`,
    cheer: ln('M44 59.4q5-6.2 10 0M66 59.4q5-6.2 10 0', 3) + ln('M44 48.2q5-3.4 10 0M66 48.2q5-3.4 10 0', 2) + `<path d="M51.4 65.8q8.6 11.4 17.2 0z" fill="#7A2E45" ${st(1.6)}/><path d="M55.4 71.4q4.6 2.8 9.2 0" fill="none" stroke="#FF8FAB" stroke-width="2.6" stroke-linecap="round"/>`,
    think: eye(50.5, 57, 4, 5.2) + eye(72.5, 57, 4, 5.2) + ln('M45 51q4.4-1.4 8.8.4M66.6 48.2q4.8-3.2 9.4.4', 2) + ln('M56 69.4l8.6-1.6'),
    sad: eye(49, 59.4, 4, 5) + eye(71, 59.4, 4, 5) + ln('M44.6 53.4l8.6-3M75.4 53.4l-8.6-3', 2) + ln('M54.6 71q5.4-3.8 10.8 0'),
  }[mood] || '';
  // posa del braccio libero (a sinistra di chi guarda); l'altro tiene il caduceo
  const freeArm = { happy: 'M44 82C37 80 32 76 29.4 71', cheer: 'M44 81C36 77 30 71 26.6 63.4', think: 'M45 82C47 79 50 76 53 73.6', sad: 'M44 82C41 88 39 93 39 98', idle: 'M44 82C40 87 38 92 38 97' }[mood] || 'M44 82C40 87 38 92 38 97';
  const hand = { happy: [28.6, 69.4], cheer: [26, 61.6], think: [54, 72.6], sad: [39, 99.6], idle: [38, 98.6] }[mood] || [38, 98.6];
  const id = 'ermes' + (++ermesN);
  const cls = mood === 'cheer' ? 'cheer' : 'bob';
  const wing = 'M34 39C26 31 16 25 5 23c6 4.6 9.4 7.6 11.4 10.6C10.4 32.6 6.6 33.8 3.6 36.2c7.2 1.4 12.6 2.2 16.6 3-5 1.2-8.6 3.4-10.6 6.2 8-.8 16.4-2.8 24.4-2.8z';
  const feathers = 'M27 32.6l-9.6-3.6M27.4 37.4l-11-1.4M27.6 41.4l-9.4 1.6';
  const sandal = (x) => `<path d="M${x - 6} 114.6h12c0-2.6-2.4-4-6-4s-6 1.4-6 4z" fill="${HAIR}" ${st(1.6)}/><path d="M${x - 5} 109c-3.4-1.6-6.4-1.6-8.4 0 2 .8 3.4 1.6 4 2.6-1.8 0-3 .6-3.8 1.6 2.8.4 5.4.2 8.2-.6z" fill="${W}" ${st(1.2)}/>`;
  return `<svg class="ermes ${cls}" width="${size}" height="${size}" viewBox="${size <= 64 ? '20 10 80 80' : '0 0 120 120'}" role="img" aria-label="Ermes, la tua guida">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD866"/><stop offset="1" stop-color="${GOLD}"/></linearGradient></defs>
    <ellipse cx="60" cy="116.4" rx="24" ry="3.2" fill="${O}" opacity=".12"/>
    <g class="figure">
      <path d="M43 80C33 88 29 99 31 110l14-3z" fill="${CAPE}" ${st()}/>
      <path d="M50 104v8M70 104v8" stroke="${O}" stroke-width="8.6" stroke-linecap="round"/><path d="M50 104v8M70 104v8" stroke="${SK}" stroke-width="4.6" stroke-linecap="round"/>
      ${sandal(50)}${sandal(70).replace(/M65 109c-3.4-1.6-6.4-1.6-8.4 0 2 .8 3.4 1.6 4 2.6-1.8 0-3 .6-3.8 1.6 2.8.4 5.4.2 8.2-.6z/, 'M75 109c3.4-1.6 6.4-1.6 8.4 0-2 .8-3.4 1.6-4 2.6 1.8 0 3 .6 3.8 1.6-2.8.4-5.4.2-8.2-.6z')}
      <path d="M45 77C42 87 40 97 39 106h42c-1-9-3-19-6-29z" fill="${W}" ${st()}/>
      <path d="M47 90c4 6 3 12 2 16M73 90c-4 6-3 12-2 16M60 92v14" fill="none" stroke="${W2}" stroke-width="2" stroke-linecap="round"/>
      <path d="M41.4 89.6h37.2l.8 5.2H40.6z" fill="${GOLD}" ${st(1.8)}/>
      <path d="M72 76.4l7.4 3.4-25 23.4-6.8-3.6z" fill="${CAPE}" ${st(1.8)}/>
      <circle cx="74.6" cy="79" r="3" fill="${GOLD}" ${st(1.4)}/>
      ${arm(freeArm)}<circle cx="${hand[0]}" cy="${hand[1]}" r="4.6" fill="${SK}" ${st(1.8)}/>
      <g class="caduceus">
        <path d="M90 62v52" stroke="${O}" stroke-width="5.6" stroke-linecap="round"/><path d="M90 62v52" stroke="${GOLD}" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M84 70.6c11 3.4 11 7.8 0 11.2s-11 7.8 0 11.2M96 70.6c-11 3.4-11 7.8 0 11.2s11 7.8 0 11.2" fill="none" stroke="${O}" stroke-width="4.6" stroke-linecap="round"/>
        <path d="M84 70.6c11 3.4 11 7.8 0 11.2s-11 7.8 0 11.2M96 70.6c-11 3.4-11 7.8 0 11.2s11 7.8 0 11.2" fill="none" stroke="${SNAKE}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M89 63c-4-4-9-5-13-3.4 3 1.4 5 2.6 6 4-3 0-4.6 1-5.6 2.4 4.4.4 8.6-.4 12.6-2.2zM91 63c4-4 9-5 13-3.4-3 1.4-5 2.6-6 4 3 0 4.6 1 5.6 2.4-4.4.4-8.6-.4-12.6-2.2z" fill="${W}" ${st(1.4)}/>
        <circle cx="90" cy="59.6" r="3.6" fill="${GOLD}" ${st(1.6)}/>
      </g>
      ${arm('M75 82C80 86 83 88 86.6 89')}<circle cx="88.4" cy="89.2" r="4.6" fill="${SK}" ${st(1.8)}/>
      <path d="M53 73h14v6H53z" fill="${SK2}"/>
      <ellipse cx="33.4" cy="58" rx="4.2" ry="5.4" fill="${SK}" ${st(1.8)}/><ellipse cx="86.6" cy="58" rx="4.2" ry="5.4" fill="${SK}" ${st(1.8)}/>
      <circle cx="60" cy="54" r="27" fill="${SK}" ${st()}/>
      <path d="M34.4 51c-1.6 4-1 8.4 1.4 11.2 1-3.4 1.2-6.8.4-10.2M85.6 51c1.6 4 1 8.4-1.4 11.2-1-3.4-1.2-6.8-.4-10.2" fill="${HAIR}" ${st(1.4)}/>
      <path d="M34 45c8-3.4 44-3.4 52 0v3c-2.6 4.4-6.4 4.4-8.6 0-2.6 4.4-6.4 4.4-8.6 0-2.6 4.4-6.4 4.4-8.6 0-2.6 4.4-6.4 4.4-8.6 0-2.6 4.4-6.4 4.4-8.6 0-2.6 4.4-6.6 4.4-9 0z" fill="${HAIR}" ${st(1.6)}/>
      <circle cx="42.4" cy="65.6" r="4.4" fill="#FF8FAB" opacity=".5"/><circle cx="77.6" cy="65.6" r="4.4" fill="#FF8FAB" opacity=".5"/>
      ${ln('M60.6 61.4q-1.8 3.4.4 4.6', 1.8)}
      ${face}
      <g class="wing l">${`<path d="${wing}" fill="${W}" ${st(1.8)}/>`}${ln(feathers, 1.5, '#9B82FF')}</g>
      <g transform="translate(120 0) scale(-1 1)"><g class="wing l"><path d="${wing}" fill="${W}" ${st(1.8)}/>${ln(feathers, 1.5, '#9B82FF')}</g></g>
      <path d="M33 45.4C33.6 29 45 19.6 60 19.6S86.4 29 87 45.4C79 41.4 70 39.6 60 39.6s-19 1.8-27 5.8z" fill="url(#${id})" ${st()}/>
      <path d="M33 45.4c8-4 17-5.8 27-5.8s19 1.8 27 5.8l.4 4.2c-8.2-3.8-17.4-5.4-27.4-5.4s-19.2 1.6-27.4 5.4z" fill="${GOLD2}" ${st(1.8)}/>
      <path d="M48 27.6c3.4-2.6 7.4-3.6 11-3.6" fill="none" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>`;
}
const say = (text, mood = 'happy', size = 76) => `<div class="say">${ermes(mood, size)}<div class="bubble">${text}</div></div>`;

/* ---------- Stato ---------- */
const KEY = 'hermeneus.v1';
const ST = window.HermState;
const DEFAULT = ST.defaults;
// copie originali dei salvataggi che è stato necessario riparare (le ultime tre)
const ORIGINALS = KEY + '.originali';
let S = DEFAULT();
const stateCtx = () => ({ lessonIds: LESSON_IDS(), lexCount: E.LEX.length });
function originals() { try { return JSON.parse(localStorage.getItem(ORIGINALS) || '[]'); } catch (e) { return []; } }
function keepOriginal(raw, problems) {
  try { localStorage.setItem(ORIGINALS, JSON.stringify(originals().concat([{ at: Date.now(), problems, raw }]).slice(-3))); } catch (e) { /* ignora */ }
}
// dalla versione 1: gli argomenti scelti diventano unità aperte del percorso
function migrate() {
  if (S.v !== 2 && S.onboarded) placeAt(ORDER.filter((t) => S.topics.includes(t)).pop() || null);
  S.v = 2;
  syncTopics();
}
// un salvataggio guasto non blocca l'avvio: i campi sbagliati tornano ai valori iniziali e l'originale si conserva
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { return; } // archiviazione non disponibile
  if (!raw) return;
  let d = null;
  try { d = JSON.parse(raw); } catch (e) { /* illeggibile: lo dice il controllo */ }
  const r = ST.check(d, stateCtx());
  if (r.problems.length) {
    keepOriginal(raw, r.problems);
    toastLater(r.fatal ? 'Il salvataggio non si poteva leggere: ne ho conservato una copia (vedi Profilo).' : 'Il salvataggio aveva dati guasti: li ho riparati e ho conservato la copia originale (vedi Profilo).');
  }
  if (r.fatal) return;
  S = r.state;
  migrate();
  if (r.problems.length) save();
}
let saveFailed = false;
function save() { try { S.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); saveFailed = false; } catch (e) { saveFailed = true; } }
function applyTheme() {
  const r = document.documentElement;
  if (S.settings.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.settings.theme);
  const dark = S.settings.theme === 'dark' || (S.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]');
  if (m) m.content = dark ? '#1E1A2B' : '#FFFFFF';
}

/* ---------- Percorso: sblocchi ---------- */
function unitIdx(id) { return UNITS.findIndex((u) => u.id === id); }
function firstLessonIdx(ui) { return FLAT.findIndex((f) => f.ui === ui); }
function lastLessonIdx(ui) { return FLAT.map((f) => f.ui).lastIndexOf(ui); }
// colloca lo studente: le unità fino a quella indicata sono aperte, si riparte dalla successiva
function placeAt(unitId) {
  const ui = unitId ? unitIdx(unitId) : -1;
  S.course.unlocked = ui < 0 ? 0 : Math.min(FLAT.length - 1, lastLessonIdx(ui) + 1);
  syncTopics();
}
function syncTopics() {
  const lastUi = FLAT[Math.min(S.course.unlocked, FLAT.length - 1)].ui;
  S.topics = UNITS.slice(0, lastUi + 1).map((u) => u.id);
}
const isUnlocked = (idx) => idx <= S.course.unlocked;
const currentIdx = () => Math.min(S.course.unlocked, FLAT.length - 1);
const sel = () => new Set(S.topics);

/* ---------- Token ---------- */
function resolveTok(t) {
  if (!Array.isArray(t)) return t;
  if (t.length === 1) return { p: t[0] };
  const e = E.LEX[t[0]];
  let a = e && e.forms.find((x) => x.key === t[1] && x.f === t[2]);
  if (!a && e && t[1] === 'lemma') a = { e, f: t[2], key: 'lemma', d: 'forma di citazione', req: [e.topic] };
  if (!a) return null;
  return SN.tok(a);
}
const packTok = (t) => (t.p ? [t.p] : [E.LEX.indexOf(t.a.e), t.a.key, t.a.f]);
const PRE = window.HERM_PRE || null;
const BANK = B.BANK.map((b, i) => {
  const declared = b[2].split(/\s+/);
  return { id: 'b' + i, gr: b[0], it: b[1].split('|'), tags: PRE ? PRE.bank[i].tags : declared, focus: declared.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tip: b[3] || '', src: 'bank', _tok: PRE ? PRE.bank[i].tok : null };
});
function tokensOf(s) {
  if (s.tokens) return s.tokens;
  if (s._tok) s.tokens = s._tok.map(resolveTok);
  if (!s.tokens || s.tokens.some((t) => !t)) { const lx = SN.lexicalize(s.gr); s.tokens = lx.tokens || []; }
  return s.tokens;
}
LS.init({ bank: BANK, tokensOf });
function sentById(id) {
  if (id[0] === 'b') return BANK[+id.slice(1)] || null;
  const g = (S.genSaved || []).find((x) => x.id === id);
  return g ? Object.assign({}, g, { tokens: g.tok.map(resolveTok) }) : null;
}

/* ---------- Progressi ---------- */
const RANKS = B.RANKS;
function todayXP() { return S.days[dayKey()] || 0; }
function effectiveStreak() {
  if (!S.lastDay) return 0;
  const gap = daysBetween(S.lastDay, dayKey());
  if (gap <= 1) return S.streak;
  return gap - 1 <= S.shields ? S.streak : 0;
}
function touchStreak() {
  const today = dayKey();
  if (S.lastDay === today) return false;
  const gap = S.lastDay ? daysBetween(S.lastDay, today) : 99;
  if (gap === 1) S.streak++;
  else if (gap > 1 && gap - 1 <= S.shields) { S.shields -= gap - 1; S.streak++; toastLater(`Uno scudo ha protetto la tua serie (${gap - 1} giorno saltato).`); }
  else S.streak = 1;
  S.lastDay = today;
  if (S.streak > 0 && S.streak % 7 === 0 && S.shields < 2) { S.shields++; toastLater('Nuovo scudo: protegge la serie se salti un giorno.'); }
  return true;
}
function addXP(n) { const before = rankOf(S.xp).i; S.xp += n; const k = dayKey(); S.days[k] = (S.days[k] || 0) + n; return rankOf(S.xp).i > before; }
function rankOf(xp) { let i = 0; RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; }); return { i, r: RANKS[i], next: RANKS[i + 1] || null }; }
function recordMastery(t, ok) {
  if (!t) return;
  const m = S.mastery[t] || { a: 0, c: 0 };
  m.a++; if (ok) m.c++;
  if (m.a > 40) { m.a = Math.round(m.a * 0.8); m.c = Math.round(m.c * 0.8); }
  S.mastery[t] = m;
}
const doneUnits = () => UNITS.filter((u, ui) => (S.course.stars[FLAT[lastLessonIdx(ui)].lesson.id] || 0) > 0).length;
const BADGES = [
  { id: 'primo', name: 'Πρῶτον βῆμα', desc: 'Completa la prima lezione.', test: () => S.stats.lessons >= 1 || S.stats.sessions >= 1 },
  { id: 'unita', name: 'Ἡ πρώτη στάσις', desc: 'Supera la prova di un’unità.', test: () => doneUnits() >= 1 },
  { id: 'meta', name: 'Μέση ὁδός', desc: 'Supera le prove di 11 unità.', test: () => doneUnits() >= 11 },
  { id: 'finale', name: 'Τέλος', desc: 'Completa tutto il percorso.', test: () => doneUnits() >= UNITS.length },
  { id: 'sette', name: 'Ἑπτὰ ἡμέραι', desc: 'Una serie di 7 giorni.', test: () => S.streak >= 7 },
  { id: 'trenta', name: 'Τριάκοντα ἡμέραι', desc: 'Una serie di 30 giorni.', test: () => S.streak >= 30 },
  { id: 'perfetto', name: 'Ἄνευ ἁμαρτίας', desc: 'Una lezione senza errori.', test: () => S.stats.perfect >= 1 },
  { id: 'cento', name: 'Ἑκατόν', desc: '100 risposte corrette.', test: () => S.stats.correct >= 100 },
  { id: 'cinquecento', name: 'Πεντακόσια', desc: '500 risposte corrette.', test: () => S.stats.correct >= 500 },
  { id: 'interprete', name: 'Ἑρμηνεύς', desc: '100 frasi tradotte bene.', test: () => S.stats.translated >= 100 },
  { id: 'grammatico', name: 'Γραμματικός', desc: '50 forme analizzate o scritte bene.', test: () => S.stats.forms >= 50 },
  { id: 'accenti', name: 'Ὀρθὴ γραφή', desc: '20 risposte in greco con tutti gli accenti giusti.', test: () => S.stats.accentOK >= 20 },
  { id: 'lessico', name: 'Λεξικογράφος', desc: '50 parole imparate nel lessico.', test: () => Object.values(S.vocab).filter((v) => v.box >= 3).length >= 50 },
  { id: 'nuove', name: 'Καινοὶ λόγοι', desc: 'Traduci 10 frasi create sul momento.', test: () => S.stats.genSeen >= 10 },
  { id: 'ripasso', name: 'Ἐπανόρθωσις', desc: 'Svuota il ripasso degli errori.', test: () => S.stats.clearedReview >= 1 },
  { id: 'civetta', name: 'Γλαῦξ', desc: 'Studia dopo le 22.', test: () => false },
  { id: 'aurora', name: 'Ἠώς', desc: 'Studia prima delle 8.', test: () => false },
  { id: 'stratego', name: 'Στρατηγός', desc: 'Raggiungi il grado di stratego.', test: () => S.xp >= 5500 },
];
function checkBadges(extra = {}) {
  const won = [];
  for (const b of BADGES) if (!S.badges[b.id] && (b.test() || extra[b.id])) { S.badges[b.id] = dayKey(); won.push(b); }
  return won;
}

/* ---------- Suoni, vibrazione, voce, avvisi ---------- */
let actx = null;
function tone(freqs, dur = 0.12, type = 'sine', gain = 0.05) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    let t = actx.currentTime;
    for (const f of freqs) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = gain;
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur); t += dur * 0.8;
    }
  } catch (e) { /* audio non disponibile */ }
}
const sfx = { ok: () => tone([660, 880]), err: () => tone([220, 180], 0.16, 'triangle'), done: () => tone([523, 659, 784, 1046], 0.14), tap: () => tone([440], 0.04, 'sine', 0.02), match: () => tone([740], 0.07) };
// la vibrazione è permessa solo durante un tocco reale dell'utente (e non dentro i riquadri incorporati)
function buzz(p) { try { if (navigator.vibrate && window.top === window && (!navigator.userActivation || navigator.userActivation.isActive)) navigator.vibrate(p); } catch (e) { /* ignora */ } }
let itVoice = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices(); itVoice = vs.find((v) => /^it(-|_)IT/i.test(v.lang)) || vs.find((v) => /^it/i.test(v.lang)) || null; } catch (e) { itVoice = null; } }
function speak(greek) {
  if (!S.settings.voice || !('speechSynthesis' in window)) { toast('La lettura ad alta voce non è disponibile su questo dispositivo.'); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(G.erasmianIt(greek));
    u.lang = 'it-IT'; u.rate = 0.82;
    if (!itVoice) pickVoice();
    if (itVoice) u.voice = itVoice;
    speechSynthesis.speak(u);
  } catch (e) { toast('La lettura ad alta voce non è disponibile.'); }
}
let toastTimer = null;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}
const pendingToasts = [];
function toastLater(m) { pendingToasts.push(m); }
function flushToasts() { if (pendingToasts.length) { toast(pendingToasts.shift()); if (pendingToasts.length) setTimeout(flushToasts, 3400); } }
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:95';
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 4000);
  const dpr = window.devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const cols = ['#7C5CFF', '#FFC233', '#2DB57E', '#3D8EF0', '#FF8FAB', '#F08A24'];
  const P = Array.from({ length: 110 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 160, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 10 - 3, r: Math.random() * 6 + 3, c: pick(cols), a: Math.random() * 6 }));
  let f = 0;
  (function step() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) { p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.a += 0.15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
    if (++f < 120) requestAnimationFrame(step); else c.remove();
  })();
}

/* ---------- Esercizi ---------- */
const XP_BASE = { gr_it: 12, it_gr: 14, analizza: 8, scrivi: 10, completa: 8, lessico: 6, alfabeto: 5, abbina: 10, accorda: 7, lettera: 4, accento: 5, teach: 0 };
const KIND = {
  gr_it: [I.translate, 'Traduci in italiano'], it_gr: [I.pen, 'Traduci in greco'], analizza: [I.lens, 'Che forma è?'],
  scrivi: [I.table, 'Scrivi la forma'], completa: [I.tiles, 'Completa la frase'], lessico: [I.cards, 'Lessico'], alfabeto: [I.alpha, 'Leggi la parola'],
  abbina: [I.match, 'Abbina le coppie'], accorda: [I.link, 'Concorda'], lettera: [I.alpha, 'Le lettere'], accento: [I.accent, 'L’accento'], teach: [I.book, 'Impara'],
};
const CHOICE = ['analizza', 'completa', 'lessico', 'alfabeto', 'accorda', 'lettera', 'accento'];
function focusOfReq(req) { return req.slice().sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0]; }
function formsUsable(e, T) { return e.forms.filter((f) => f.key !== 'lemma' && f.req.every((q) => T.has(q))); }
// ricostruisce un esercizio su lettere, accenti, lettura o concordanza salvato fra gli errori
function reviewItem(m) {
  const d = m.d, options = shuffle(d.options.slice());
  if (m.t === 'lettera') return { type: 'lettera', reverse: !!d.reverse, prompt: d.prompt, right: d.right, options, topic: 'alf' };
  if (m.t === 'accento') return { type: 'accento', word: d.word, right: d.right, options, topic: 'alf' };
  if (m.t === 'alfabeto') { const e = E.LEX[d.e]; return e ? { type: 'alfabeto', e, word: d.word, right: d.right, options, topic: 'alf' } : null; }
  if (m.t === 'accorda') {
    const e = E.LEX[d.e], n = E.LEX[d.n];
    const noun = n && n.forms.find((f) => f.key === d.nk && f.f === d.nf);
    return e && noun ? { type: 'accorda', mode: d.mode, noun, art: d.art, e, answer: d.answer, options, topic: d.mode === 'adj' ? 'agg1' : n.topic } : null;
  }
  return null;
}
function buildReview() {
  const T = sel();
  const items = [];
  for (const m of S.mistakes.slice(-12)) {
    let it = null;
    if (m.k === 's') { const s = sentById(m.id); if (s) it = { type: m.dir, s, topic: s.focus }; }
    else if (m.k === 'f') {
      const e = E.LEX[m.e];
      const f = e && e.forms.find((x) => x.key === m.key);
      if (e && f) {
        if (m.t === 'scrivi') it = { type: 'scrivi', e, desc: f.d, answers: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.f)), topic: focusOfReq(f.req), key: f.key };
        else {
          const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));
          const dis = shuffle(uniq(formsUsable(e, T).map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 3);
          if (dis.length >= 2) it = { type: 'analizza', e, form: f.f, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: focusOfReq(f.req), key: f.key };
        }
      }
    } else if (m.k === 'l') {
      const e = E.LEX[m.e];
      const pool = e ? E.LEX.filter((x) => x.k === e.k && x !== e && x.m !== e.m && T.has(x.topic)) : [];
      if (e && pool.length >= 3) it = { type: 'lessico', e, options: shuffle([e, ...shuffle(pool).slice(0, 3)]), topic: e.topic };
    }
    else if (m.k === 'x') it = reviewItem(m);
    if (it) { it.review = m; items.push(it); }
  }
  return shuffle(items);
}

/* ---------- Sessione (lezione o palestra) ---------- */
let SES = null;
function startLesson(idx, o = {}) {
  const f = FLAT[idx];
  if (!f) return;
  const teach = o.teach ?? !S.course.times[f.lesson.id];
  let items = LS.buildLesson(f.lesson.id, { teach, avoid: S.recent.slice(-20) });
  // all'inizio di un'unità nuova Ermes la presenta
  if (teach && f.li === 0 && f.unit.say) items = [{ type: 'teach', card: { say: f.unit.say, intro: true }, topic: f.unit.id }].concat(items);
  begin({ kind: 'lesson', idx, items, title: f.lesson.title, test: !!f.lesson.test });
}
// difficoltà delle frasi in palestra: lunghezza, tessere intruse, risposta scritta
const LEVELS = {
  facile: { label: 'Facile', desc: 'Frasi brevi, fino a 4 parole, con una sola tessera in più.', maxWords: 4, simple: true, extra: 1 },
  media: { label: 'Media', desc: 'Frasi da 3 a 6 parole, con tre tessere in più per confonderti.', minWords: 3, maxWords: 6, extra: 3 },
  difficile: { label: 'Difficile', desc: 'Frasi lunghe, da 5 parole in su, con cinque tessere in più.', minWords: 5, extra: 5 },
  esperto: { label: 'Esperto', desc: 'Frasi lunghe da scrivere da te, con la tastiera greca: niente tessere.', minWords: 6, typed: true },
};
const levelOf = () => (SES && SES.kind === 'practice' && LEVELS[SES.level]) || null;
const MIXES = {
  misto: ['frase', 'analizza', 'frase', 'abbina', 'frase', 'scrivi', 'frase', 'completa', 'frase', 'accorda'],
  frasi: Array(10).fill('frase'),
  forme: ['analizza', 'scrivi', 'accorda', 'analizza', 'scrivi', 'completa', 'analizza', 'scrivi', 'accorda', 'analizza'],
  parole: ['abbina', 'lessico', 'abbina', 'lessico', 'abbina', 'lessico', 'lessico', 'abbina'],
  gr_it: Array(10).fill('gr_it'), it_gr: Array(10).fill('it_gr'),
  nuove: ['gr_it', 'it_gr', 'gr_it', 'completa', 'it_gr', 'gr_it', 'it_gr', 'gr_it'],
  alfabeto: ['alfabeto', 'lettera', 'accento', 'alfabeto', 'lettera', 'accento', 'alfabeto', 'alfabeto'],
};
function startPractice(mode) {
  const T = sel();
  if (!T.size) return;
  let items;
  if (mode === 'review') items = buildReview();
  else {
    const p = S.prac;
    // le traduzioni lavorano su tutto ciò che è aperto, con l'accento sull'ultima unità; il resto sull'argomento scelto
    const latest = S.topics[S.topics.length - 1];
    const unit = mode === 'alfabeto' ? 'alf' : ['gr_it', 'it_gr', 'nuove'].includes(mode) ? latest : p.unit && T.has(p.unit) ? p.unit : latest;
    items = LS.buildPractice({ T, focus: unit, mix: MIXES[mode] || MIXES[p.type] || MIXES.misto, wide: p.wide, vocab: vocabReached(), reached: reachedLessons(), genShare: mode === 'nuove' ? 1 : 0.5, gen: S.settings.gen, avoid: S.recent, level: mode === 'alfabeto' ? null : LEVELS[p.level] });
  }
  if (!items.length) { toast(mode === 'review' ? 'Nessun errore da ripassare: ottimo!' : 'Non ci sono ancora esercizi per questa scelta.'); return; }
  begin({ kind: 'practice', mode, items, title: 'Palestra', level: mode === 'review' ? null : S.prac.level });
}
function begin(o) {
  SES = Object.assign({ backY: window.scrollY, backView: VIEW, i: 0, combo: 0, best: 0, xp: 0, ok: 0, ko: 0, start: Date.now(), cur: null, done: false, requeued: 0, shownTheory: {} }, o);
  openOverlay();
  renderItem();
}
/* ---------- Strati: lezione, pannello, finestra di conferma ----------
   Solo lo strato più in alto si può usare: quelli sotto diventano inerti (Tab e lettori di schermo non li raggiungono).
   Alla chiusura il focus torna al comando che aveva aperto lo strato, anche se la pagina nel frattempo è stata ridisegnata. */
const LAYERS = ['ov', 'sheet', 'modal'];
const openers = {};
let pendingBack = null;
// selettore per ritrovare un comando dopo che la pagina è stata ridisegnata
function describe(el) {
  if (!el || !el.dataset || !el.dataset.act) return null;
  return `[data-act="${el.dataset.act}"]` + ['u', 'v', 'i', 'e'].filter((k) => el.dataset[k] != null).map((k) => `[data-${k}="${CSS.escape(el.dataset[k])}"]`).join('');
}
function topLayer() { for (let i = LAYERS.length - 1; i >= 0; i--) { const el = $('#' + LAYERS[i]); if (el) return el; } return $('#app'); }
function syncInert() {
  const top = topLayer();
  const app = $('#app'), skip = $('a.sr');
  if (app) app.inert = app !== top;
  if (skip) skip.inert = app !== top;
  LAYERS.forEach((id) => { const el = $('#' + id); if (el) el.inert = el !== top; });
}
function layerOpened(id) {
  if (!openers[id]) {
    const a = document.activeElement;
    openers[id] = a && a !== document.body && a.isConnected ? { el: a, sel: describe(a) } : pendingBack;
  }
  pendingBack = null;
  syncInert();
}
function layerClosed(id) {
  const back = openers[id];
  delete openers[id];
  syncInert();
  pendingBack = back;
  // si aspetta che la pagina sotto sia ridisegnata; se intanto si apre un altro strato, il ritorno passa a quello
  setTimeout(() => {
    if (pendingBack !== back) return;
    pendingBack = null;
    const top = topLayer(), now = document.activeElement;
    if (now && now !== document.body && top.contains(now)) return;
    let t = back && back.el.isConnected && top.contains(back.el) ? back.el : back && back.sel ? top.querySelector(back.sel) : null;
    if (!t) t = top.id === 'app' ? $('#main') : top.querySelector('button, [href], input, textarea, select');
    if (t) t.focus({ preventScroll: true });
  }, 0);
}
function openOverlay() {
  const old = $('#ov'); if (old) old.remove();
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', SES.title || 'Lezione');
  ov.innerHTML = `<div class="ov-inner"><div class="ov-head"><button class="iconbtn" data-act="quit" aria-label="Chiudi la lezione">${I.close}</button><div class="progress" role="progressbar" aria-label="Avanzamento" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="combo" id="combo" aria-live="polite"></div></div><div class="ov-body" id="ovBody"></div></div><div class="ov-foot" id="ovFootWrap"><div class="foot-in" id="ovFoot"></div></div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  layerOpened('ov');
}
function closeOverlay() { const o = $('#ov'); if (o) { o.remove(); layerClosed('ov'); } document.body.style.overflow = ''; closePop(); }
function setProgress() {
  const b = $('#ov .progress'); if (!b) return;
  const p = Math.min(1, SES.i / SES.items.length);
  b.firstChild.style.width = Math.max(3, Math.round(p * 100)) + '%'; b.setAttribute('aria-valuenow', Math.round(p * 100));
}
function setCombo() { const c = $('#combo'); if (c) c.innerHTML = SES.combo >= 2 ? I.flame + '<span>' + SES.combo + '</span><span class="sr"> risposte giuste di fila</span>' : ''; }

function renderItem() {
  closePop();
  const it = SES.items[SES.i];
  if (!it) return finishSession();
  setProgress(); setCombo();
  SES.cur = { it, answered: false, chosen: [], picked: null, inputMode: S.settings.input === 'keys' || (levelOf() && levelOf().typed) ? 'keys' : 'tiles' };
  const tags = [it.quiz && 'Verifica veloce', it.review && 'Ripasso', it.requeued && 'Riproviamo', it.s && it.s.src === 'gen' && 'Frase nuova'].filter(Boolean);
  SES.cur.tagsHtml = tags.length ? `<div class="ex-tags">${tags.map((t) => `<span class="tag pri">${t}</span>`).join('')}</div>` : '';
  const html = ({
    teach: renderTeach, gr_it: renderGrIt, it_gr: renderItGr, analizza: renderAnalizza, scrivi: renderScrivi, completa: renderCompleta,
    lessico: renderLessico, alfabeto: renderAlfabeto, abbina: renderAbbina, accorda: renderAccorda, lettera: renderLettera, accento: renderAccento,
  }[it.type] || (() => ''))(it);
  const body = $('#ovBody');
  body.innerHTML = html;
  body.classList.remove('fx-in'); void body.offsetWidth; body.classList.add('fx-in');
  $('#ovFootWrap').className = 'ov-foot';
  renderFoot();
  if (it.type === 'gr_it' || it.type === 'it_gr') refreshAnswer();
  const t = $('#typed');
  if (t && !matchMedia('(pointer: coarse)').matches) t.focus({ preventScroll: true });
  else if (it.type !== 'teach') { const h = $('#ovBody h2, #ovBody h3'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  $('.ov-inner').scrollTop = 0;
}
// intestazione dell'esercizio: contrassegni, consegna ed eventuale lemma sotto
function exHead(title, lemma) {
  return `<div class="ex-head">${SES.cur.tagsHtml || ''}<h2 class="prompt">${title}${lemma ? `<span class="lemma" lang="grc">${esc(lemma)}</span>` : ''}</h2></div>`;
}
function renderFoot() {
  const it = SES.cur.it;
  if (it.type === 'teach') { $('#ovFoot').innerHTML = `<button class="btn big block" data-act="next" id="nextBtn">Continua</button>`; setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 60); return; }
  if (it.type === 'abbina') { $('#ovFoot').innerHTML = `<p class="foot-hint">Tocca una parola greca, poi il suo significato.</p>`; return; }
  $('#ovFoot').innerHTML = `<button class="btn big block" data-act="check" id="checkBtn" ${CHOICE.includes(it.type) ? 'disabled' : ''}>Controlla</button>`;
}
/* ---------- Rese degli esercizi ---------- */
const grSpans = (h) => h.replace(/class="gr"/g, 'class="gr" lang="grc"').replace(/class="gr x"/g, 'class="gr x" lang="grc"');
function teachTable(card) {
  if (card.tbl) return tblHtml(card.tbl.c, card.tbl.r, card.cap || '', [0]);
  if (card.decl) return declTable(card.decl, card.cap || '', card.num);
  if (card.conj) return conjTable(card.conj, card.cap || '');
  if (card.adj) return adjTable(card.adj, card.cap || '');
  if (card.pron) return pronTable(card.pron, card.cap || '');
  if (card.art) return pronTable(null, card.cap || '', E.LEX.find((e) => e.k === 'art'));
  if (card.forms) return formsTable(card.forms);
  return '';
}
function renderTeach(it) {
  const c = it.card;
  const f = SES.kind === 'lesson' ? FLAT[SES.idx] : null;
  let h = `<div class="teach">`;
  if (c.intro && f) h += `<div class="ex-head"><p class="eyebrow">Unità ${f.ui + 1}</p><h1>${esc(f.unit.title)}</h1></div>`;
  // una scheda fatta solo di parole di Ermes occupa la scena: lui grande, il fumetto sotto
  const solo = c.say && !c.p && !c.ex && !teachTable(c);
  if (solo) h += `<div class="teach-hero">${ermes(c.intro ? 'cheer' : 'happy', c.intro ? 150 : 132)}<div class="bubble big">${esc(c.say)}</div></div>`;
  else if (c.say) h += say(esc(c.say), 'happy', 72);
  if (c.p) h += `<div class="card lesson-text">${grSpans(c.p)}</div>`;
  h += teachTable(c);
  if (c.ex) h += `<div class="ex"><span class="gr" lang="grc">${esc(c.ex[0])}</span><span class="muted">${esc(c.ex[1])}</span><div class="tools"><button class="tool" data-act="speakText" data-w="${esc(c.ex[0])}">${I.sound}Ascolta</button></div></div>`;
  return h + '</div>';
}
function greekLine(s, o = {}) {
  const toks = tokensOf(s);
  const words = SN.render(toks, { words: true });
  const fw = toks.findIndex((t) => t && !t.p);
  const fresh = new Set(o.newWords || []);
  let h = '';
  toks.forEach((t, i) => {
    if (!t) return;
    if (t.p) { h += esc(t.p); return; }
    let w = words[i];
    if (i === fw) w = SN.capFirst(w);
    if (o.blank === i) { h += (h ? ' ' : '') + `<span class="blank" id="blank" aria-label="spazio vuoto">…</span>`; return; }
    const verb = t.a && t.a.e.k === 'v' && t.a.m && !['inf', 'part'].includes(t.a.m);
    const nw = t.a && fresh.has(t.a.e.lemma);
    h += (h ? ' ' : '') + `<button class="w${verb ? ' vb' : ''}${nw ? ' new' : ''}" data-act="word" data-i="${i}" lang="grc"${nw ? ` aria-label="parola nuova: ${esc(w)}"` : ''}>${esc(w)}</button>`;
  });
  return `<p class="greek-line" lang="grc">${h}</p>${fresh.size ? '<p class="note"><span class="tag new">Nuova</span> Tocca la parola evidenziata per scoprire che cosa significa.</p>' : ''}`;
}
// strumenti della frase: pulsanti rotondi su una riga, con il nome per i lettori di schermo
const toolBtn = (act, icon, label, extra = '') => `<button class="iconbtn outline" data-act="${act}" aria-label="${label}" title="${label}" ${extra}>${icon}</button>`;
function inputToggle() {
  const tiles = SES.cur.inputMode === 'tiles';
  return toolBtn('toggleInput', tiles ? I.keys : I.tiles, tiles ? 'Rispondi scrivendo' : 'Rispondi con le tessere');
}
function toolsRow(it, extra) {
  return `<div class="ex-tools">${extra}${toolBtn('hint', I.bulb, 'Aiuto')}${inputToggle()}</div><div id="aux"></div>`;
}
function renderGrIt(it) {
  return `${exHead('Traduci in italiano')}${greekLine(it.s, { newWords: it.newWords })}
    ${toolsRow(it, toolBtn('speak', I.sound, 'Ascolta la frase') + toolBtn('method', I.method, 'Evidenzia i verbi', 'aria-pressed="false"'))}
    <div id="ansWrap" class="stack-lg">${answerArea(it)}</div>`;
}
function renderItGr(it) {
  const nw = (it.newWords || []).length ? `<p class="note"><span class="tag new">Nuova</span> Ti servirà una parola nuova: ${it.newWords.map((l) => { const e = LS.entryOf(l); return gr(e ? e.head || e.lemma : l) + (e ? ' = ' + esc(e.m) : ''); }).join(', ')}.</p>` : '';
  return `${exHead('Traduci in greco')}${say(esc(it.s.it[0]), 'idle', 64)}${nw}
    ${toolsRow(it, '')}
    <div id="ansWrap" class="stack-lg">${answerArea(it)}</div>`;
}
function answerArea(it) {
  const c = SES.cur;
  const greek = it.type === 'it_gr';
  if (c.inputMode === 'keys') {
    return `<label class="sr" for="typed">La tua traduzione</label><textarea id="typed" class="typed${greek ? ' gr' : ''}" rows="2" ${greek ? 'lang="grc" inputmode="none" autocapitalize="off"' : 'lang="it"'} autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${greek ? 'Scrivi in greco…' : 'Scrivi la traduzione…'}"></textarea>${greek ? keyboardHtml() : ''}`;
  }
  if (!c.tiles) c.tiles = greek ? greekTiles(it.s) : italianTiles(it.s);
  return `${greek ? '<p class="composed" id="composed" lang="grc" aria-live="polite"></p>' : ''}<div class="answer" id="answer" aria-label="La tua risposta"></div><div class="bank" id="bank">${c.tiles.map((t, k) => `<button class="tile${greek ? ' gr' : ''}" data-act="tile" data-k="${k}" ${greek ? 'lang="grc"' : ''}>${esc(t.label)}</button>`).join('')}</div>`;
}
const tileLabel = (t) => (t.lemma === 'οὐ' ? 'οὐ' : t.lemma === 'ἐκ' ? 'ἐκ' : t.f);
function greekTiles(s) {
  const toks = tokensOf(s).filter((t) => t && !t.p);
  const tiles = toks.map((t) => ({ label: tileLabel(t), tok: t }));
  const have = new Set(tiles.map((t) => G.strict(t.label)));
  const T = sel();
  const dis = [];
  const n = levelOf() ? levelOf().extra ?? 3 : 3;
  // più giri sulle stesse parole quando il livello chiede molte tessere intruse
  for (const t of shuffle(toks).concat(shuffle(toks))) {
    if (dis.length >= n) break;
    if (!t.a || !['n', 'v', 'a', 'art', 'p'].includes(t.a.e.k) || t.a.key === 'lemma') continue;
    const head = t.a.key.split('.').slice(0, 2).join('.');
    const alts = shuffle(formsUsable(t.a.e, T).filter((f) => !have.has(G.strict(f.f)) && f.key.split('.').slice(0, 2).join('.') === head));
    if (alts[0]) { have.add(G.strict(alts[0].f)); dis.push({ label: alts[0].f, tok: SN.tok(alts[0]), distractor: true }); }
  }
  return shuffle(tiles.concat(dis));
}
const IT_FUNC = ['il', 'la', 'i', 'le', 'gli', 'di', 'a', 'da', 'in', 'con', 'che', 'non', 'un', 'una', 'del', 'della', 'al', 'alla', 'nel', 'nella', 'e', 'ma'];
function italianTiles(s) {
  const words = s.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/).filter(Boolean);
  const tiles = words.map((w) => ({ label: w }));
  const have = new Set(words.map((w) => w.toLowerCase()));
  const extra = [];
  const pool = shuffle(BANK.filter((b) => b !== s)).slice(0, 60).flatMap((b) => b.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/)).filter((w) => w.length > 3 && !have.has(w.toLowerCase()));
  const n = levelOf() ? levelOf().extra ?? 3 : 3;
  for (const w of shuffle(IT_FUNC)) { if (extra.length >= Math.min(1, n)) break; if (!have.has(w)) { extra.push(w); have.add(w); } }
  for (const w of pool) { if (extra.length >= n) break; if (!have.has(w.toLowerCase())) { extra.push(w.toLowerCase()); have.add(w.toLowerCase()); } }
  return shuffle(tiles.concat(extra.map((w) => ({ label: w, distractor: true }))));
}
function refreshAnswer() {
  const c = SES.cur;
  const btn = $('#checkBtn');
  if (c.inputMode !== 'tiles') { if (btn) btn.disabled = !(($('#typed') || {}).value || '').trim(); return; }
  const a = $('#answer'); if (!a) return;
  const greek = c.it.type === 'it_gr';
  a.innerHTML = c.chosen.map((k, j) => `<button class="tile${greek ? ' gr' : ''}" data-act="untile" data-j="${j}" ${greek ? 'lang="grc"' : ''}>${esc(c.tiles[k].label)}</button>`).join('');
  $$('#bank .tile').forEach((b) => b.classList.toggle('used', c.chosen.includes(+b.dataset.k)));
  const comp = $('#composed');
  if (comp) comp.textContent = c.chosen.length ? SN.render(c.chosen.map((k) => c.tiles[k].tok).concat([{ p: '.' }])) : '';
  if (btn) btn.disabled = !c.chosen.length;
}
const optKey = (k) => `<span class="k" aria-hidden="true">${k + 1}</span>`;
function optsHtml(list, label = (x) => esc(x), greek = false, two = false) {
  return `<div class="opts${two ? ' two' : ''}">${list.map((o, k) => `<button class="opt${greek ? ' gr' : ''}" data-act="pick" data-k="${k}" ${greek ? 'lang="grc"' : ''}>${optKey(k)}<span>${label(o)}</span></button>`).join('')}</div>`;
}
function renderAnalizza(it) {
  return `${exHead('Che forma è?', it.e.head || it.e.lemma)}<p class="bigform" lang="grc">${esc(it.form)}</p>
    <div class="centered-tools">${toolBtn('speakForm', I.sound, 'Ascolta la forma')}</div>${optsHtml(it.options)}`;
}
function renderScrivi(it) {
  return `${exHead('Scrivi la forma')}<div class="card stack"><span class="gr lemma-big" lang="grc">${esc(it.e.head || it.e.lemma)}</span><b>${esc(it.desc)}</b></div>
    <label class="sr" for="typed">La forma in greco</label><input id="typed" class="typed gr" lang="grc" inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrivi in greco…">${keyboardHtml()}`;
}
function renderCompleta(it) {
  return `${exHead('Completa la frase')}<div class="stack">${greekLine(it.s, { blank: it.idx })}<p class="muted">${esc(it.s.it[0])}</p></div>${optsHtml(it.options, esc, true, true)}`;
}
function renderLessico(it) {
  if (it.reverse) return `${exHead(`Come si dice in greco «${esc(it.e.m.split(/[,;(]/)[0].trim())}»?`)}${optsHtml(it.options, (o) => esc(o.head || o.lemma), true)}`;
  return `${exHead('Che cosa significa?')}<p class="bigform" lang="grc">${esc(it.e.head || it.e.lemma)}</p>${optsHtml(it.options, (o) => esc(o.m))}`;
}
function renderAlfabeto(it) {
  return `${exHead('Come si trascrive?')}<p class="bigform" lang="grc">${esc(it.word)}</p>
    <div class="centered-tools">${toolBtn('speakForm', I.sound, 'Ascolta la parola')}</div>${optsHtml(it.options, esc, false, true)}`;
}
function renderLettera(it) {
  if (it.reverse) return `${exHead(`Quale lettera è «${esc(it.prompt)}»?`)}${optsHtml(it.options, esc, true, true)}`;
  return `${exHead('Come si chiama questa lettera?')}<p class="biglet" lang="grc">${esc(it.prompt)}</p>${optsHtml(it.options, esc, false, true)}`;
}
function renderAccento(it) {
  return `${exHead('Com’è accentata questa parola?')}<p class="bigform" lang="grc">${esc(it.word)}</p>${optsHtml(it.options, esc, false, true)}`;
}
function renderAccorda(it) {
  const slot = '<span class="slot"> ? </span>';
  const phrase = it.mode === 'adj' ? `${esc(it.art)} ${slot} ${esc(it.noun.f)}` : `${slot} ${esc(it.noun.f)}`;
  return `${exHead(it.mode === 'adj' ? 'Scegli la forma dell’aggettivo che concorda' : 'Scegli l’articolo giusto')}<div class="stack"><p class="phrase" lang="grc">${phrase}</p><p class="subline">${esc(it.noun.e ? it.noun.e.m : '')}</p></div>${optsHtml(it.options, esc, true, true)}`;
}
function renderAbbina(it) {
  const c = SES.cur;
  c.left = shuffle(it.pairs.map((p, i) => i)); c.right = shuffle(it.pairs.map((p, i) => i)); c.matched = new Set(); c.mist = 0; c.selL = null; c.selR = null;
  return `${exHead('Abbina le coppie')}<div class="match"><div class="col">${c.left.map((i) => `<button class="gr" lang="grc" data-act="mL" data-i="${i}">${esc(it.pairs[i].gr)}</button>`).join('')}</div><div class="col">${c.right.map((i) => `<button data-act="mR" data-i="${i}">${esc(it.pairs[i].it)}</button>`).join('')}</div></div>`;
}
function matchStep() {
  const c = SES.cur, it = c.it;
  if (c.selL == null || c.selR == null) return;
  const L = $(`[data-act="mL"][data-i="${c.selL}"]`), R = $(`[data-act="mR"][data-i="${c.selR}"]`);
  if (c.selL === c.selR) {
    c.matched.add(c.selL); sfx.match();
    [L, R].forEach((b) => { b.classList.remove('sel'); b.classList.add('ok'); b.disabled = true; });
  } else {
    c.mist++; sfx.err(); buzz(30);
    [L, R].forEach((b) => { b.classList.remove('sel'); b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); });
  }
  c.selL = c.selR = null;
  if (c.matched.size === it.pairs.length) setTimeout(() => finalize({ ok: c.mist <= 1, sol: it.pairs.map((p) => p.gr + ' = ' + p.it).join(' · '), note: c.mist ? `Errori: ${c.mist}.` : '' }), 250);
}

/* ---------- Tastiera greca ---------- */
const KB_ROWS = [['ς', 'ε', 'ρ', 'τ', 'υ', 'θ', 'ι', 'ο', 'π'], ['α', 'σ', 'δ', 'φ', 'γ', 'η', 'ξ', 'κ', 'λ'], ['ζ', 'χ', 'ψ', 'ω', 'β', 'ν', 'μ']];
const DIA = [['\u0313', '᾿', 'spirito dolce'], ['\u0314', '῾', 'spirito aspro'], ['\u0301', '´', 'acuto'], ['\u0300', '`', 'grave'], ['\u0342', '῀', 'circonflesso'], ['\u0345', 'ͺ', 'iota sottoscritto'], ['\u0308', '¨', 'dieresi']];
// prima volta con la tastiera: come si compongono lettera e segni
function kbCoach() {
  if (S.coach.kbd) return '';
  return `<div class="kb-coach" id="kbCoach" role="note"><b>Come si scrive con questa tastiera</b><ol><li>Tocca la lettera: <span lang="grc">α</span>.</li><li>Poi tocca i segni: spirito, accento e iota si aggiungono alla lettera appena scritta (<span lang="grc">α</span> + ᾿ + ´ = <span lang="grc">ἄ</span>).</li><li>⌫ cancella l’ultima lettera con i suoi segni. Dal computer puoi scrivere anche con la tastiera fisica.</li></ol><button class="linkbtn" data-act="kbCoachOk">Ho capito</button></div>`;
}
function keyboardHtml(target = 'typed', hint = true) {
  return `${kbCoach()}<div class="kb" data-for="${target}" role="group" aria-label="Tastiera greca">${KB_ROWS.map((r) => `<div class="kb-row">${r.map((l) => `<button type="button" data-act="kb" data-k="${l}" aria-label="${l}">${l}</button>`).join('')}</div>`).join('')}
    <div class="kb-row">${DIA.map(([m, s, n]) => `<button type="button" class="dia" data-act="kbd" data-m="${m}" aria-label="${n}">${s}</button>`).join('')}<button type="button" class="del" data-act="kbx" aria-label="Cancella">⌫</button></div>
    <div class="kb-row"><button type="button" class="wide" data-act="kb" data-k=" " aria-label="Spazio">spazio</button><button type="button" class="wide" data-act="kbcase" aria-label="Maiuscola">Maiusc.</button></div></div>
    ${hint ? `<p class="kb-hint">Dal computer: lettere latine → greche (h = η, w = ω, q = θ, c = ξ, y = ψ, x = χ, f = φ); ) dolce, ( aspro, / acuto, \\ grave, = circonflesso, | iota sottoscritto.</p>` : ''}`;
}
// campo collegato alla tastiera del pulsante premuto
function kbField(el) { const k = el && el.closest('[data-for]'); return $('#' + (k ? k.dataset.for : 'typed')); }
function kbChanged(t) { if (t.id !== 'typed') return; const b = $('#checkBtn'); if (b) b.disabled = !t.value.trim(); }
let kbUpper = false;
const LAT = { a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι', k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ', t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς', v: 'ς' };
const LAT_DIA = { ')': '\u0313', '(': '\u0314', '/': '\u0301', '\\': '\u0300', '=': '\u0342', '|': '\u0345', '+': '\u0308' };
function insertText(el, txt) {
  const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, a) + txt + el.value.slice(b);
  normalizeTyped(el, a + txt.length);
}
function normalizeTyped(el, caret) {
  const nb = G.nfc(el.value.slice(0, caret)), na = G.nfc(el.value.slice(caret));
  el.value = G.nfc(nb + na);
  const pos = Math.min(el.value.length, nb.length);
  try { el.setSelectionRange(pos, pos); } catch (e) { /* ignora */ }
}
function applyMark(el, mark) {
  const caret = el.selectionStart ?? el.value.length;
  const before = el.value.slice(0, caret);
  if (!before) return;
  const chars = [...before];
  const last = chars.pop();
  const d = [...last.normalize('NFD')];
  const base = d[0];
  if (!/[α-ωΑ-Ωρ]/.test(base)) return;
  let marks = d.slice(1);
  const groups = { '\u0313': 'b', '\u0314': 'b', '\u0301': 'a', '\u0300': 'a', '\u0342': 'a', '\u0345': 'i', '\u0308': 'd' };
  if (marks.includes(mark)) marks = marks.filter((m) => m !== mark);
  else { marks = marks.filter((m) => groups[m] !== groups[mark]); marks.push(mark); }
  const order = ['\u0308', '\u0313', '\u0314', '\u0301', '\u0300', '\u0342', '\u0345'];
  marks.sort((x, y) => order.indexOf(x) - order.indexOf(y));
  const nl = (base + marks.join('')).normalize('NFC');
  el.value = chars.join('') + nl + el.value.slice(caret);
  const p = (chars.join('') + nl).length;
  try { el.setSelectionRange(p, p); } catch (e) { /* ignora */ }
  const btn = $('#checkBtn'); if (btn) btn.disabled = !el.value.trim();
}
function onTypedKey(ev) {
  const el = ev.target;
  if (!el.classList.contains('gr') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key;
  if (LAT_DIA[k]) { ev.preventDefault(); applyMark(el, LAT_DIA[k]); return; }
  if (k.length === 1 && /[a-zA-Z]/.test(k)) {
    const g = LAT[k.toLowerCase()];
    if (g) { ev.preventDefault(); insertText(el, k !== k.toLowerCase() ? g.toUpperCase() : g); }
  }
}

/* ---------- Controllo delle risposte ---------- */
function act(name, el) { if (ACT[name]) ACT[name](el); }
function pickOption(k) {
  const c = SES.cur; if (!c || c.answered) return;
  c.picked = k;
  $$('#ovBody .opt').forEach((b) => b.classList.toggle('sel', +b.dataset.k === k));
  sfx.tap();
  const btn = $('#checkBtn'); if (btn) btn.disabled = false;
}
function doCheck() {
  const c = SES.cur; if (!c || c.answered) return;
  const it = c.it;
  let res = null;
  if (CHOICE.includes(it.type) && c.picked == null) return;
  if (it.type === 'gr_it') {
    if (c.inputMode === 'tiles') {
      if (!c.chosen.length) return;
      const built = c.chosen.map((k) => c.tiles[k].label).join(' ');
      const ok = HC.tilesItalian(it.s.it, built);
      res = { ok, sol: it.s.it[0], given: built, near: !ok && HC.sim(HC.normIt(built), HC.normIt(it.s.it[0])) > 0.8 };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la traduzione.');
      // si accetta da sola solo una soluzione prevista; il resto va al confronto guidato
      const m = HC.matchItalian(it.s.it, ans);
      if (m.status === 'review') return selfGrade(it, ans, m.ref);
      res = { ok: true, sol: m.ref, given: ans, typed: true, note: m.status === 'accents' ? 'Attento agli accenti: ' + m.ref : '' };
    }
  } else if (it.type === 'it_gr') {
    const ref = tokensOf(it.s);
    if (c.inputMode === 'tiles') {
      if (!c.chosen.length) return;
      const toks = c.chosen.map((k) => c.tiles[k]);
      const noDis = toks.every((t) => !t.distractor) && toks.length === ref.filter((t) => t && !t.p).length;
      const ok = noDis && SN.orderOK(ref, toks.map((t) => t.tok.f));
      const builtStr = SN.render(toks.map((t) => t.tok).concat([{ p: '.' }]));
      res = { ok, sol: it.s.gr, given: builtStr, greek: true, note: ok && G.strict(builtStr) !== G.strict(it.s.gr) ? 'Giusto: in greco l’ordine delle parole è libero. Ordine del testo: ' + it.s.gr : '' };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la frase in greco.');
      const r = HC.checkGreek(ref, ans, { lenient: S.settings.accents === 'lenient' });
      res = { ok: r.ok, sol: it.s.gr, given: ans, greek: true, typed: true, issues: r.issues, accentOnly: r.ok && !r.exact };
      if (r.exact) S.stats.accentOK++;
    }
  } else if (it.type === 'analizza') {
    const ok = it.valid.includes(it.options[c.picked]);
    res = { ok, sol: it.correct, others: it.valid.length > 1 ? it.valid : null };
    markOptions(ok, (k) => it.valid.includes(it.options[k]));
  } else if (it.type === 'scrivi') {
    const raw = G.nfc($('#typed').value.trim());
    if (!raw) return toast('Scrivi la forma.');
    const r = HC.checkForm(it.answers, raw, { lenient: S.settings.accents === 'lenient', nu: it.nu });
    res = { ok: r.ok, sol: it.answers.join(' / '), greek: true, issues: r.issues, accentOnly: r.ok && !r.exact };
    if (r.exact) S.stats.accentOK++;
  } else if (it.type === 'completa') {
    const ok = it.options[c.picked] === it.answer;
    res = { ok, sol: it.s.gr, greek: true };
    markOptions(ok, (k) => it.options[k] === it.answer);
    const b = $('#blank'); if (b) b.textContent = SN.render(tokensOf(it.s), { words: true })[it.idx];
  } else if (it.type === 'lessico') {
    const ok = it.options[c.picked] === it.e;
    res = { ok, sol: (it.e.head || it.e.lemma) + ' = ' + it.e.m };
    markOptions(ok, (k) => it.options[k] === it.e);
    srs(it.e, ok);
  } else {
    const right = it.type === 'accorda' ? it.answer : it.right;
    const ok = it.options[c.picked] === right;
    res = { ok, sol: it.type === 'alfabeto' ? it.word + ' = ' + right : it.type === 'accorda' ? (it.mode === 'adj' ? it.art + ' ' + right + ' ' + it.noun.f : right + ' ' + it.noun.f) : right, greek: it.type === 'accorda' || (it.type === 'lettera' && it.reverse) };
    if (it.type === 'accento') res.note = accentNote(it.word, right);
    if (it.type === 'accorda' && it.noun.d) res.note = `${it.noun.f}: ${it.noun.d}`;
    markOptions(ok, (k) => it.options[k] === right);
  }
  finalize(res);
}
function accentNote(w, cls) {
  const where = { ossitona: 'acuto sull’ultima sillaba', parossitona: 'acuto sulla penultima', proparossitona: 'acuto sulla terzultima', perispomena: 'circonflesso sull’ultima', properispomena: 'circonflesso sulla penultima' }[cls];
  return `${w}: ${where}.`;
}
function markOptions(ok, isRight) {
  $$('#ovBody .opt').forEach((b, k) => {
    b.disabled = true; b.classList.remove('sel');
    if (isRight(k)) b.classList.add('right');
    else if (k === SES.cur.picked && !ok) b.classList.add('wrong');
  });
}
function selfGrade(it, ans, sol) {
  const c = SES.cur; c.answered = true;
  $('#typed').readOnly = true;
  $('#ovFoot').innerHTML = `<div class="fb">${ermes('think', 52)}<div class="fb-txt"><h3>Confronta con la soluzione</h3><p class="sol">${esc(sol)}</p>${it.s.it.length > 1 ? `<p class="note">Anche: ${it.s.it.filter((x) => x !== sol).slice(0, 2).map(esc).join(' · ')}</p>` : ''}
    <ul class="checklist"><li>Chi compie l’azione e chi la subisce sono gli stessi?</li><li>Il verbo ha lo stesso tempo, la stessa persona e lo stesso numero?</li><li>Complementi e negazione ci sono tutti, con lo stesso senso?</li></ul>
    <p class="note">Se rispondi sì a tutto, la tua traduzione va bene anche se è scritta in modo diverso.</p></div></div>
    <div class="btns"><button class="btn err" data-act="self" data-v="0">Ho sbagliato</button><button class="btn ok" data-act="self" data-v="1">Era giusta</button></div>`;
  c.selfData = { ans, sol };
}
function finalize(res) {
  const c = SES.cur, it = c.it;
  c.answered = true; c.res = res;
  $$('#ovBody .tile, #ovBody .opt, #ovBody .kb button, #ovBody .match button').forEach((b) => (b.disabled = true));
  const t = $('#typed'); if (t) t.readOnly = true;
  S.stats.answered++;
  S.stats.types[it.type] = (S.stats.types[it.type] || 0) + 1;
  const topic = it.topic || (it.s && it.s.focus);
  recordMastery(topic, res.ok);
  let gained = 0;
  if (res.ok) {
    SES.combo++; SES.best = Math.max(SES.best, SES.combo); SES.ok++; S.stats.correct++;
    gained = (XP_BASE[it.type] || 6) * (res.accentOnly ? 0.7 : 1) + (SES.combo >= 3 ? Math.min(SES.combo, 6) * 2 : 0) + (it.s && it.s.src === 'gen' ? 2 : 0) + (res.typed && !res.self ? 3 : 0);
    if (it.type === 'gr_it' || it.type === 'it_gr') S.stats.translated++;
    if (it.type === 'analizza' || it.type === 'scrivi') S.stats.forms++;
    if (res.typed && !res.self) S.stats.typedOK++;
    if (it.s && it.s.src === 'gen') S.stats.genSeen++;
    if (it.review) S.mistakes = S.mistakes.filter((m) => m.at !== it.review.at);
    sfx.ok(); buzz(15);
  } else {
    SES.combo = 0; SES.ko++;
    addMistake(it);
    sfx.err(); buzz([30, 40, 30]);
    // come nei corsi di lingua: l'esercizio sbagliato torna alla fine della lezione
    if (SES.kind === 'lesson' && SES.requeued < 3 && !it.requeued && it.type !== 'abbina') { SES.items.push(Object.assign({}, it, { requeued: true, options: it.options ? shuffle(it.options) : it.options })); SES.requeued++; }
  }
  if (it.s) S.recent = S.recent.filter((x) => x !== it.s.id).concat([it.s.id]).slice(-60);
  gained = Math.round(gained);
  SES.xp += gained;
  setCombo();
  save();
  showFeedback(res, gained);
}
function addMistake(it) {
  let m = null;
  if (it.s && it.s.src === 'gen') {
    const packed = { id: it.s.id, gr: it.s.gr, it: it.s.it, tags: it.s.tags, focus: it.s.focus, tip: it.s.tip, src: 'gen', tok: tokensOf(it.s).map(packTok) };
    S.genSaved = (S.genSaved || []).filter((x) => x.id !== it.s.id).concat([packed]).slice(-60);
  }
  if (it.type === 'gr_it' || it.type === 'it_gr') m = { k: 's', id: it.s.id, dir: it.type };
  else if (it.type === 'analizza' || it.type === 'scrivi') m = { k: 'f', e: E.LEX.indexOf(it.e), key: it.key, t: it.type };
  else if (it.type === 'lessico') m = { k: 'l', e: E.LEX.indexOf(it.e) };
  else if (it.type === 'lettera') m = { k: 'x', t: 'lettera', d: { reverse: !!it.reverse, prompt: it.prompt, right: it.right, options: it.options } };
  else if (it.type === 'accento') m = { k: 'x', t: 'accento', d: { word: it.word, right: it.right, options: it.options } };
  else if (it.type === 'alfabeto') m = { k: 'x', t: 'alfabeto', d: { e: E.LEX.indexOf(it.e), word: it.word, right: it.right, options: it.options } };
  else if (it.type === 'accorda') m = { k: 'x', t: 'accorda', d: { mode: it.mode, e: E.LEX.indexOf(it.e), n: E.LEX.indexOf(it.noun.e), nk: it.noun.key, nf: it.noun.f, art: it.art || '', answer: it.answer, options: it.options } };
  if (!m) return;
  const sig = (a) => JSON.stringify(Object.assign({}, a, { at: 0 }));
  S.mistakes = S.mistakes.filter((a) => sig(a) !== sig(m)).concat([Object.assign(m, { at: Date.now() })]).slice(-60);
}
// spiegazioni dei segni sbagliati, una riga per tipo
function formRule(want) {
  return { 'οὐκ': 'davanti a vocale con spirito dolce si scrive οὐκ', 'οὐχ': 'davanti a vocale con spirito aspro si scrive οὐχ', 'οὐ': 'davanti a consonante si scrive οὐ', 'οὔ': 'in fine di frase si scrive οὔ', 'ἐξ': 'davanti a vocale si scrive ἐξ', 'ἐκ': 'davanti a consonante si scrive ἐκ' }[G.nfc(want)] || 'la forma dipende dalla parola che segue';
}
function issuesHtml(res) {
  const iss = res.issues || [];
  if (!iss.length) return '';
  const lenient = S.settings.accents === 'lenient';
  const pairs = (list) => list.slice(0, 3).map((x) => `${gr(x.got)} → ${gr(x.want)}`).join(', ');
  const by = (k) => iss.filter((x) => x.kind === k);
  let h = '';
  if (by('iota').length) h += `<p class="accent-warn"><b>Iota sottoscritto:</b> ${pairs(by('iota'))}. Fa parte della desinenza, per questo conta sempre.</p>`;
  if (by('form').length) h += `<p class="accent-warn"><b>Forma della parola:</b> ${pairs(by('form'))}: ${formRule(by('form')[0].want)}.${lenient && res.ok ? ' In modalità graduale non conta come errore, ma vale qualche punto in meno.' : ''}</p>`;
  if (by('accent').length) h += `<p class="accent-warn"><b>Accenti e spiriti:</b> ${pairs(by('accent'))}.${lenient && res.ok ? ' Non conta come errore, ma vale qualche punto in meno.' : ''}</p>`;
  return h;
}
function showFeedback(res, gained) {
  const it = SES.cur.it;
  const topic = it.topic || (it.s && it.s.focus);
  $('#ovFootWrap').className = 'ov-foot ' + (res.ok ? 'ok' : 'err');
  let body = '';
  if (res.ok) {
    body += `<h3>${res.accentOnly ? 'Giusto, ma attento ai segni' : pick(['Ottimo!', 'Esatto!', 'Bravo!', 'Perfetto!', 'Εὖ γε!'])}</h3>`;
    if (gained) body += `<p class="note">+${gained} XP${SES.combo >= 3 ? ' · ' + SES.combo + ' di fila' : ''}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (res.others && res.others.length > 1) body += `<p class="note">Può essere anche: ${res.others.filter((o) => o !== it.options[SES.cur.picked]).map(esc).join('; ')}.</p>`;
  } else {
    body += `<h3>${res.near ? 'Quasi!' : 'Soluzione'}</h3><p class="sol${res.greek ? ' gr' : ''}" ${res.greek ? 'lang="grc"' : ''}>${esc(res.sol)}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (!res.near && !(it.s && it.s.tip)) body += `<p class="note">${esc(pick(C.COMFORT))}</p>`;
  }
  body += issuesHtml(res);
  if (it.s && it.s.tip && !res.ok) body += `<p class="note">${esc(it.s.tip)}</p>`;
  const extra = [];
  if (topic && TOPIC[topic] && !res.ok) extra.push(`<button class="tool" data-act="theory" data-t="${topic}">${I.book}Teoria</button>`);
  if (it.s) extra.push(`<button class="tool" data-act="analysis">${I.lens}Analisi</button>`, `<button class="tool" data-act="speakSent">${I.sound}Ascolta</button>`);
  $('#ovFoot').innerHTML = `<div class="foot-split"><div class="fb-wrap"><div class="fb ${res.ok ? 'ok' : 'err'}" role="status" aria-live="polite">${ermes(res.ok ? 'happy' : 'sad', 52)}<div class="fb-txt">${body}</div></div>${extra.length ? `<div class="fb-extra">${extra.join('')}</div>` : ''}</div>
    <button class="btn big ${res.ok ? 'ok' : 'err'}" data-act="next" id="nextBtn">Continua</button></div>`;
  setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 60);
  if (!res.ok && topic && TOPIC[topic] && !SES.shownTheory[topic] && SES.ko >= 3 && SES.kind === 'practice') {
    SES.shownTheory[topic] = true;
    const cur = SES.cur;
    setTimeout(() => { if (SES && SES.cur === cur && !SES.done && !$('#sheet')) theorySheet(topic, true); }, 500);
  }
}
function finishSession() {
  SES.done = true;
  const answered = SES.ok + SES.ko;
  const acc = answered ? SES.ok / answered : 1;
  const perfect = answered >= 4 && SES.ko === 0;
  let bonus = perfect ? 20 : 0;
  let stars = 0, passed = true, unlockedNew = null;
  if (SES.kind === 'lesson') {
    const f = FLAT[SES.idx];
    const id = f.lesson.id;
    passed = !SES.test || acc >= 0.7;
    stars = !passed ? 0 : acc >= 0.95 ? 3 : acc >= 0.8 ? 2 : 1;
    S.course.stars[id] = Math.max(S.course.stars[id] || 0, stars);
    S.course.times[id] = (S.course.times[id] || 0) + 1;
    S.stats.lessons++;
    bonus += 10;
    if (passed && SES.idx + 1 > S.course.unlocked && SES.idx + 1 < FLAT.length) { S.course.unlocked = SES.idx + 1; unlockedNew = FLAT[SES.idx + 1]; syncTopics(); }
  }
  const rankUp = addXP(SES.xp + bonus);
  if (answered > 0) touchStreak();
  S.stats.sessions++;
  if (perfect) S.stats.perfect++;
  if (SES.mode === 'review' && S.mistakes.length === 0 && answered > 0) S.stats.clearedReview++;
  const h = new Date().getHours();
  const won = checkBadges({ civetta: h >= 22, aurora: h < 8 });
  save();
  setProgress();
  if (passed) { sfx.done(); confetti(); } else sfx.err();
  const mins = Math.max(1, Math.round((Date.now() - SES.start) / 60000));
  const goalDone = todayXP() >= S.goal;
  const starRow = SES.kind === 'lesson' && passed ? `<div class="bigstars" role="img" aria-label="${stars} stelle su 3">${[1, 2, 3].map((n) => I.star.replace('<svg', `<svg class="${n <= stars ? 'on' : ''}"`)).join('')}</div>` : '';
  const title = !passed ? 'Quasi!' : perfect ? 'Ἄνευ ἁμαρτίας!' : acc >= 0.8 ? 'Καλῶς!' : SES.kind === 'lesson' ? 'Lezione completata' : 'Allenamento finito';
  const newUnit = unlockedNew && unlockedNew.ui !== FLAT[SES.idx].ui;
  const msg = !passed ? 'Per superare la prova serve il 70% di risposte giuste. Riprova: ormai ci sei.' : newUnit ? `Hai sbloccato l’unità «${unlockedNew.unit.title}»!` : unlockedNew ? `Prossima lezione: «${unlockedNew.lesson.title}».` : acc >= 0.7 ? pick(C.CHEERS) : 'Gli errori sono finiti nel ripasso: rivederli è il modo più rapido per imparare.';
  $('#ovBody').innerHTML = `<div class="done-screen fx-in">${ermes(passed ? 'cheer' : 'think', 140)}<h2 ${perfect || acc >= 0.8 ? 'lang="grc"' : ''}>${esc(title)}</h2>${starRow}<p>${esc(msg)}</p>
    <div class="stats3"><div class="stat" style="--c:var(--star-d)">${I.bolt}<b>+${SES.xp + bonus}</b><small>XP</small></div><div class="stat" style="--c:var(--good)">${I.check2}<b>${Math.round(acc * 100)}%</b><small>Precisione</small></div><div class="stat" style="--c:var(--info)">${I.clock}<b>${mins}′</b><small>Tempo</small></div></div>
    <p class="note">${goalDone ? `Obiettivo di oggi raggiunto: ${todayXP()} XP.` : `Oggi ${todayXP()} di ${S.goal} XP.`}</p>
    ${rankUp ? `<div class="card"><p class="eyebrow">Nuovo grado</p><b><span class="gr" lang="grc">${esc(rankOf(S.xp).r.name)}</span> · ${esc(rankOf(S.xp).r.tr)}</b></div>` : ''}
    ${won.map((b) => `<div class="card">${medal(b.id, true)}<b lang="grc">${esc(b.name)}</b><span class="note">${esc(b.desc)}</span></div>`).join('')}
    ${SES.kind === 'lesson' && (S.stats.lessons === 1 || (S.stats.lessons >= 3 && Date.now() - (S.backupAt || 0) > 7 * 864e5)) ? `<div class="card save-nudge"><b>Metti al sicuro i tuoi progressi</b><p class="note">Si salvano da soli su questo dispositivo. Con il codice di salvataggio li ritrovi anche su un altro telefono.</p><button class="btn small ghost" data-act="saveCode">Mostra il codice</button></div>` : ''}</div>`;
  $('#ovFootWrap').className = 'ov-foot';
  const again = !passed && SES.kind === 'lesson' ? `<button class="btn big ghost" data-act="retry">Riprova</button>` : S.mistakes.length && SES.kind === 'practice' && SES.mode !== 'review' ? '<button class="btn big ghost" data-act="startReview">Ripassa gli errori</button>' : '';
  $('#ovFoot').innerHTML = `<div class="btns">${again}<button class="btn big ${passed ? 'ok' : ''}" data-act="endSession">Continua</button></div>`;
  setTimeout(() => { const b = $('#ovFoot .btn:last-child'); if (b) b.focus(); }, 60);

}
function endSession() { const y = SES ? SES.backY : 0; SES = null; closeOverlay(); render(); window.scrollTo(0, y); flushToasts(); }

/* ---------- Ripetizione dilazionata ---------- */
const BOX_DAYS = [0, 1, 2, 4, 8, 16];
function srs(e, ok) { const v = S.vocab[e.id] || { box: 0, due: dayKey() }; v.box = ok ? Math.min(5, v.box + 1) : 0; v.due = addDays(dayKey(), BOX_DAYS[v.box]); S.vocab[e.id] = v; }
// parole delle lezioni raggiunte: fino a quella attuale, più quelle già svolte (anche oltre, se si è tornati indietro)
function reachedLessons() { return new Set(FLAT.filter((f) => f.idx <= currentIdx() || S.course.times[f.lesson.id]).map((f) => f.lesson.id)); }
function vocabReached() {
  const v = new Set();
  for (const f of FLAT) if (f.idx <= currentIdx() || S.course.times[f.lesson.id]) for (const l of f.lesson.lemmas || []) v.add(G.nfc(l));
  return v;
}
function vocabQueue() {
  const known = vocabReached();
  const ents = E.LEX.filter((e) => ['n', 'v', 'a'].includes(e.k) && known.has(e.lemma));
  const due = ents.filter((e) => S.vocab[e.id] && S.vocab[e.id].due <= dayKey());
  const fresh = ents.filter((e) => !S.vocab[e.id]).slice(0, Math.max(0, 10 - due.length));
  return { due, fresh, all: ents };
}

/* ---------- Popover e fogli ---------- */
let popOpener = null;
function closePop() {
  const p = $('#pop'); if (!p) return;
  const back = p.contains(document.activeElement) && popOpener;
  p.remove();
  if (back && back.isConnected) back.focus({ preventScroll: true });
}
function wordPop(btn, tok) {
  closePop();
  popOpener = btn;
  const a = tok.a; if (!a) return;
  const e = a.e;
  const others = E.isReady() ? uniq(E.analyze(a.f).filter((x) => x !== a && x.key !== 'lemma').map((x) => `${x.e.head || x.e.lemma}: ${x.d}`)).filter((x) => x !== `${e.head || e.lemma}: ${a.d}`).slice(0, 4) : [];
  const p = document.createElement('div');
  p.className = 'pop'; p.id = 'pop'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Analisi della parola');
  p.innerHTML = `<h4 lang="grc">${esc(a.f)}</h4><div class="lem">${gr(e.head || e.lemma)} — ${esc(e.m)}</div><p><b>${esc(a.d)}</b></p>
    ${others.length ? `<p class="note">Da sola può essere anche:</p><ul>${others.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
    <div class="tools"><button class="tool" data-act="speakText" data-w="${esc(a.f)}">${I.sound}Ascolta</button>${e.k !== 'i' && e.k !== 'art' ? `<button class="tool" data-act="paradigm" data-e="${E.LEX.indexOf(e)}">${I.table}Paradigma</button>` : ''}${S.settings.online ? `<a class="tool" href="https://it.wiktionary.org/wiki/${encodeURIComponent(e.lemma)}" target="_blank" rel="noopener noreferrer">${I.globe}Wikizionario</a>` : ''}</div>`;
  document.body.appendChild(p);
  const r = btn.getBoundingClientRect();
  const w = p.offsetWidth, h = p.offsetHeight;
  const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
  let top = r.bottom + 8;
  if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
  p.style.left = left + 'px'; p.style.top = top + 'px';
}
function openSheet(title, html) {
  const old = $('#sheet'); if (old) old.remove();
  const bg = document.createElement('div');
  bg.className = 'sheet-bg'; bg.id = 'sheet';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="Chiudi">${I.close}</button></div><div class="sheet-body">${html}</div></div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  layerOpened('sheet');
  setTimeout(() => { const b = $('#sheet .iconbtn'); if (b) b.focus(); }, 30);
}
function closeSheet() { const s = $('#sheet'); if (s) { s.remove(); layerClosed('sheet'); } }
function showModal(html) {
  const old = $('#modal'); if (old) old.remove();
  const bg = document.createElement('div');
  bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeModal(); });
  document.body.appendChild(bg);
  layerOpened('modal');
  setTimeout(() => { const b = $('#modal .btn:last-of-type') || $('#modal button'); if (b) b.focus(); }, 30);
}
function closeModal() { const m = $('#modal'); if (m) { m.remove(); layerClosed('modal'); } }
let modalCb = null;
function askConfirm(text, okLabel, cb, danger, mood = 'think') { modalCb = cb; showModal(`${ermes(mood, 88)}<h2>${esc(text)}</h2><div class="btns"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn ${danger ? 'err' : ''}" data-act="modalOk">${esc(okLabel)}</button></div>`);
  // con un'azione distruttiva il focus parte da «Annulla», così Invio non conferma per sbaglio
  if (danger) setTimeout(() => { const c = $('#modal [data-act="closeModal"]'); if (c) c.focus(); }, 40);
}
function askText(label, value, cb) { modalCb = cb; showModal(`<div class="field"><label for="mdIn">${esc(label)}</label><input id="mdIn" class="typed" maxlength="24" autocomplete="off" value="${esc(value)}"></div><div class="btns"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn" data-act="modalOk">Salva</button></div>`); setTimeout(() => { const i = $('#mdIn'); if (i) i.focus(); }, 40); }
function analysisSheet(s) {
  const toks = tokensOf(s);
  const words = SN.render(toks, { words: true });
  // nella frase conta una sola lettura; le altre della forma isolata si mostrano a parte
  const alts = (t) => (E.isReady() ? uniq(E.analyze(t.a.f).filter((x) => x.e === t.a.e && x.f === t.a.f && x.key !== t.a.key && x.key !== 'lemma').map((x) => x.d)) : []);
  const rows = toks.map((t, i) => { if (!t || t.p || !t.a) return ''; const al = alts(t); return `<tr><td class="gr" lang="grc">${esc(words[i])}</td><td>${gr(t.a.e.head || t.a.e.lemma)}<div class="note">${esc(t.a.e.m)}</div></td><td><b>${esc(t.a.d)}</b>${al.length ? `<div class="note">Da sola può essere anche: ${al.map(esc).join('; ')}</div>` : ''}</td></tr>`; }).join('');
  openSheet('Analisi della frase', `<p class="greek-line small" lang="grc">${esc(s.gr)}</p><p>${esc(s.it[0])}</p><div class="tbl-wrap"><table class="para wordtable"><thead><tr><th>Parola</th><th>Lemma</th><th>Analisi nella frase</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}
const STEPS = () => (['', 'Un passo', 'Due passi', 'Tre passi', 'Quattro passi', 'Cinque passi', 'Sei passi', 'Sette passi', 'Otto passi', 'Nove passi', 'Dieci passi'][B.METHOD.length] || B.METHOD.length + ' passi');
function methodSheet() { openSheet('Il metodo di costruzione', `${say(STEPS() + ' per non perdersi in nessuna frase greca.', 'happy', 64)}<ol>${B.METHOD.map((m) => `<li><b>${esc(m.h)}</b><p>${esc(m.p)}</p></li>`).join('')}</ol>`); }

/* ---------- Tabelle dal motore ---------- */
const CASE_ROWS = [['nom', 'Nom.'], ['gen', 'Gen.'], ['dat', 'Dat.'], ['acc', 'Acc.'], ['voc', 'Voc.']];
const PERS_ROWS = [['1s', '1ª sing.'], ['2s', '2ª sing.'], ['3s', '3ª sing.'], ['1p', '1ª plur.'], ['2p', '2ª plur.'], ['3p', '3ª plur.']];
const IMP_ROWS = [['2s', '2ª sing.'], ['3s', '3ª sing.'], ['2p', '2ª plur.'], ['3p', '3ª plur.']];
const findLemma = (l) => E.LEX.find((e) => e.lemma === G.nfc(l) && e.k !== 'i' && e.k !== 'art') || E.LEX.find((e) => e.lemma === G.nfc(l));
const cellForms = (e, key) => uniq(e.forms.filter((f) => f.key === key).map((f) => f.f + (f.nu ? '(ν)' : ''))).join(' / ') || '—';
function tblHtml(cols, rows, cap, grCols = []) {
  const isGr = (i) => grCols === 'all' || grCols.includes(i);
  return `<div class="tbl-wrap"><table class="para">${cap ? `<caption>${esc(cap)}</caption>` : ''}<thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row" ${isGr(0) ? 'class="gr" lang="grc"' : ''}>${esc(c)}</th>` : `<td class="${isGr(i) ? 'gr' : ''}" ${isGr(i) ? 'lang="grc"' : ''}>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function declTable(lemmas, cap, num) {
  const ents = lemmas.map(findLemma).filter(Boolean);
  const rows = [];
  for (const n of num ? [num] : ['s', 'p']) for (const [c, lab] of CASE_ROWS) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...ents.map((e) => cellForms(e, `n.${c}.${n}`))]);
  return tblHtml(['', ...ents.map((e) => e.lemma)], rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap, ents.map((_, i) => i + 1));
}
function conjTable(specs, cap) {
  const cols = [''], data = [];
  let imp = false;
  for (const [l, key] of specs) {
    const e = findLemma(l); if (!e) continue;
    const [t, m, v] = key.split('.');
    imp = m === 'imp';
    cols.push(`${l} — ${E.TENSE_IT[t === 'futp' ? 'fut' : t] || t}${v === 'mp' ? ' m.-p.' : v === 'mid' ? ' medio' : v === 'pass' ? ' passivo' : ''}`);
    data.push({ e, key });
  }
  const rows = (imp ? IMP_ROWS : PERS_ROWS).map(([p, lab]) => [lab, ...data.map(({ e, key }) => cellForms(e, `${key}.${p}`))]);
  return tblHtml(cols, rows, cap, data.map((_, i) => i + 1));
}
function adjTable(l, cap) {
  const e = findLemma(l); if (!e) return '';
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASE_ROWS) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...['m', 'f', 'n'].map((g) => cellForms(e, `a.pos.${g}.${c}.${n}`))]);
  return tblHtml(['', 'Maschile', 'Femminile', 'Neutro'], rows, cap, [1, 2, 3]);
}
function pronTable(l, cap, ent) {
  const e = ent || E.LEX.find((x) => x.k === 'p' && x.lemma === G.nfc(l));
  if (!e) return '';
  const pre = e.k === 'art' ? 'art' : 'p';
  const gens = uniq(e.forms.map((f) => f.g)).filter(Boolean);
  const gl = { m: 'Maschile', f: 'Femminile', n: 'Neutro', x: 'Masch./femm.' };
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASE_ROWS) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...gens.map((g) => cellForms(e, `${pre}.${g}.${c}.${n}`))]);
  return tblHtml(['', ...gens.map((g) => gl[g])], rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap, gens.map((_, i) => i + 1));
}
function formsTable(specs) { return tblHtml(['', 'Forma'], specs.map(([l, key, lab]) => { const e = findLemma(l); return [lab, e ? cellForms(e, key) : '—']; }), '', [1]); }
function theoryHtml(t) {
  let h = '';
  for (const b of t.body) {
    if (b.p) h += `<p>${grSpans(b.p)}</p>`;
    else if (b.tbl) h += tblHtml(b.tbl.c, b.tbl.r, b.cap, t.id === 'alf' ? [0] : 'all');
    else if (b.decl) h += declTable(b.decl, b.cap);
    else if (b.conj) h += conjTable(b.conj, b.cap);
    else if (b.adj) h += adjTable(b.adj, b.cap);
    else if (b.pron) h += pronTable(b.pron, b.cap);
    else if (b.art) h += pronTable(null, b.cap, E.LEX.find((e) => e.k === 'art'));
    else if (b.forms) h += formsTable(b.forms);
  }
  if (t.tip) h += `<div class="tip"><b>Metodo</b>${esc(t.tip)}</div>`;
  if (t.trap && t.trap.length) h += `<div class="trap"><b>Attenzione</b>${t.trap.map(esc).join('<br>')}</div>`;
  if (t.ex && t.ex.length) h += `<p class="section-title">Esempi</p>${t.ex.map(([g, i]) => `<div class="exline"><span class="gr" lang="grc">${esc(g)}</span><span class="muted">${esc(i)}</span></div>`).join('')}`;
  return `<div class="theory">${h}</div>`;
}
function theorySheet(id, auto) {
  const t = TOPIC[id]; if (!t) return;
  openSheet(t.n + '. ' + t.title, (auto ? say('Un paio di errori su questo argomento: ripassiamolo insieme, ci vuole un minuto.', 'think', 64) : '') + theoryHtml(t));
}
function paradigmSheet(e) {
  let h = `<p>${gr(e.head || e.lemma)} — ${esc(e.m)}</p>`;
  if (e.k === 'n') h += declTable([e.lemma], '');
  else if (e.k === 'a') h += adjTable(e.lemma, 'Grado positivo');
  else if (e.k === 'p') h += pronTable(null, '', e);
  else if (e.k === 'v') {
    const keys = uniq(e.forms.map((f) => f.key.split('.').slice(0, 3).join('.'))).filter((k) => /\.(ind|subj|opt|imp)\./.test(k + '.'));
    for (const k of keys) h += conjTable([[e.lemma, k]], E.TENSE_IT[k.split('.')[0] === 'futp' ? 'fut' : k.split('.')[0]] + ' ' + E.MOOD_IT[k.split('.')[1]]);
    const infs = uniq(e.forms.filter((f) => f.m === 'inf').map((f) => f.key));
    if (infs.length) h += tblHtml(['', 'Infinito'], infs.map((k) => [k.split('.')[0] === 'futp' ? 'futuro passivo' : E.TENSE_IT[k.split('.')[0]] + ' ' + E.VOICE_IT[k.split('.')[2]], cellForms(e, k)]), '', [1]);
  }
  openSheet('Paradigma', h);
}

/* ---------- Viste ---------- */
let VIEW = 'path';
let openNode = null;
const NAV = [['path', I.road, 'Percorso', 'Ὁδός'], ['gym', I.gym, 'Palestra', 'Γυμνάσιον'], ['lib', I.books, 'Teoria', 'Βιβλία'], ['words', I.words, 'Lessico', 'Λέξεις'], ['me', I.me, 'Profilo', 'Ἐγώ']];
function render() {
  if (!S.onboarded) return drawOnb();
  const app = $('#app');
  const st = effectiveStreak();
  const view = VIEW.startsWith('topic:') ? viewTopic(VIEW.slice(6)) : VIEW === 'path' ? viewPath() : VIEW === 'gym' ? viewGym() : VIEW === 'lib' ? viewLibrary() : VIEW === 'words' ? viewWords() : viewMe();
  const cur = VIEW.startsWith('topic:') ? 'lib' : VIEW;
  app.innerHTML = `<div class="shell"><nav class="rail" aria-label="Sezioni"><div class="brand">${MARK}<b lang="grc">Ἑρμηνεύς</b></div>${NAV.map(([v, ic, it, g]) => `<button data-act="tab" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${ic}<span>${it}<span class="gr" lang="grc">${g}</span></span></button>`).join('')}</nav>
    <div><main class="main" id="main" tabindex="-1"><header class="topbar"><div class="bar-in"><div class="brand">${MARK}<b lang="grc">Ἑρμηνεύς</b></div>
      <div class="top-stats"><span class="chip streak ${st ? '' : 'off'}" title="Giorni di fila">${I.flame}${st}<span class="sr"> giorni di fila</span></span><span class="chip xp" title="Punti esperienza">${I.bolt}${S.xp}<span class="sr"> XP</span></span></div></div></header>
      <div class="view">${view}</div></main></div>
    <aside class="side" aria-label="I tuoi progressi">${sidePanel()}</aside></div>
    <nav class="tabs" aria-label="Sezioni">${NAV.map(([v, ic, it]) => `<button data-act="tab" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${ic}<span>${it}</span></button>`).join('')}</nav>`;
  if (VIEW === 'words') bindWords();
  requestAnimationFrame(updateJump);
}
function ringSvg(p, label) {
  const r = 27, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
  return `<svg class="ring" viewBox="0 0 66 66" role="img" aria-label="${esc(label)}"><circle cx="33" cy="33" r="${r}" fill="none" stroke="var(--paper-2)" stroke-width="8"/><circle cx="33" cy="33" r="${r}" fill="none" stroke="${v >= 1 ? 'var(--good)' : 'var(--star)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 33 33)"/><text x="33" y="38" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)">${Math.round(v * 100)}%</text></svg>`;
}
function sententiaOfDay() { const n = daysBetween('2026-01-01', dayKey()); return B.SENTENTIAE[((n % B.SENTENTIAE.length) + B.SENTENTIAE.length) % B.SENTENTIAE.length]; }
function goalCard() {
  const x = todayXP();
  return `<section class="card goal">${ringSvg(x / S.goal, `Obiettivo di oggi: ${x} su ${S.goal} XP`)}<div class="grow"><b>Obiettivo di oggi</b><span class="note">${x >= S.goal ? 'Raggiunto: ogni XP in più è un regalo.' : `${x} di ${S.goal} XP`}</span><div class="bar"><i style="width:${Math.min(100, Math.round((x / S.goal) * 100))}%"></i></div></div></section>`;
}
function sidePanel() {
  const st = effectiveStreak();
  const rk = rankOf(S.xp);
  const max = sententiaOfDay();
  return `${goalCard()}
    <section class="card streak-card">${I.flame}<div class="grow"><b>${st} ${st === 1 ? 'giorno' : 'giorni'} di fila</b><span class="note">${S.shields ? `${S.shields} ${S.shields === 1 ? 'scudo protegge' : 'scudi proteggono'} la serie` : 'Ogni 7 giorni guadagni uno scudo'}</span></div></section>
    <section class="card"><p class="eyebrow">Grado</p><b><span class="gr" lang="grc">${esc(rk.r.name)}</span> · ${esc(rk.r.tr)}</b><div class="bar pri"><i style="width:${rk.next ? Math.round(((S.xp - rk.r.xp) / (rk.next.xp - rk.r.xp)) * 100) : 100}%"></i></div><span class="note">${rk.next ? `${rk.next.xp - S.xp} XP a ${esc(rk.next.tr)}` : 'Grado massimo'}</span></section>
    <section class="card maxim"><p class="eyebrow">Massima del giorno</p><p class="gr" lang="grc">${esc(max[0])}</p><p>${esc(max[1])}</p><p class="note">${esc(max[2])} · ${esc(max[3])}</p><button class="tool" data-act="speakText" data-w="${esc(max[0])}">${I.sound}Ascolta</button></section>`;
}
// numerali greci con la keraia: 1 → αʹ, 22 → κβʹ
const grNum = (n) => ['', 'ι', 'κ', 'λ'][Math.floor(n / 10)] + ['', 'α', 'β', 'γ', 'δ', 'ε', 'ϛ', 'ζ', 'η', 'θ'][n % 10] + 'ʹ';
// strada punteggiata fra i tondi: curve morbide da un centro all'altro (larghezza 240, centro 120)
function roadSvg(pts, walked) {
  const d = (p) => p.map((q, i) => (i ? `C${p[i - 1][0]} ${p[i - 1][1] + 50} ${q[0]} ${q[1] - 50} ${q[0]} ${q[1]}` : `M${q[0]} ${q[1]}`)).join(' ');
  return `<svg class="road" aria-hidden="true" viewBox="0 0 240 ${pts[pts.length - 1][1] + 40}" preserveAspectRatio="xMidYMin meet" style="height:${pts[pts.length - 1][1] + 40}px"><path d="${d(pts)}"/>${walked > 0 ? `<path class="walked" d="${d(pts.slice(0, walked + 1))}"/>` : ''}</svg>`;
}
const LESSON_ICON = (l) => (l.test ? I.trophy : l.teach ? I.book : I.dumbbell);
function viewPath() {
  const cur = currentIdx();
  const cf = FLAT[cur];
  const greet = S.name ? `Χαῖρε, ${esc(S.name)}!` : 'Χαῖρε!';
  const ul = cf.unit.lessons.length, li = cf.li + 1;
  let h = `<section class="card hero resume" aria-label="Lezione attuale"><div class="resume-top">${ermes('happy', 76)}<div class="resume-txt"><p class="note"><span lang="grc">${greet}</span> ${S.course.times[cf.lesson.id] ? 'Ripassiamo questa lezione.' : 'Si riparte da qui.'}</p><h2>${esc(cf.lesson.title)}</h2><p class="note">Unità ${cf.ui + 1} · ${esc(cf.unit.title)} · ${cf.lesson.test ? 'prova finale' : `lezione ${li} di ${ul}`}</p></div></div>
    <div class="lesson-dots" aria-hidden="true">${cf.unit.lessons.map((l, k) => `<i class="${k < cf.li || S.course.stars[l.id] ? 'on' : ''}${k === cf.li ? ' cur' : ''}"></i>`).join('')}</div>
    <div class="btns"><button class="btn big" data-act="startLesson" data-i="${cur}">${cf.lesson.test ? 'Inizia la prova' : 'Continua'}</button><button class="btn big ghost square" data-act="jump" aria-label="Mostra la lezione nel percorso" title="Mostra nel percorso">${I.road}</button></div></section>`;
  h += `<div class="only-narrow">${goalCard()}</div>`;
  if (canTranslate(sel())) h += `<section class="sec"><p class="eyebrow">Allenati a tradurre</p>${translateCards(sel())}</section>`;
  const offs = [0, 44, 66, 44, 0, -44, -66, -44];
  UNITS.forEach((u, ui) => {
    const grp = TOPIC[u.id] && GROUPS[TOPIC[u.id].group] ? GROUPS[TOPIC[u.id].group].color : 'g-nom';
    const fi = firstLessonIdx(ui);
    const locked = !isUnlocked(fi);
    h += `<section class="unit ${grp}${locked ? ' locked' : ''}" id="unit-${u.id}" aria-label="Unità ${ui + 1}: ${esc(u.title)}"><div class="unit-banner"><span class="unum" aria-hidden="true" lang="grc">${grNum(ui + 1)}</span><div class="t"><small>Unità ${ui + 1}</small><b>${esc(u.title)}</b></div>${toolBtnPlain('topic', I.book, 'Guida: ' + esc(u.title), `data-t="${u.id}"`)}</div><div class="path">`;
    let y = 24, nodes = '', walked = 0;
    const pts = [];
    u.lessons.forEach((l, li) => {
      const idx = fi + li;
      const st = S.course.stars[l.id] || 0;
      const unlocked = isUnlocked(idx);
      const isCur = idx === cur;
      const cls = ['node', l.test ? 'test' : '', !unlocked ? 'locked' : st ? 'done' : '', isCur ? 'current' : ''].filter(Boolean).join(' ');
      const icon = !unlocked ? I.lock : st && !isCur ? (l.test ? I.trophy : I.check2) : LESSON_ICON(l);
      const pad = isCur ? 34 : 0;
      pts.push([120 + offs[li % offs.length], y + pad + (isCur ? 37 : 33)]);
      y += 112 + pad;
      if (unlocked) walked = li;
      const stars = l.test || !st ? '' : [1, 2, 3].map((n) => I.star.replace('<svg', `<svg class="${n <= st ? 'on' : ''}"`)).join('');
      nodes += `<div class="node-wrap" style="transform:translateX(${offs[li % offs.length]}px)${pad ? ';height:' + (112 + pad) + 'px;padding-top:' + pad + 'px' : ''}">${isCur ? '<span class="start-tag" aria-hidden="true">INIZIA</span>' : ''}
        <button class="${cls}" data-act="node" data-i="${idx}" aria-label="${esc(l.title)}${!unlocked ? ' (bloccata)' : st ? ` (${st} ${st === 1 ? 'stella' : 'stelle'})` : ''}" aria-expanded="${openNode === idx}">${icon}</button>
        <div class="node-stars" aria-hidden="true">${stars}</div>
        ${openNode === idx ? nodePop(idx) : ''}</div>`;
    });
    h += roadSvg(pts, walked) + nodes + `</div></section>`;
  });
  h += `<button class="jump" id="jump" data-act="jump" hidden>${I.road}<span>Lezione attuale</span></button>`;
  h += `<div class="trophy">${I.laurel}<span>Alla fine del percorso: la corona d’alloro dell’ἑρμηνεύς.</span></div>`;
  return h;
}
// pulsante rotondo semplice (senza contorno), con il nome per i lettori di schermo
function toolBtnPlain(act, icon, label, extra = '') { return `<button class="iconbtn" data-act="${act}" aria-label="${label}" title="${label}" ${extra}>${icon}</button>`; }
function nodePop(idx) {
  const f = FLAT[idx];
  const l = f.lesson;
  const st = S.course.stars[l.id] || 0;
  if (!isUnlocked(idx)) {
    const unitLocked = !isUnlocked(firstLessonIdx(f.ui));
    return `<div class="node-pop locked" role="dialog" aria-label="${esc(l.title)}"><b>${esc(l.title)}</b><p>${unitLocked ? 'Questa unità è ancora chiusa. Se l’hai già studiata in classe, puoi aprirla.' : 'Completa prima le lezioni precedenti.'}</p>${unitLocked ? `<button class="btn" data-act="unlockUnit" data-u="${f.ui}">Apri l’unità</button>` : ''}</div>`;
  }
  return `<div class="node-pop" role="dialog" aria-label="${esc(l.title)}"><b>${esc(l.title)}</b><p>${esc(l.sub || '')}${l.test ? ' · serve il 70%' : ''}</p>
    <button class="btn" data-act="startLesson" data-i="${idx}">${st ? 'Ripeti (+XP)' : l.test ? 'Inizia la prova' : 'Inizia'}</button>
    ${st && l.teach ? `<button class="btn ghost" data-act="startLessonTeach" data-i="${idx}">Rivedi la spiegazione</button>` : ''}</div>`;
}
function scrollToCurrent() { const n = $('.node.current'); if (n) n.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
// le traduzioni si aprono con la prima declinazione (sintagmi senza verbo); dal presente con frasi complete
const canTranslate = (T) => T.has('d1');
function translateCards(T, withNew) {
  const on = canTranslate(T);
  const row = (m, icon, title, sub, dis) => `<li><button class="rowbtn" data-act="practice" data-m="${m}" ${dis ? 'disabled' : ''}><span class="ico">${icon}</span><span class="txt"><b>${title}</b><span>${sub}</span></span>${I.chev}</button></li>`;
  return `<div class="card flush"><ul class="list">${row('gr_it', I.translate, 'Versione', 'Dal greco all’italiano', !on)}${row('it_gr', I.pen, 'Retroversione', 'Dall’italiano al greco', !on)}${withNew ? row('nuove', I.spark, 'Frasi nuove', 'Create sul momento, sempre diverse', !on || !S.settings.gen) : ''}</ul></div>${on ? '' : '<p class="note">Le traduzioni si aprono con l’unità «Prima declinazione».</p>'}`;
}
function viewGym() {
  const T = sel();
  const p = S.prac;
  const units = UNITS.filter((u) => T.has(u.id));
  const unit = p.unit && T.has(p.unit) ? p.unit : units[units.length - 1].id;
  const nErr = S.mistakes.length;
  const row = (act, m, icon, title, sub, extra = '', dis = false) => `<li><button class="rowbtn" data-act="${act}" ${m ? `data-m="${m}"` : ''} ${dis ? 'disabled' : ''}><span class="ico">${icon}</span><span class="txt"><b>${title}</b><span>${sub}</span></span>${extra}${I.chev}</button></li>`;
  return `<header class="page-head"><h1>Palestra</h1><p class="lede">Allenati come vuoi: traduzioni, forme e parole, sugli argomenti che hai già aperto.</p></header>
    <section class="sec"><p class="eyebrow">Traduzione</p>
      <div class="card"><div class="field"><span class="label" id="lvLab">Difficoltà</span><div class="seg" role="group" aria-labelledby="lvLab">${Object.entries(LEVELS).map(([k, l]) => `<button data-act="pracLevel" data-v="${k}" aria-pressed="${p.level === k}">${l.label}</button>`).join('')}</div></div><p class="note level-desc">${esc(LEVELS[p.level] ? LEVELS[p.level].desc : '')}</p></div>
      ${translateCards(T, true)}</section>
    <section class="sec"><p class="eyebrow">Allenamento su misura</p>
      <div class="card custom">
        <div class="field"><label for="pracUnit">Argomento</label><div class="select"><select id="pracUnit">${units.map((u) => `<option value="${u.id}" ${u.id === unit ? 'selected' : ''}>${esc(u.title)}</option>`).join('')}</select></div></div>
        <div class="field"><span class="label" id="tyLab">Esercizi</span><div class="seg" role="group" aria-labelledby="tyLab">${[['misto', 'Misti'], ['frasi', 'Frasi'], ['forme', 'Forme'], ['parole', 'Parole']].map(([v, l]) => `<button data-act="pracType" data-v="${v}" aria-pressed="${p.type === v}">${l}</button>`).join('')}</div></div>
        <div class="setting"><div class="grow"><b>Solo parole delle lezioni raggiunte</b><span>Spegni per usare anche le parole delle lezioni successive delle unità aperte</span></div><label class="switch"><input type="checkbox" data-set="pracNarrow" ${p.wide ? '' : 'checked'} aria-label="Solo parole delle lezioni raggiuntrate"><i></i></label></div>
        <button class="btn big block" data-act="practice" data-m="${p.type}">Allenati</button></div></section>
    <section class="sec"><p class="eyebrow">Altro</p><div class="card flush"><ul class="list">
      ${row('practice', 'review', I.retry, 'Ripasso errori', nErr ? 'Le risposte sbagliate, da rifare' : 'Nessun errore da rivedere', nErr ? `<span class="count">${nErr}</span>` : '', !nErr)}
      ${row('practice', 'alfabeto', I.alpha, 'Alfabeto', 'Lettere, letture e accenti')}
      ${row('methodSheet', '', I.method, 'Il metodo', STEPS() + ' per tradurre una frase')}</ul></div></section>`;
}
function viewLibrary() {
  let h = `<header class="page-head"><h1>Teoria</h1><p class="lede">I ventidue argomenti del biennio. Le tabelle sono generate dal motore morfologico a partire dal lessico del corso.</p></header>
    <div class="card flush"><ul class="list"><li><button class="rowbtn" data-act="methodSheet"><span class="ico">${I.method}</span><span class="txt"><b>Il metodo di costruzione</b><span>${STEPS()} per non perdersi in una frase</span></span>${I.chev}</button></li></ul></div>`;
  for (const [gid, gdef] of Object.entries(GROUPS)) {
    const list = TOPICS.filter((t) => t.group === gid);
    if (!list.length) continue;
    h += `<section class="sec"><p class="eyebrow">${esc(gdef.name)}</p><div class="card flush"><ul class="list">${list.map((t) => `<li><button class="rowbtn ${gdef.color}" data-act="topic" data-t="${t.id}"><span class="num">${TOPIC[t.id].n}</span><span class="txt"><b>${esc(t.title)}</b><span>${esc(t.desc)}</span></span>${I.chev}</button></li>`).join('')}</ul></div></section>`;
  }
  return h;
}
function viewTopic(id) {
  const t = TOPIC[id];
  const ui = unitIdx(id);
  return `<header class="page-head"><div class="row"><button class="iconbtn" data-act="tab" data-v="lib" aria-label="Torna alla teoria">${I.back}</button><span class="eyebrow">${esc(GROUPS[t.group].name)} · ${t.n}</span></div>
    <h1>${esc(t.title)}</h1><p class="lede">${esc(t.desc)}</p>
    ${ui >= 0 && isUnlocked(firstLessonIdx(ui)) ? `<div><button class="btn small ghost" data-act="goUnit" data-u="${id}">${I.road}Vai all’unità nel percorso</button></div>` : ''}</header>
    <section class="card">${theoryHtml(t)}</section>`;
}
function viewWords() {
  const q = vocabQueue();
  const nDue = q.due.length + q.fresh.length;
  const learned = q.all.filter((e) => S.vocab[e.id] && S.vocab[e.id].box >= 3).length;
  return `<header class="page-head"><h1>Lessico</h1><p class="lede">${learned} parole imparate su ${q.all.length} delle lezioni raggiunte nel percorso.</p></header>
    <section class="sec"><p class="eyebrow">Ripasso di oggi</p><div class="card"><p class="note">${nDue ? `${q.due.length} da ripassare · ${q.fresh.length} nuove` : 'Per oggi hai finito: torna domani.'}</p><div id="flash" class="flash"></div></div></section>
    <section class="sec"><p class="eyebrow">Cerca una forma</p><div class="card stack"><p class="note">Scrivi una parola greca, anche senza accenti: il motore la analizza.</p>
    <div class="search"><label class="sr" for="q">Forma greca</label><input id="q" class="gr" lang="grc" ${qKbOpen ? 'inputmode="none" ' : ''}autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="es. λύσει"><button class="btn" data-act="search" aria-label="Cerca">${I.lens}</button></div>
    <button class="linkbtn" id="qKbBtn" data-act="qKbd" aria-controls="qKb" aria-expanded="${qKbOpen}">${qKbOpen ? 'Nascondi la tastiera greca' : 'Mostra la tastiera greca'}</button>
    <div id="qKb" class="stack"${qKbOpen ? '' : ' hidden'}>${keyboardHtml('q', false)}</div>
    <p class="note">Dal computer puoi usare le lettere latine (h = η, w = ω…) e i segni ) ( / \\ = |.</p><div id="results"></div></div></section>`;
}
// tastiera della ricerca: aperta per default sui telefoni, dove quella di sistema non ha il greco politonico
let qKbOpen = matchMedia('(pointer: coarse)').matches;
function syncQKbd() {
  const box = $('#qKb'), btn = $('#qKbBtn'), q = $('#q');
  if (box) box.hidden = !qKbOpen;
  if (btn) { btn.textContent = qKbOpen ? 'Nascondi la tastiera greca' : 'Mostra la tastiera greca'; btn.setAttribute('aria-expanded', qKbOpen); }
  if (q) { if (qKbOpen) q.setAttribute('inputmode', 'none'); else q.removeAttribute('inputmode'); }
}
let flashCur = null;
function bindWords() {
  const q = vocabQueue();
  const list = q.due.concat(q.fresh);
  const f = $('#flash');
  const inp = $('#q');
  if (inp && !inp.dataset.bound) { inp.dataset.bound = '1'; inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); act('search'); } else onTypedKey(ev); }); }
  if (!f) return;
  if (!list.length) { f.innerHTML = `${ermes('happy', 80)}<p class="muted">Nessuna parola da ripassare adesso.</p>`; return; }
  flashCur = { e: list[0], shown: false };
  drawFlash();
}
function drawFlash() {
  const f = $('#flash'); if (!f || !flashCur) return;
  const e = flashCur.e;
  f.innerHTML = `<span class="gr" lang="grc">${esc(e.head || e.lemma)}</span><div class="meaning">${flashCur.shown ? esc(e.m) : '<span class="muted">Ricordi il significato?</span>'}</div>
    ${flashCur.shown ? `<div class="btns"><button class="btn err" data-act="flash" data-v="0">Non lo sapevo</button><button class="btn ok" data-act="flash" data-v="1">Lo sapevo</button></div>` : `<div class="btns"><button class="btn" data-act="flashShow">Mostra</button><button class="btn ghost" data-act="speakText" data-w="${esc(e.lemma)}">${I.sound}Ascolta</button></div>`}`;
}
function searchForm() {
  const v = G.nfc(($('#q').value || '').trim());
  const out = $('#results');
  if (!v) { out.innerHTML = ''; return; }
  out.innerHTML = '<p class="loading"><i></i>Analisi in corso…</p>';
  setTimeout(() => {
    let an = E.analyze(v);
    let exact = true;
    if (!an.length) { an = E.analyzeLoose(v); exact = false; }
    if (!an.length) { out.innerHTML = `<p class="muted">Forma non trovata nel lessico di Hermeneus.</p>${S.settings.online ? `<a class="tool" href="https://it.wiktionary.org/wiki/${encodeURIComponent(v)}" target="_blank" rel="noopener noreferrer">${I.globe}Cerca nel Wikizionario</a>` : ''}`; return; }
    const groups = {};
    for (const a of an.slice(0, 40)) { const k = E.LEX.indexOf(a.e); (groups[k] = groups[k] || { e: a.e, items: [] }).items.push(a); }
    out.innerHTML = (exact ? '' : '<p class="note">Nessuna forma con questi accenti: ecco quelle che differiscono solo per i segni diacritici.</p>') +
      `<ul class="analysis-list">${Object.entries(groups).map(([k, g]) => `<li><b lang="grc">${esc(g.e.head || g.e.lemma)}</b> — ${esc(g.e.m)}<ul>${uniq(g.items.map((a) => `${a.f}: ${a.d}`)).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><button class="tool" data-act="paradigm" data-e="${k}">${I.table}Paradigma</button></li>`).join('')}</ul>`;
  }, 20);
}
function weekSvg() {
  const days = [...Array(7)].map((_, i) => addDays(dayKey(), i - 6));
  const vals = days.map((d) => S.days[d] || 0);
  const max = Math.max(S.goal, ...vals);
  const names = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  const gy = 92 - Math.round((S.goal / max) * 80);
  return `<svg class="week" viewBox="0 0 280 120" role="img" aria-label="XP degli ultimi sette giorni: ${vals.join(', ')}">${days.map((d, i) => {
    const hgt = Math.round((vals[i] / max) * 80);
    const [y, m, dd] = d.split('-').map(Number);
    return `<rect x="${i * 40 + 8}" y="${92 - hgt}" width="24" height="${Math.max(2, hgt)}" rx="6" fill="${vals[i] >= S.goal ? 'var(--good)' : 'var(--star)'}"/><text x="${i * 40 + 20}" y="110" text-anchor="middle" font-size="11" fill="var(--muted)">${names[new Date(y, m - 1, dd).getDay()]}</text>`;
  }).join('')}<line x1="0" x2="280" y1="${gy}" y2="${gy}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/></svg>`;
}
function medal(id, on) {
  const b = BADGES.find((x) => x.id === id);
  // medaglia: disco con bordo a dentelli e iniziale greca dell'insegna
  const teeth = Array.from({ length: 16 }, (_, i) => { const a1 = (i / 16) * Math.PI * 2; return `${(24 + Math.cos(a1) * 22).toFixed(1)},${(24 + Math.sin(a1) * 22).toFixed(1)}`; });
  return `<svg class="medal" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="${on ? 'var(--star)' : 'var(--off-d)'}"/>${teeth.map((p) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="2.6" fill="${on ? 'var(--star)' : 'var(--off-d)'}"/>`).join('')}<circle cx="24" cy="24" r="17" fill="${on ? 'var(--star-soft)' : 'var(--off)'}"/><text x="24" y="30.5" text-anchor="middle" font-family="GFS Didot, Gentium Plus, serif" font-size="19" fill="${on ? 'var(--star-d)' : 'var(--on-off)'}">${esc(b ? [...b.name][0] : '?')}</text></svg>`;
}
/* ---------- Salvataggio dei progressi ---------- */
const BADGE_IDS = () => BADGES.map((b) => b.id);
const LESSON_IDS = () => FLAT.map((f) => f.lesson.id);
function sinceText(t) {
  if (!t) return 'mai';
  const d = daysBetween(dayKey(new Date(t)), dayKey());
  return d <= 0 ? 'oggi' : d === 1 ? 'ieri' : d + ' giorni fa';
}
function origNote() {
  const o = originals();
  if (!o.length) return '';
  const last = o[o.length - 1];
  return `<div class="orig-note" role="note"><p><b>Salvataggio riparato ${sinceText(last.at)}.</b> Questi dati erano guasti e sono tornati ai valori iniziali: ${esc((last.problems || []).slice(0, 3).join('; '))}. La copia originale è conservata.</p><div class="btns"><button class="btn ghost" data-act="origDownload">Scarica l’originale</button><button class="btn ghost" data-act="origDelete">Elimina</button></div></div>`;
}
function saveCard() {
  const old = !S.backupAt || Date.now() - S.backupAt > 7 * 864e5;
  return `<section class="card savecard"><div class="save-head"><span class="save-dot ${saveFailed ? 'bad' : ''}" aria-hidden="true">${saveFailed ? I.close : I.check2}</span><div class="grow"><b>${saveFailed ? 'Il browser non permette di salvare' : 'Progressi salvati su questo dispositivo'}</b><span>${saveFailed ? 'Usa il codice di salvataggio prima di chiudere la pagina.' : 'Si salvano da soli dopo ogni risposta. Ultima copia di sicurezza: ' + sinceText(S.backupAt) + '.'}</span></div></div>
    ${old && S.stats.lessons ? '<p class="save-tip">Per non perderli se cambi telefono o cancelli i dati del browser, tieni da parte il codice di salvataggio.</p>' : ''}
    <div class="btns"><button class="btn" data-act="saveCode">Codice</button><button class="btn ghost" data-act="export">Scarica copia</button></div>
    <button class="linkbtn" data-act="restoreSheet">Ripristina da un codice o da un file</button>${origNote()}</section>`;
}
function codeSheet(mode) {
  const code = SV.encode(S, LESSON_IDS(), BADGE_IDS());
  const body = mode === 'restore' ? '' : `<p>Il codice contiene percorso, stelle, punti, serie, insegne e impostazioni. Copialo dove vuoi (note, messaggi, quaderno) e inseriscilo qui su un altro dispositivo.</p>
    <div class="savecode" id="savecode" tabindex="0" aria-label="Codice di salvataggio">${esc(code)}</div>
    <button class="btn block" data-act="copyCode">${I.cards}Copia il codice</button>
    <p class="note">Il ripasso degli errori e le schede del lessico restano solo nella copia su file.</p><hr class="sep">`;
  openSheet(mode === 'restore' ? 'Ripristina i progressi' : 'Codice di salvataggio', body + `
    <div class="field"><label for="codeIn">Inserisci un codice</label><textarea id="codeIn" class="typed codein" rows="3" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Per esempio 1A2B-C3D4-…"></textarea><p class="note" id="codeMsg" role="status"></p></div>
    <div class="btns"><button class="btn" data-act="restoreCode">Ripristina</button><button class="btn ghost" data-act="import">Da file</button></div>`);
}
function adopt(cand) {
  const prev = S;
  try { S = cand; S.onboarded = true; migrate(); } catch (e) { S = prev; toast('Questi progressi non si possono usare: quelli del dispositivo non sono cambiati.'); return; }
  S.backupAt = Date.now();
  onb = null; save(); applyTheme(); closeSheet(); closeModal(); VIEW = 'path'; render(); window.scrollTo(0, 0);
  toast('Progressi ripristinati.');
}
function askReplace(what, go) {
  if (S.onboarded && (S.xp || S.stats.lessons)) { closeSheet(); askConfirm(`Sostituire i progressi di questo dispositivo con quelli ${what}?`, 'Ripristina', go); } else go();
}
function refuse(what, problems) {
  const list = problems.slice(0, 3).join('; ') + (problems.length > 3 ? `; e altri ${problems.length - 3}` : '');
  showModal(`${ermes('sad', 88)}<h2>${esc(what)} non valido</h2><p>Dati non accettati: ${esc(list)}.</p><p class="note">I progressi di questo dispositivo non sono cambiati.</p><div class="btns"><button class="btn" data-act="closeModal">Ho capito</button></div>`);
}
function applyRestore(part) {
  const def = DEFAULT();
  const d = Object.assign(def, part, { v: 2, onboarded: true, course: Object.assign(def.course, part.course), stats: Object.assign(def.stats, part.stats), settings: Object.assign(def.settings, part.settings), prac: Object.assign(def.prac, part.prac) });
  const r = ST.check(d, stateCtx());
  if (r.problems.length) return refuse('Codice', r.problems);
  adopt(r.state);
}
function importFile(text) {
  let d;
  try { d = JSON.parse(text); } catch (e) { return refuse('File', ['non è una copia di Hermeneus (formato JSON illeggibile)']); }
  const r = ST.check(d, stateCtx());
  if (r.problems.length) return refuse('File', r.problems);
  askReplace('del file', () => adopt(r.state));
}
function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function viewMe() {
  const rk = rankOf(S.xp);
  const acc = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) : 0;
  const set = S.settings;
  const sw = (k, label, sub) => `<div class="setting"><div class="grow"><b>${label}</b><span>${sub}</span></div><label class="switch"><input type="checkbox" data-set="${k}" ${set[k] === true || set[k] === 'lenient' || set[k] === 'keys' ? 'checked' : ''} aria-label="${esc(label)}"><i></i></label></div>`;
  const cu = FLAT[currentIdx()];
  return `<header class="profile-head">${ermes('happy', 72)}<div class="grow"><h1>${S.name ? esc(S.name) : 'Il tuo profilo'}</h1><p class="note"><span class="gr" lang="grc">${esc(rk.r.name)}</span> · ${esc(rk.r.tr)}</p></div></header>
    <div class="stats3"><div class="stat" style="--c:var(--flame)">${I.flame}<b>${effectiveStreak()}</b><small>Serie</small></div><div class="stat" style="--c:var(--star-d)">${I.bolt}<b>${S.xp}</b><small>XP</small></div><div class="stat" style="--c:var(--good)">${I.check2}<b>${acc}%</b><small>Precisione</small></div></div>
    ${saveCard()}
    <section class="sec"><p class="eyebrow">Ultimi sette giorni</p><div class="card stack">${weekSvg()}<p class="note">Lezioni completate: ${S.stats.lessons} · unità superate: ${doneUnits()} su ${UNITS.length} · scudi: ${S.shields}</p></div></section>
    <section class="sec"><p class="eyebrow">Insegne</p><div class="card"><div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? '' : 'off'}">${medal(b.id, !!S.badges[b.id])}<b lang="grc">${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join('')}</div></div></section>
    <section class="sec"><p class="eyebrow">Studio</p><div class="card flush">
      <div class="setting"><div class="grow"><b>Posizione nel percorso</b><span>${esc(cu.unit.title)} · ${esc(cu.lesson.title)}</span></div><button class="btn small ghost" data-act="placement">Cambia</button></div>
      <div class="setting wrap"><div class="grow"><b>Obiettivo giornaliero</b><span>XP al giorno</span></div><div class="seg">${[30, 50, 80, 120].map((g) => `<button data-act="goal" data-v="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join('')}</div></div>
      ${sw('accents', 'Modalità graduale', 'Accenti, spiriti e forma di οὐ/ἐκ: segnalati ma non contano (qualche punto in meno). Lo iota sottoscritto conta sempre.')}
      ${sw('input', 'Rispondi scrivendo', 'Nelle traduzioni usa la tastiera al posto delle tessere')}
      ${sw('gen', 'Frasi generate', 'Oltre alle frasi verificate, frasi nuove create sul dispositivo')}</div></section>
    <section class="sec"><p class="eyebrow">Suoni e aspetto</p><div class="card flush">
      ${sw('sound', 'Suoni', 'Segnali sonori per le risposte')}
      ${sw('voice', 'Lettura ad alta voce', 'Lettura approssimata con la voce italiana del dispositivo')}
      <div class="setting wrap"><div class="grow"><b>Tema</b><span>Colori dell’app</span></div><div class="seg">${[['auto', 'Automatico'], ['light', 'Chiaro'], ['dark', 'Scuro']].map(([v, l]) => `<button data-act="theme" data-v="${v}" aria-pressed="${set.theme === v}">${l}</button>`).join('')}</div></div></div></section>
    <section class="sec"><p class="eyebrow">App e dati</p><div class="card flush">
      ${sw('online', 'Wikizionario', 'Collegamento al dizionario online: si invia solo la parola cercata')}
      <div class="setting"><div class="grow"><b>Installa l’app</b><span>${isStandalone() ? 'Hermeneus è già installata.' : 'Sul telefono funziona anche senza rete.'}</span></div><button class="btn small ghost" data-act="install" ${isStandalone() ? 'disabled' : ''}>Installa</button></div>
      <div class="setting"><div class="grow"><b>Nome</b><span>Facoltativo, resta sul dispositivo</span></div><button class="btn small ghost" data-act="rename">Cambia</button></div>
      <div class="setting"><div class="grow"><b>Azzera i progressi</b><span>Cancella tutto da questo dispositivo</span></div><button class="btn small err" data-act="reset">Azzera</button></div></div></section>
    <section class="sec"><p class="eyebrow">Informazioni</p><div class="card stack"><p class="note">Hermeneus funziona tutto sul tuo dispositivo: nessun account, nessuna raccolta di dati, nessuna intelligenza artificiale. Lettura ad alta voce: un’approssimazione della pronuncia erasmiana fatta dalla sintesi vocale italiana del dispositivo, che non distingue spirito aspro, aspirate, υ e ου, vocali lunghe e brevi. Caratteri: Gentium Plus, GFS Didot, Rubik (licenza SIL OFL 1.1). Dizionario online facoltativo: Wikizionario (CC BY-SA).</p>
    <p class="note">${E.LEX.length} lemmi · ${UNITS.length} unità · ${FLAT.length} lezioni · ${BANK.length} frasi verificate · ${B.SENTENTIAE.length} massime.</p></div></section>`;
}
/* ---------- Benvenuto e posizione nel percorso ---------- */
let onb = null;
function placementList(selId, actName) {
  return `<div class="choices"><button class="choice" data-act="${actName}" data-u="" aria-pressed="${selId === ''}"><span class="num" style="--gc:var(--good)">0</span><span class="grow"><b>Comincio da zero</b><span>Partiamo dall’alfabeto</span></span></button>
    ${UNITS.slice(0, -1).map((u, i) => `<button class="choice ${TOPIC[u.id] ? GROUPS[TOPIC[u.id].group].color : ''}" data-act="${actName}" data-u="${u.id}" aria-pressed="${selId === u.id}"><span class="num">${i + 1}</span><span class="grow"><b>Fino a: ${esc(u.title)}</b><span>${i ? `Si aprono le unità 1–${i + 1}` : 'Si apre l’unità 1'}; si riparte da «${esc(UNITS[i + 1].title)}»</span></span></button>`).join('')}</div>`;
}
function drawOnb() {
  onb = onb || { step: 0, name: S.name || '', place: '', goal: S.goal, accents: S.settings.accents };
  const steps = `<div class="steps" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= onb.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let h = `<div class="onb">${steps}`;
  if (onb.step === 0) {
    h += `<div class="onb-hero">${ermes('cheer', 150)}<h1><span lang="grc">Χαῖρε!</span> Io sono Ermes.</h1><p>Il messaggero degli dèi, protettore dei viaggiatori e degli interpreti. Ti guido nel greco, una lezione alla volta: per cominciare, punta a dieci minuti al giorno.</p></div>
      <div class="card field"><label for="nm">Come ti chiami? <span class="muted">(facoltativo)</span></label><input id="nm" class="typed" maxlength="24" autocomplete="off" value="${esc(onb.name)}" placeholder="Nome o soprannome"><p class="note">Tutto resta su questo dispositivo: nessun account, nessun dato inviato a nessuno.</p></div>
      <button class="btn big block" data-act="onbNext">Cominciamo</button>
      <button class="linkbtn" data-act="restoreSheet">Hai già usato Hermeneus? Ripristina i progressi</button>`;
  } else if (onb.step === 1) {
    h += say('Dove sei arrivato con il programma di classe? Se cominci ora, premi Avanti: si parte dall’alfabeto. Altrimenti scegli l’ultima unità studiata in classe.', 'think', 76) + placementList(onb.place, 'onbPlace') + `<div class="onb-foot"><button class="btn big block" data-act="onbNext">${onb.place ? 'Avanti' : 'Avanti: comincio da zero'}</button><button class="btn ghost block" data-act="onbBack">Indietro</button></div>`;
  } else {
    h += say('Ultime due scelte. Potrai cambiarle quando vuoi nel profilo.', 'happy', 76) + `<div class="card flush"><div class="setting wrap"><div class="grow"><b>Obiettivo giornaliero</b><span>Una lezione vale circa 60 XP</span></div><div class="seg">${[[30, 'Calmo'], [50, 'Normale'], [80, 'Serio'], [120, 'Intenso']].map(([g, l]) => `<button data-act="onbGoal" data-v="${g}" aria-pressed="${onb.goal === g}">${l}</button>`).join('')}</div></div>
      <div class="setting"><div class="grow"><b>Modalità graduale</b><span>All’inizio è più sereno: accenti, spiriti e forma di οὐ/ἐκ vengono segnalati ma non contano come errori (valgono qualche punto in meno). Lo iota sottoscritto conta sempre.</span></div><label class="switch"><input type="checkbox" id="onbAcc" ${onb.accents === 'lenient' ? 'checked' : ''} aria-label="Modalità graduale"><i></i></label></div></div>
      <button class="btn big block" data-act="onbDone">Iniziamo il viaggio</button>`;
  }
  h += `${onb.step === 2 ? '<button class="btn ghost block" data-act="onbBack">Indietro</button>' : ''}</div>`;
  $('#app').innerHTML = h;
  window.scrollTo(0, 0);
}
function placementSheet() {
  const cu = FLAT[currentIdx()];
  openSheet('Posizione nel percorso', say(`Ora sei a «${esc(cu.unit.title)}». Scegli fin dove hai studiato in classe: le unità fino a lì si aprono, le stelle già guadagnate restano.`, 'think', 64) + placementList(null, 'setPlace'));
}
/* ---------- Installazione ---------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); deferredPrompt = ev; });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('Hermeneus è installata.'); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installFlow() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; render(); }); return; }
  if (isIOS()) { showModal(`${ermes('happy', 80)}<h2>Installa su iPhone o iPad</h2><ol><li>Apri questa pagina con <b>Safari</b>.</li><li>Tocca <b>Condividi</b> in basso.</li><li>Scegli <b>Aggiungi alla schermata Home</b>.</li><li>Tocca <b>Aggiungi</b>: l’icona di Hermeneus comparirà tra le app.</li></ol><button class="btn block" data-act="closeModal">Ho capito</button>`); return; }
  showModal(`${ermes('happy', 80)}<h2>Installa l’app</h2><p>Su Android apri il menu del browser (⋮) e scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>. Sul computer usa l’icona di installazione nella barra dell’indirizzo.</p>${SITE ? '' : '<p class="note">L’installazione richiede la versione pubblicata sul sito; questo file si apre comunque in qualunque browser, anche senza rete.</p>'}<button class="btn block" data-act="closeModal">Ho capito</button>`);
}
/* ---------- Azioni ---------- */
function hint() {
  const s = SES.cur.it.s;
  const toks = tokensOf(s);
  const verb = toks.find((t) => t && t.a && t.a.e.k === 'v' && t.a.m && !['inf', 'part'].includes(t.a.m));
  const subj = toks.find((t) => t && t.a && ['n', 'p'].includes(t.a.e.k) && t.a.c === 'nom');
  let txt = '';
  if (verb) txt += `Il verbo è ${gr(verb.a.f)}: ${esc(verb.a.d)} di ${gr(verb.a.e.head || verb.a.e.lemma)} («${esc(verb.a.e.m)}»). `;
  if (subj) txt += `Il soggetto è ${gr(subj.a.f)}. `;
  if (!txt) txt = esc(s.tip || 'Parti dal nome con l’articolo: il caso dell’articolo ti dice la funzione.');
  $('#aux').innerHTML = say(txt, 'think', 56);
}
function rerenderKeep(focusSel) { const y = window.scrollY; render(); window.scrollTo(0, y); const b = focusSel && $(focusSel); if (b) b.focus({ preventScroll: true }); }
const ACT = {
  tab: (el) => { VIEW = el.dataset.v; openNode = null; render(); window.scrollTo(0, 0); const m = $('#main'); if (m) m.focus({ preventScroll: true }); },
  jump: () => scrollToCurrent(),
  node: (el) => { const i = +el.dataset.i; openNode = openNode === i ? null : i; rerenderKeep(`.node[data-i="${i}"]`); },
  startLesson: (el) => { openNode = null; startLesson(+el.dataset.i); },
  startLessonTeach: (el) => { openNode = null; startLesson(+el.dataset.i, { teach: true }); },
  unlockUnit: (el) => { const ui = +el.dataset.u; askConfirm(`Aprire «${UNITS[ui].title}»? Fallo se l’hai già studiata in classe.`, 'Apri', () => { S.course.unlocked = Math.max(S.course.unlocked, firstLessonIdx(ui)); syncTopics(); save(); openNode = null; render(); setTimeout(scrollToCurrent, 60); }); },
  goUnit: (el) => { VIEW = 'path'; render(); const u = $('#unit-' + el.dataset.u); if (u) u.scrollIntoView({ block: 'start' }); },
  practice: (el) => startPractice(el.dataset.m),
  pracUnit: (el) => { S.prac.unit = el.dataset.u; save(); rerenderKeep(`[data-act="pracUnit"][data-u="${el.dataset.u}"]`); },
  pracLevel: (el) => { S.prac.level = el.dataset.v; save(); rerenderKeep(`[data-act="pracLevel"][data-v="${el.dataset.v}"]`); },
  pracType: (el) => { S.prac.type = el.dataset.v; save(); rerenderKeep(`[data-act="pracType"][data-v="${el.dataset.v}"]`); },
  topic: (el) => { VIEW = 'topic:' + el.dataset.t; openNode = null; render(); window.scrollTo(0, 0); },
  quit: () => { const go = () => { const y = SES ? SES.backY : 0; SES = null; closeOverlay(); render(); window.scrollTo(0, y); }; if (SES && SES.i > 0 && !SES.done) askConfirm('Uscire dalla lezione? Le risposte date restano nelle statistiche e gli errori da ripassare sono salvati, ma punti e stelle si guadagnano solo arrivando alla fine: la lezione ricomincerà da capo.', 'Esci', go, true, 'sad'); else go(); },
  modalOk: () => { const i = $('#mdIn'); const v = i ? i.value : true; const cb = modalCb; modalCb = null; closeModal(); if (cb) cb(v); },
  check: () => doCheck(),
  next: () => { SES.i++; renderItem(); },
  retry: () => { const i = SES.idx; SES = null; closeOverlay(); startLesson(i, { teach: false }); },
  startReview: () => { SES = null; closeOverlay(); startPractice('review'); },
  endSession: () => endSession(),
  tile: (el) => { const c = SES.cur; if (c.answered) return; const k = +el.dataset.k; if (c.chosen.includes(k)) return; c.chosen.push(k); sfx.tap(); refreshAnswer(); },
  untile: (el) => { const c = SES.cur; if (c.answered) return; c.chosen.splice(+el.dataset.j, 1); refreshAnswer(); },
  pick: (el) => pickOption(+el.dataset.k),
  mL: (el) => { const c = SES.cur; if (c.answered || el.disabled) return; $$('[data-act="mL"]').forEach((b) => b.classList.remove('sel')); el.classList.add('sel'); c.selL = +el.dataset.i; sfx.tap(); matchStep(); },
  mR: (el) => { const c = SES.cur; if (c.answered || el.disabled) return; $$('[data-act="mR"]').forEach((b) => b.classList.remove('sel')); el.classList.add('sel'); c.selR = +el.dataset.i; sfx.tap(); matchStep(); },
  self: (el) => { const c = SES.cur; const d = c.selfData; c.answered = false; finalize({ ok: el.dataset.v === '1', sol: d.sol, given: d.ans, typed: true, self: true }); },
  toggleInput: (el) => { const c = SES.cur; if (c.answered) return; c.inputMode = c.inputMode === 'tiles' ? 'keys' : 'tiles'; c.chosen = []; $('#ansWrap').innerHTML = answerArea(c.it); el.outerHTML = inputToggle(); refreshAnswer(); const t = $('#typed'); if (t) t.focus({ preventScroll: true }); },
  word: (el) => { const it = SES && SES.cur && SES.cur.it; const s = it && it.s; if (!s) return; const tok = tokensOf(s)[+el.dataset.i]; if (tok) wordPop(el, tok); },
  speak: () => speak(SES.cur.it.s.gr),
  speakSent: () => speak(SES.cur.it.s.gr),
  speakForm: () => speak(SES.cur.it.form || SES.cur.it.word),
  speakText: (el) => speak(el.dataset.w),
  method: (el) => { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', on); $$('#ovBody .w.vb').forEach((w) => w.classList.toggle('verb', on)); $('#aux').innerHTML = on ? say(`I verbi sono evidenziati: come primo orientamento, ogni verbo di modo finito regge una proposizione. Poi cerca il soggetto al nominativo e l’oggetto all’accusativo. <button class="tool" data-act="methodSheet">${I.method}Tutti i passi</button>`, 'think', 56) : ''; },
  methodSheet: () => methodSheet(),
  hint: () => hint(),
  theory: (el) => theorySheet(el.dataset.t),
  analysis: () => analysisSheet(SES.cur.it.s),
  paradigm: (el) => { closePop(); paradigmSheet(E.LEX[+el.dataset.e]); },
  closeSheet: () => closeSheet(),
  closeModal: () => closeModal(),
  kb: (el) => { const t = kbField(el); if (!t || t.readOnly) return; insertText(t, kbUpper ? el.dataset.k.toUpperCase() : el.dataset.k); kbUpper = false; kbChanged(t); },
  kbd: (el) => { const t = kbField(el); if (!t || t.readOnly) return; applyMark(t, el.dataset.m); },
  kbx: (el) => { const t = kbField(el); if (!t || t.readOnly) return; const a = t.selectionStart ?? t.value.length; const chars = [...t.value.slice(0, a)]; chars.pop(); t.value = chars.join('') + t.value.slice(a); normalizeTyped(t, chars.join('').length); kbChanged(t); },
  kbCoachOk: () => { S.coach.kbd = true; save(); const c = $('#kbCoach'); if (c) c.remove(); const t = $('#typed') || $('#q'); if (t) t.focus({ preventScroll: true }); },
  qKbd: () => { qKbOpen = !qKbOpen; syncQKbd(); const q = $('#q'); if (q) q.focus({ preventScroll: true }); },
  kbcase: () => { kbUpper = !kbUpper; toast(kbUpper ? 'Prossima lettera maiuscola.' : 'Minuscole.'); },
  placement: () => placementSheet(),
  setPlace: (el) => {
    const before = S.course.unlocked, u = el.dataset.u || null;
    const apply = () => { placeAt(u); save(); closeSheet(); render(); window.scrollTo(0, 0); toast('Percorso aggiornato.'); };
    const ui = u ? unitIdx(u) : -1;
    const target = ui < 0 ? 0 : Math.min(FLAT.length - 1, lastLessonIdx(ui) + 1);
    if (target < before) { closeSheet(); askConfirm(ui < 0 ? 'Ricominciare dall’alfabeto? Le unità successive si richiudono; stelle e punti restano salvati.' : `Tornare a «${UNITS[Math.min(UNITS.length - 1, ui + 1)].title}»? Le unità successive si richiudono; stelle e punti restano salvati.`, 'Conferma', apply); }
    else apply();
  },
  goal: (el) => { S.goal = +el.dataset.v; save(); render(); },
  theme: (el) => { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  install: () => installFlow(),
  rename: () => askText('Il tuo nome (facoltativo)', S.name, (n) => { S.name = String(n).trim().slice(0, 24); save(); render(); }),
  saveCode: () => { S.backupAt = Date.now(); save(); codeSheet('save'); },
  restoreSheet: () => codeSheet('restore'),
  copyCode: () => {
    const el = $('#savecode'); if (!el) return;
    const done = () => toast('Codice copiato.');
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(el); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); toast('Codice selezionato: copialo con Copia.'); };
    try { navigator.clipboard.writeText(el.textContent.trim()).then(done, fallback); } catch (e) { fallback(); }
  },
  restoreCode: () => {
    const v = ($('#codeIn') || {}).value || '';
    const msg = $('#codeMsg');
    let part;
    try { part = SV.decode(v, LESSON_IDS(), BADGE_IDS()); } catch (e) { if (msg) { msg.textContent = e.message; msg.classList.add('bad'); } return; }
    askReplace('del codice', () => applyRestore(part));
  },
  export: () => { S.backupAt = Date.now(); save(); downloadJSON(S, 'hermeneus-progressi-' + dayKey() + '.json'); },
  origDownload: () => { const o = originals(); if (o.length) downloadJSON(o, 'hermeneus-copia-originale-' + dayKey() + '.json'); },
  origDelete: () => askConfirm('Eliminare la copia originale del salvataggio guasto?', 'Elimina', () => { try { localStorage.removeItem(ORIGINALS); } catch (e) { /* ignora */ } render(); }, true),
  import: () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json,.json'; i.onchange = () => { const f = i.files[0]; if (f) f.text().then(importFile, () => refuse('File', ['non si riesce a leggere'])); }; i.click(); },
  reset: () => askConfirm('Cancellare tutti i progressi da questo dispositivo?', 'Cancella', () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ } S = DEFAULT(); onb = null; applyTheme(); render(); }, true, 'sad'),
  search: () => searchForm(),
  flashShow: () => { flashCur.shown = true; drawFlash(); },
  flash: (el) => { srs(flashCur.e, el.dataset.v === '1'); save(); bindWords(); },
  onbNext: () => { if (onb.step === 0) onb.name = ($('#nm').value || '').trim().slice(0, 24); onb.step++; drawOnb(); },
  onbBack: () => { onb.step--; drawOnb(); },
  onbPlace: (el) => { onb.place = el.dataset.u; drawOnb(); const b = $(`[data-act="onbPlace"][data-u="${onb.place}"]`); if (b) b.focus(); },
  onbGoal: (el) => { onb.goal = +el.dataset.v; drawOnb(); },
  onbDone: () => {
    const acc = $('#onbAcc');
    S.name = onb.name; S.goal = onb.goal; S.settings.accents = acc && acc.checked ? 'lenient' : 'strict';
    placeAt(onb.place || null);
    S.onboarded = true; save(); onb = null; VIEW = 'path'; render(); window.scrollTo(0, 0);
  },
};

/* ---------- Eventi ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  const pop = $('#pop');
  if (pop && !ev.target.closest('#pop') && !(el && el.dataset.act === 'word')) closePop();
  if (openNode != null && !ev.target.closest('.node-wrap') && !$('#modal') && !$('#ov') && !el) { openNode = null; rerenderKeep(); }
  if (!el || el.disabled) return;
  if (ACT[el.dataset.act]) { ev.preventDefault(); ACT[el.dataset.act](el); }
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.id === 'pracUnit') { S.prac.unit = t.value; save(); return; }
  if (!t.dataset.set) return;
  const k = t.dataset.set;
  if (k === 'accents') S.settings.accents = t.checked ? 'lenient' : 'strict';
  else if (k === 'input') S.settings.input = t.checked ? 'keys' : 'tiles';
  else if (k === 'pracNarrow') S.prac.wide = !t.checked;
  else S.settings[k] = t.checked;
  save();
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') { if ($('#pop')) closePop(); else if ($('#modal')) closeModal(); else if ($('#sheet')) closeSheet(); else if (SES && $('#ov')) act('quit'); else if (openNode != null) { openNode = null; rerenderKeep(); } return; }
  if (ev.target && ev.target.id === 'typed') {
    onTypedKey(ev);
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); if (SES && SES.cur && SES.cur.answered) { if ($('#nextBtn')) act('next'); } else act('check'); }
    return;
  }
  if (!SES || !$('#ov') || $('#modal') || $('#sheet')) return;
  if (ev.target.closest && ev.target.closest('input,textarea')) return;
  if (/^[1-5]$/.test(ev.key) && SES.cur && !SES.cur.answered && $$('#ovBody .opt').length >= +ev.key) { ev.preventDefault(); pickOption(+ev.key - 1); return; }
  if (ev.key === 'Enter' && !ev.target.closest('button')) {
    ev.preventDefault();
    if (SES.done) act('endSession');
    else if ((SES.cur.answered && $('#nextBtn')) || SES.cur.it.type === 'teach') act('next');
    else if (!SES.cur.answered) act('check');
  }
});
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if ((t.id === 'typed' || t.id === 'q') && t.classList.contains('gr')) normalizeTyped(t, t.selectionStart ?? t.value.length);
  if (t.id === 'typed') { const b = $('#checkBtn'); if (b) b.disabled = !t.value.trim(); }
});
window.addEventListener('resize', closePop);
window.addEventListener('scroll', closePop, true);
function updateJump() {
  const j = $('#jump'), n = $('.node.current');
  if (!j || !n) return;
  const r = n.getBoundingClientRect();
  const off = r.bottom < 70 || r.top > innerHeight - 90;
  // in cima c'è già la scheda «Continua»: il pulsante serve solo dopo aver scorso il percorso
  const res = $('.resume');
  j.hidden = !off || (res && res.getBoundingClientRect().bottom > 0);
  j.classList.toggle('up', r.bottom < 70);
}
window.addEventListener('scroll', updateJump, { passive: true });

/* ---------- Avvio ---------- */
function warmLoop() {
  if (E.isReady()) return;
  const step = () => { E.warm(12); if (!E.isReady()) (window.requestIdleCallback || ((f) => setTimeout(f, 30)))(step); };
  setTimeout(step, 800);
}
function boot() {
  load();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* ignora */ }
  applyTheme();
  const mq = matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', applyTheme);
  render();
  flushToasts();
  warmLoop();
  try { if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) { /* ignora */ }
  if (SITE && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
// per la verifica automatica nel browser
window.HermApp = { S: () => S, cur: () => SES && SES.cur, startLesson, startPractice, FLAT, ermes };
boot();
})();
