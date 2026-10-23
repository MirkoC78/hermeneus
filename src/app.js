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
function normIt(s) {
  return String(s).toLowerCase().replace(/[’`´]/g, "'").normalize('NFD').replace(/[\u0300-\u036F]/g, '')
    .replace(/'/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}
const sim = (a, b) => (!a && !b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));
const simLoose = (a, b) => Math.max(sim(a, b), sim(a.split(' ').sort().join(' '), b.split(' ').sort().join(' ')) * 0.96);

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
  match: svg('<path d="M4 7h6M4 12h6M4 17h6M14 7h6M14 12h6M14 17h6"/>'),
};
const MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="16" fill="#2457A3"/><path d="M12 50h40M12 50v-7h7v-4h-4v-4h9v8h8v-8h9v4h-4v4h7v7" fill="none" stroke="#E3B04B" stroke-width="3" stroke-linejoin="round"/><text x="32" y="33" text-anchor="middle" font-family="GFS Didot, Gentium Plus, serif" font-size="30" fill="#FDF6E3">Ἑ</text></svg>';

/* ---------- Ermes, la guida ---------- */
// umori: idle, happy, think, sad, cheer
function ermes(mood = 'idle', size = 96) {
  const eyes = {
    idle: '<ellipse cx="41" cy="60" rx="3.6" ry="4.6" fill="#1A2333"/><ellipse cx="59" cy="60" rx="3.6" ry="4.6" fill="#1A2333"/><circle cx="42.2" cy="58.4" r="1.2" fill="#fff"/><circle cx="60.2" cy="58.4" r="1.2" fill="#fff"/>',
    happy: '<path d="M36.5 61c1.6-3 7-3 8.6 0M54.9 61c1.6-3 7-3 8.6 0" stroke="#1A2333" stroke-width="3" fill="none" stroke-linecap="round"/>',
    cheer: '<path d="M36.5 61c1.6-3.6 7-3.6 8.6 0M54.9 61c1.6-3.6 7-3.6 8.6 0" stroke="#1A2333" stroke-width="3" fill="none" stroke-linecap="round"/>',
    think: '<ellipse cx="41" cy="61" rx="3.4" ry="4.2" fill="#1A2333"/><ellipse cx="59" cy="61" rx="3.4" ry="4.2" fill="#1A2333"/><path d="M54 53.5l9-2" stroke="#1A2333" stroke-width="2.6" stroke-linecap="round"/>',
    sad: '<ellipse cx="41" cy="62" rx="3.4" ry="4.2" fill="#1A2333"/><ellipse cx="59" cy="62" rx="3.4" ry="4.2" fill="#1A2333"/><path d="M36 54.5l8 2.4M64 54.5l-8 2.4" stroke="#1A2333" stroke-width="2.6" stroke-linecap="round"/>',
  }[mood] || '';
  const mouth = {
    idle: '<path d="M44 72c3.5 3 8.5 3 12 0" stroke="#7A3B2A" stroke-width="3" fill="none" stroke-linecap="round"/>',
    happy: '<path d="M42 70c4 6 12 6 16 0z" fill="#7A3B2A"/><path d="M45 73.5c3 1.8 7 1.8 10 0" stroke="#E98B7C" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    cheer: '<path d="M40 69c5 9 15 9 20 0z" fill="#7A3B2A"/><path d="M44 74.5c3.5 2.2 8.5 2.2 12 0" stroke="#E98B7C" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
    think: '<path d="M46 74h8" stroke="#7A3B2A" stroke-width="3" stroke-linecap="round"/>',
    sad: '<path d="M44 76c3.5-3 8.5-3 12 0" stroke="#7A3B2A" stroke-width="3" fill="none" stroke-linecap="round"/>',
  }[mood] || '';
  const cls = mood === 'cheer' ? 'cheer' : 'bob';
  return `<svg class="ermes ${cls}" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Ermes, la tua guida">
    <path d="M28 98c2-14 11-21 22-21s20 7 22 21z" fill="#2457A3"/><path d="M50 77l-9 6 9 6 9-6z" fill="#E3B04B"/>
    <circle cx="50" cy="62" r="23" fill="#F2CBA6"/><circle cx="34" cy="68" r="4" fill="#F0A58F" opacity=".55"/><circle cx="66" cy="68" r="4" fill="#F0A58F" opacity=".55"/>
    ${eyes}${mouth}
    <g class="wing l"><path d="M22 40c-9-3-15-1-18 4 6 0 10 1 13 3-5 0-8 2-10 5 6-1 11-1 15 1z" fill="#FFFFFF" stroke="#C9D6EA" stroke-width="1.5"/></g>
    <g class="wing r"><path d="M78 40c9-3 15-1 18 4-6 0-10 1-13 3 5 0 8 2 10 5-6-1-11-1-15 1z" fill="#FFFFFF" stroke="#C9D6EA" stroke-width="1.5"/></g>
    <ellipse cx="50" cy="44" rx="33" ry="7.5" fill="#173F7C"/><path d="M30 44c0-13 9-21 20-21s20 8 20 21z" fill="#2457A3"/><path d="M31 41h38" stroke="#E3B04B" stroke-width="3.4"/>
  </svg>`;
}
const say = (text, mood = 'happy', size = 76) => `<div class="say">${ermes(mood, size)}<div class="bubble">${text}</div></div>`;

/* ---------- Stato ---------- */
const KEY = 'hermeneus.v1';
const DEFAULT = () => ({
  v: 2, onboarded: false, name: '', topics: [], goal: 50, xp: 0, days: {}, streak: 0, lastDay: null, shields: 0,
  mastery: {}, mistakes: [], badges: {}, vocab: {}, recent: [], genSaved: [],
  course: { unlocked: 0, stars: {}, times: {} },
  prac: { unit: null, type: 'misto', wide: false },
  stats: { answered: 0, correct: 0, sessions: 0, perfect: 0, forms: 0, typedOK: 0, translated: 0, genSeen: 0, types: {}, clearedReview: 0, accentOK: 0, lessons: 0 },
  settings: { sound: true, voice: true, input: 'tiles', accents: 'lenient', theme: 'auto', gen: true, online: true },
});
let S = DEFAULT();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    const def = DEFAULT();
    S = Object.assign(def, d, { stats: Object.assign(def.stats, d.stats || {}), settings: Object.assign(def.settings, d.settings || {}), course: Object.assign(def.course, d.course || {}), prac: Object.assign(def.prac, d.prac || {}) });
    // dalla versione 1: gli argomenti scelti diventano unità aperte del percorso
    if (d.v !== 2 && d.onboarded) { placeAt(ORDER.filter((t) => (d.topics || []).includes(t)).pop() || null); S.v = 2; }
    syncTopics();
  } catch (e) { /* archiviazione non disponibile */ }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } }
function applyTheme() {
  const r = document.documentElement;
  if (S.settings.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.settings.theme);
  const dark = S.settings.theme === 'dark' || (S.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]');
  if (m) m.content = dark ? '#0E1420' : '#F4EFE3';
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
  const cols = ['#2457A3', '#E3B04B', '#A6482C', '#24776A', '#7FA8EC', '#3CA35E'];
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
    const unit = mode === 'alfabeto' ? 'alf' : p.unit && T.has(p.unit) ? p.unit : S.topics[S.topics.length - 1];
    items = LS.buildPractice({ T, focus: unit, mix: MIXES[mode] || MIXES[p.type] || MIXES.misto, wide: p.wide, genShare: mode === 'nuove' ? 1 : 0.5, gen: S.settings.gen, avoid: S.recent });
  }
  if (!items.length) { toast(mode === 'review' ? 'Nessun errore da ripassare: ottimo!' : 'Non ci sono ancora esercizi per questa scelta.'); return; }
  begin({ kind: 'practice', mode, items, title: 'Palestra' });
}
function begin(o) {
  SES = Object.assign({ i: 0, combo: 0, best: 0, xp: 0, ok: 0, ko: 0, start: Date.now(), cur: null, done: false, requeued: 0, shownTheory: {} }, o);
  openOverlay();
  renderItem();
}
function openOverlay() {
  closeOverlay();
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', SES.title || 'Lezione');
  ov.innerHTML = `<div class="ov-inner"><div class="ov-head"><button class="iconbtn" data-act="quit" aria-label="Chiudi la lezione">${I.close}</button><div class="progress" role="progressbar" aria-label="Avanzamento" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="combo" id="combo" aria-live="polite"></div></div><div class="ov-body" id="ovBody"></div></div><div class="ov-foot" id="ovFootWrap"><div class="foot-in" id="ovFoot"></div></div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
}
function closeOverlay() { const o = $('#ov'); if (o) o.remove(); document.body.style.overflow = ''; closePop(); }
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
  SES.cur = { it, answered: false, chosen: [], picked: null, inputMode: S.settings.input === 'keys' ? 'keys' : 'tiles' };
  const [ico, label] = KIND[it.type] || [I.book, ''];
  let html = it.type === 'teach' ? '' : `<div class="kind">${ico}<span>${it.quiz ? 'Verifica veloce' : label}</span>${it.review ? ' <span class="tag">ripasso</span>' : ''}${it.requeued ? ' <span class="tag">riproviamo</span>' : ''}${it.s && it.s.src === 'gen' ? ' <span class="tag">frase nuova</span>' : ''}</div>`;
  html += ({
    teach: renderTeach, gr_it: renderGrIt, it_gr: renderItGr, analizza: renderAnalizza, scrivi: renderScrivi, completa: renderCompleta,
    lessico: renderLessico, alfabeto: renderAlfabeto, abbina: renderAbbina, accorda: renderAccorda, lettera: renderLettera, accento: renderAccento,
  }[it.type] || (() => ''))(it);
  const body = $('#ovBody');
  body.innerHTML = html;
  body.classList.remove('fx-in'); void body.offsetWidth; body.classList.add('fx-in');
  $('#ovFootWrap').className = 'ov-foot';
  renderFoot();
  if (it.type === 'gr_it' || it.type === 'it_gr') refreshAnswer();
  const t = $('#typed'); if (t && !matchMedia('(pointer: coarse)').matches) t.focus({ preventScroll: true });
  $('.ov-inner').scrollTop = 0;
}
function renderFoot() {
  const it = SES.cur.it;
  if (it.type === 'teach') { $('#ovFoot').innerHTML = `<div class="foot-row"><button class="btn block" data-act="next" id="nextBtn">Continua</button></div>`; setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 60); return; }
  if (it.type === 'abbina') { $('#ovFoot').innerHTML = `<p class="note" style="text-align:center;margin:8px 0">Tocca una parola greca e poi il suo significato.</p>`; return; }
  $('#ovFoot').innerHTML = `<div class="foot-row"><button class="btn block" data-act="check" id="checkBtn" ${CHOICE.includes(it.type) ? 'disabled' : ''}>Controlla</button></div>`;
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
  if (c.intro && f) h += `<p class="kind">${I.road}<span>Unità ${f.ui + 1}</span></p><h1 style="margin-top:6px">${esc(f.unit.title)}</h1>`;
  if (c.say) h += say(esc(c.say), c.intro ? 'cheer' : 'happy', c.intro ? 110 : 80);
  if (c.p) h += `<div class="card" style="font-size:1.05rem">${grSpans(c.p)}</div>`;
  h += teachTable(c);
  if (c.ex) h += `<div class="ex"><span class="gr" lang="grc">${esc(c.ex[0])}</span><span class="muted">${esc(c.ex[1])}</span><div class="tools" style="margin:8px 0 0"><button class="tool" data-act="speakText" data-w="${esc(c.ex[0])}">${I.sound}Ascolta</button></div></div>`;
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
  return `<p class="greek-line" lang="grc">${h}</p>${fresh.size ? '<p class="note"><span class="tag new">nuova</span> La parola evidenziata è nuova: toccala per scoprire che cosa significa.</p>' : ''}`;
}
function toolsRow(it, extra) {
  return `<div class="tools">${extra}<button class="tool" data-act="hint">${I.bulb}Aiuto</button><button class="tool" data-act="toggleInput">${SES.cur.inputMode === 'tiles' ? I.keys + 'Scrivi' : I.tiles + 'Tessere'}</button></div><div id="aux"></div>`;
}
function renderGrIt(it) {
  return `<p class="prompt">Traduci in italiano</p>${greekLine(it.s, { newWords: it.newWords })}
    ${toolsRow(it, `<button class="tool" data-act="speak">${I.sound}Ascolta</button><button class="tool" data-act="method" aria-pressed="false">${I.method}Metodo</button>`)}
    <div id="ansWrap">${answerArea(it)}</div>`;
}
function renderItGr(it) {
  const nw = (it.newWords || []).length ? `<p class="note"><span class="tag new">nuova</span> Ti servirà una parola nuova: ${it.newWords.map((l) => { const e = LS.entryOf(l); return gr(e ? e.head || e.lemma : l) + (e ? ' = ' + esc(e.m) : ''); }).join(', ')}.</p>` : '';
  return `<p class="prompt">Traduci in greco</p>${say(esc(it.s.it[0]), 'idle', 64)}${nw}
    ${toolsRow(it, '')}
    <div id="ansWrap">${answerArea(it)}</div>`;
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
  for (const t of shuffle(toks)) {
    if (dis.length >= 3) break;
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
  for (const w of shuffle(IT_FUNC)) { if (extra.length >= 1) break; if (!have.has(w)) { extra.push(w); have.add(w); } }
  for (const w of pool) { if (extra.length >= 3) break; if (!have.has(w.toLowerCase())) { extra.push(w.toLowerCase()); have.add(w.toLowerCase()); } }
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
  return `<p class="prompt">Che forma è? <span class="muted" style="font-weight:400;font-size:1rem">(${gr(it.e.head || it.e.lemma)})</span></p><p class="bigform" lang="grc">${esc(it.form)}</p>
    <div class="tools" style="justify-content:center"><button class="tool" data-act="speakForm">${I.sound}Ascolta</button></div>${optsHtml(it.options)}`;
}
function renderScrivi(it) {
  return `<p class="prompt">Scrivi la forma</p>${say(`${gr(it.e.head || it.e.lemma)}<br><b>${esc(it.desc)}</b>`, 'think', 64)}
    <label class="sr" for="typed">La forma in greco</label><input id="typed" class="typed gr" lang="grc" inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrivi in greco…">${keyboardHtml()}`;
}
function renderCompleta(it) {
  return `<p class="prompt">Completa la frase</p>${greekLine(it.s, { blank: it.idx })}<p class="muted">${esc(it.s.it[0])}</p>${optsHtml(it.options, esc, true, true)}`;
}
function renderLessico(it) {
  if (it.reverse) return `<p class="prompt">Come si dice in greco «${esc(it.e.m.split(/[,;(]/)[0].trim())}»?</p>${optsHtml(it.options, (o) => esc(o.head || o.lemma), true)}`;
  return `<p class="prompt">Che cosa significa?</p><p class="bigform" lang="grc">${esc(it.e.head || it.e.lemma)}</p>${optsHtml(it.options, (o) => esc(o.m))}`;
}
function renderAlfabeto(it) {
  return `<p class="prompt">Come si trascrive?</p><p class="bigform" lang="grc">${esc(it.word)}</p>
    <div class="tools" style="justify-content:center"><button class="tool" data-act="speakForm">${I.sound}Ascolta</button></div>${optsHtml(it.options, esc, false, true)}`;
}
function renderLettera(it) {
  if (it.reverse) return `<p class="prompt">Quale lettera è «${esc(it.prompt)}»?</p>${optsHtml(it.options, esc, true, true)}`;
  return `<p class="prompt">Come si chiama questa lettera?</p><p class="biglet" lang="grc">${esc(it.prompt)}</p>${optsHtml(it.options, esc, false, true)}`;
}
function renderAccento(it) {
  return `<p class="prompt">Com’è accentata questa parola?</p><p class="bigform" lang="grc">${esc(it.word)}</p>${optsHtml(it.options, esc, false, true)}`;
}
function renderAccorda(it) {
  const slot = '<span class="slot"> ? </span>';
  const phrase = it.mode === 'adj' ? `${esc(it.art)} ${slot} ${esc(it.noun.f)}` : `${slot} ${esc(it.noun.f)}`;
  return `<p class="prompt">${it.mode === 'adj' ? 'Scegli la forma dell’aggettivo che concorda' : 'Scegli l’articolo giusto'}</p><p class="phrase" lang="grc">${phrase}</p><p class="muted" style="text-align:center">${esc(it.noun.e ? it.noun.e.m : '')}</p>${optsHtml(it.options, esc, true, true)}`;
}
function renderAbbina(it) {
  const c = SES.cur;
  c.left = shuffle(it.pairs.map((p, i) => i)); c.right = shuffle(it.pairs.map((p, i) => i)); c.matched = new Set(); c.mist = 0; c.selL = null; c.selR = null;
  return `<p class="prompt">Abbina le coppie</p><div class="match"><div class="col">${c.left.map((i) => `<button class="gr" lang="grc" data-act="mL" data-i="${i}">${esc(it.pairs[i].gr)}</button>`).join('')}</div><div class="col">${c.right.map((i) => `<button data-act="mR" data-i="${i}">${esc(it.pairs[i].it)}</button>`).join('')}</div></div>`;
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
function keyboardHtml() {
  return `<div class="kb" role="group" aria-label="Tastiera greca">${KB_ROWS.map((r) => `<div class="kb-row">${r.map((l) => `<button type="button" data-act="kb" data-k="${l}" aria-label="${l}">${l}</button>`).join('')}</div>`).join('')}
    <div class="kb-row">${DIA.map(([m, s, n]) => `<button type="button" class="dia" data-act="kbd" data-m="${m}" aria-label="${n}">${s}</button>`).join('')}<button type="button" class="del" data-act="kbx" aria-label="Cancella">⌫</button></div>
    <div class="kb-row"><button type="button" class="wide" data-act="kb" data-k=" " aria-label="Spazio">spazio</button><button type="button" class="wide" data-act="kbcase" aria-label="Maiuscola">Maiusc.</button></div></div>
    <p class="kb-hint">Dal computer: lettere latine → greche (h = η, w = ω, q = θ, c = ξ, y = ψ, x = χ, f = φ); ) dolce, ( aspro, / acuto, \\ grave, = circonflesso, | iota sottoscritto.</p>`;
}
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
function bestItalianMatch(s, ans) {
  const a = normIt(ans);
  let best = 0, bestRef = s.it[0];
  for (const r of s.it) { const v = simLoose(a, normIt(r)); if (v > best) { best = v; bestRef = r; } }
  return { best, bestRef };
}
function checkTypedGreek(refTokens, typed) {
  const lenient = S.settings.accents === 'lenient';
  const words = SN.render(refTokens, { words: true });
  const ref = refTokens.map((t, i) => ({ t, w: words[i] })).filter((x) => x.t && !x.t.p);
  const ans = SN.splitWords(typed).filter((w) => !SN.PUNCT.test(w));
  if (ans.length !== ref.length) return { ok: false, accent: [] };
  const variants = (x) => {
    const v = new Set([x.w, x.t.f]);
    if (x.t.nu) { v.add(x.w.replace(/ν$/, '')); v.add(x.t.f + 'ν'); }
    if (x.t.lemma === 'οὐ') ['οὐ', 'οὐκ', 'οὐχ', 'οὔ'].forEach((q) => v.add(q));
    if (x.t.lemma === 'ἐκ') ['ἐκ', 'ἐξ'].forEach((q) => v.add(q));
    if (x.t.encl) v.add(G.stripAccents(x.w));
    return [...v];
  };
  const V = ref.map(variants);
  const VB = V.map((vs) => vs.map((x) => G.bare(x)));
  const cand = ans.map((w) => ref.map((_, i) => i).filter((i) => VB[i].includes(G.bare(w))));
  const used = new Array(ref.length).fill(false);
  const assign = [];
  let found = null;
  (function dfs(k) {
    if (found) return;
    if (k === ans.length) { if (SN.orderOK(refTokens, assign.map((i) => ref[i].t.f))) found = assign.slice(); return; }
    for (const i of cand[k]) { if (used[i]) continue; used[i] = true; assign.push(i); dfs(k + 1); assign.pop(); used[i] = false; if (found) return; }
  })(0);
  if (!found) return { ok: false, accent: [] };
  const twoAcc = (s) => { const L = G.parse(s); const N = G.nuclei(L); const acc = N.filter((n) => L[n.j].ac); if (acc.length === 2) L[acc[1].j].ac = ''; return G.strict(G.serialize(L)); };
  const accent = [];
  ans.forEach((w, k) => { const vs = V[found[k]]; if (!vs.some((x) => G.strict(x) === G.strict(w) || twoAcc(x) === twoAcc(w))) accent.push({ got: w, want: ref[found[k]].w }); });
  return { ok: accent.length === 0 || lenient, accent, exact: accent.length === 0 };
}
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
      const ok = it.s.it.some((r) => normIt(r) === normIt(built));
      res = { ok, sol: it.s.it[0], given: built, near: !ok && simLoose(normIt(built), normIt(it.s.it[0])) > 0.7 };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la traduzione.');
      const m = bestItalianMatch(it.s, ans);
      if (m.best >= 0.88) res = { ok: true, sol: m.bestRef, given: ans, typed: true, note: normIt(ans) !== normIt(m.bestRef) ? 'Versione di riferimento: ' + m.bestRef : '' };
      else return selfGrade(it, ans, m.bestRef);
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
      const r = checkTypedGreek(ref, ans);
      res = { ok: r.ok, sol: it.s.gr, given: ans, greek: true, typed: true, accent: r.accent, accentOnly: r.ok && !r.exact };
      if (r.ok && r.exact) S.stats.accentOK++;
    }
  } else if (it.type === 'analizza') {
    const ok = it.valid.includes(it.options[c.picked]);
    res = { ok, sol: it.correct, others: it.valid.length > 1 ? it.valid : null };
    markOptions(ok, (k) => it.valid.includes(it.options[k]));
  } else if (it.type === 'scrivi') {
    const raw = G.nfc($('#typed').value.trim());
    if (!raw) return toast('Scrivi la forma.');
    const alts = it.answers.concat(it.nu ? it.answers.map((a) => a + 'ν') : []);
    const exact = alts.some((a) => G.strict(a) === G.strict(raw));
    const loose = alts.some((a) => G.bare(a) === G.bare(raw));
    const ok = exact || (loose && S.settings.accents === 'lenient');
    res = { ok, sol: it.answers.join(' / '), greek: true, accentOnly: ok && !exact, accent: loose && !exact ? [{ got: raw, want: it.answers[0] }] : [] };
    if (exact) S.stats.accentOK++;
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
  $('#ovFoot').innerHTML = `<div class="fb">${ermes('think', 56)}<div class="fb-txt"><h3>Confronta con la soluzione</h3><p>Soluzione: <span class="sol">${esc(sol)}</span></p>${it.s.it.length > 1 ? `<p class="note">Anche: ${it.s.it.filter((x) => x !== sol).slice(0, 2).map(esc).join(' · ')}</p>` : ''}<p class="note">La tua traduzione è diversa da quelle previste: giudica tu con onestà.</p></div></div>
    <div class="foot-row"><button class="btn err" data-act="self" data-v="0">Ho sbagliato</button><button class="btn ok" data-act="self" data-v="1">Era corretta</button></div>`;
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
    gained = (XP_BASE[it.type] || 6) * (res.accentOnly ? 0.7 : 1) + (SES.combo >= 3 ? Math.min(SES.combo, 6) * 2 : 0) + (it.s && it.s.src === 'gen' ? 2 : 0) + (res.typed ? 3 : 0);
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
  if (!m) return;
  const sig = (a) => JSON.stringify(Object.assign({}, a, { at: 0 }));
  S.mistakes = S.mistakes.filter((a) => sig(a) !== sig(m)).concat([Object.assign(m, { at: Date.now() })]).slice(-60);
}
function showFeedback(res, gained) {
  const it = SES.cur.it;
  const topic = it.topic || (it.s && it.s.focus);
  $('#ovFootWrap').className = 'ov-foot ' + (res.ok ? 'ok' : 'err');
  let body = '';
  if (res.ok) {
    body += `<h3>${res.accentOnly ? 'Giusto, ma attento ai segni!' : pick(['Ottimo!', 'Esatto!', 'Bravo!', 'Perfetto!', 'Εὖ γε!'])}</h3>`;
    if (gained) body += `<p class="note">+${gained} XP${SES.combo >= 3 ? ' · ' + SES.combo + ' di fila' : ''}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (res.others && res.others.length > 1) body += `<p class="note">Può essere anche: ${res.others.filter((o) => o !== it.options[SES.cur.picked]).map(esc).join('; ')}.</p>`;
  } else {
    body += `<h3>${res.near ? 'Quasi! La soluzione:' : 'Risposta giusta:'}</h3><p><span class="sol${res.greek ? ' gr' : ''}" ${res.greek ? 'lang="grc"' : ''}>${esc(res.sol)}</span></p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (!res.near) body += `<p class="note">${esc(pick(C.COMFORT))}</p>`;
  }
  if (res.accent && res.accent.length) body += `<p class="accent-warn">Segni diacritici: ${res.accent.slice(0, 3).map((a) => `${gr(a.got)} → ${gr(a.want)}`).join(', ')}${S.settings.accents === 'lenient' ? ' (non conta come errore)' : ''}</p>`;
  if (it.s && it.s.tip && !res.ok) body += `<p class="note">${esc(it.s.tip)}</p>`;
  const extra = [];
  if (topic && TOPIC[topic] && !res.ok) extra.push(`<button class="tool" data-act="theory" data-t="${topic}">${I.book}Teoria</button>`);
  if (it.s) extra.push(`<button class="tool" data-act="analysis">${I.lens}Analisi</button>`, `<button class="tool" data-act="speakSent">${I.sound}Ascolta</button>`);
  $('#ovFoot').innerHTML = `<div class="foot-split"><div class="fb ${res.ok ? 'ok' : 'err'}" role="status" aria-live="polite">${ermes(res.ok ? 'happy' : 'sad', 56)}<div class="fb-txt">${body}${extra.length ? `<div class="fb-extra">${extra.join('')}</div>` : ''}</div></div>
    <button class="btn ${res.ok ? 'ok' : 'err'}" data-act="next" id="nextBtn">Continua</button></div>`;
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
  $('#ovBody').innerHTML = `<div class="done-screen fx-in">${ermes(passed ? 'cheer' : 'think', 150)}<h2 ${perfect || acc >= 0.8 ? 'lang="grc"' : ''}>${esc(title)}</h2>${starRow}<p>${esc(msg)}</p>
    <div class="stats3"><div class="stat" style="--c:var(--ochre-l)"><small>XP</small><b>+${SES.xp + bonus}</b></div><div class="stat" style="--c:var(--ok-l)"><small>Precisione</small><b>${Math.round(acc * 100)}%</b></div><div class="stat" style="--c:var(--lapis)"><small>Tempo</small><b>${mins}′</b></div></div>
    <p class="note">${goalDone ? `Obiettivo di oggi raggiunto: ${todayXP()} XP.` : `Oggi ${todayXP()} di ${S.goal} XP.`}</p>
    ${rankUp ? `<div class="card">Nuovo grado: ${gr(rankOf(S.xp).r.name)} — ${esc(rankOf(S.xp).r.tr)}</div>` : ''}
    ${won.map((b) => `<div class="card">${medal(b.id, true)}<b lang="grc">${esc(b.name)}</b><div class="note">${esc(b.desc)}</div></div>`).join('')}</div>`;
  $('#ovFootWrap').className = 'ov-foot';
  const again = !passed && SES.kind === 'lesson' ? `<button class="btn ghost" data-act="retry">Riprova</button>` : S.mistakes.length && SES.kind === 'practice' && SES.mode !== 'review' ? '<button class="btn ghost" data-act="startReview">Ripassa gli errori</button>' : '';
  $('#ovFoot').innerHTML = `<div class="foot-row">${again}<button class="btn ${passed ? 'ok' : ''}" data-act="endSession">Continua</button></div>`;
  setTimeout(() => { const b = $('#ovFoot .btn:last-child'); if (b) b.focus(); }, 60);
}
function endSession() { const wasLesson = SES && SES.kind === 'lesson'; SES = null; closeOverlay(); if (wasLesson) VIEW = 'path'; render(); flushToasts(); if (wasLesson) setTimeout(scrollToCurrent, 80); }

/* ---------- Ripetizione dilazionata ---------- */
const BOX_DAYS = [0, 1, 2, 4, 8, 16];
function srs(e, ok) { const v = S.vocab[e.id] || { box: 0, due: dayKey() }; v.box = ok ? Math.min(5, v.box + 1) : 0; v.due = addDays(dayKey(), BOX_DAYS[v.box]); S.vocab[e.id] = v; }
function vocabQueue() {
  const known = LS.vocabForTopics(sel());
  const ents = E.LEX.filter((e) => ['n', 'v', 'a'].includes(e.k) && known.has(e.lemma));
  const due = ents.filter((e) => S.vocab[e.id] && S.vocab[e.id].due <= dayKey());
  const fresh = ents.filter((e) => !S.vocab[e.id]).slice(0, Math.max(0, 10 - due.length));
  return { due, fresh, all: ents };
}

/* ---------- Popover e fogli ---------- */
function closePop() { const p = $('#pop'); if (p) p.remove(); }
function wordPop(btn, tok) {
  closePop();
  const a = tok.a; if (!a) return;
  const e = a.e;
  const others = E.isReady() ? uniq(E.analyze(a.f).filter((x) => x !== a && x.key !== 'lemma').map((x) => `${x.e.head || x.e.lemma}: ${x.d}`)).filter((x) => x !== `${e.head || e.lemma}: ${a.d}`).slice(0, 4) : [];
  const p = document.createElement('div');
  p.className = 'pop'; p.id = 'pop'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Analisi della parola');
  p.innerHTML = `<h4 lang="grc">${esc(a.f)}</h4><div class="lem">${gr(e.head || e.lemma)} — ${esc(e.m)}</div><p style="margin:6px 0 0"><b>${esc(a.d)}</b></p>
    ${others.length ? `<p class="note" style="margin:4px 0 0">Altre analisi possibili:</p><ul>${others.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
    <div class="row"><button class="tool" data-act="speakText" data-w="${esc(a.f)}">${I.sound}Ascolta</button>${e.k !== 'i' && e.k !== 'art' ? `<button class="tool" data-act="paradigm" data-e="${E.LEX.indexOf(e)}">${I.table}Paradigma</button>` : ''}${S.settings.online ? `<a class="tool" href="https://it.wiktionary.org/wiki/${encodeURIComponent(e.lemma)}" target="_blank" rel="noopener noreferrer">${I.globe}Wikizionario</a>` : ''}</div>`;
  document.body.appendChild(p);
  const r = btn.getBoundingClientRect();
  const w = p.offsetWidth, h = p.offsetHeight;
  const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
  let top = r.bottom + 8;
  if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
  p.style.left = left + 'px'; p.style.top = top + 'px';
}
function openSheet(title, html) {
  closeSheet();
  const bg = document.createElement('div');
  bg.className = 'sheet-bg'; bg.id = 'sheet';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="Chiudi">${I.close}</button></div><div class="sheet-body">${html}</div></div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  setTimeout(() => { const b = $('#sheet .iconbtn'); if (b) b.focus(); }, 30);
}
function closeSheet() { const s = $('#sheet'); if (s) s.remove(); }
function showModal(html) {
  closeModal();
  const bg = document.createElement('div');
  bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeModal(); });
  document.body.appendChild(bg);
  setTimeout(() => { const b = $('#modal .btn:last-of-type') || $('#modal button'); if (b) b.focus(); }, 30);
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
let modalCb = null;
function askConfirm(text, okLabel, cb, danger, mood = 'think') { modalCb = cb; showModal(`<div style="text-align:center">${ermes(mood, 90)}</div><h2 style="text-align:center">${esc(text)}</h2><div class="foot-row" style="margin-top:16px"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn ${danger ? 'err' : ''}" data-act="modalOk">${esc(okLabel)}</button></div>`); }
function askText(label, value, cb) { modalCb = cb; showModal(`<label for="mdIn"><b>${esc(label)}</b></label><input id="mdIn" class="typed" style="margin-top:8px" maxlength="24" autocomplete="off" value="${esc(value)}"><div class="foot-row" style="margin-top:16px"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn" data-act="modalOk">Salva</button></div>`); setTimeout(() => { const i = $('#mdIn'); if (i) i.focus(); }, 40); }
function analysisSheet(s) {
  const toks = tokensOf(s);
  const words = SN.render(toks, { words: true });
  const rows = toks.map((t, i) => (t && !t.p && t.a ? `<tr><td class="gr" lang="grc">${esc(words[i])}</td><td>${gr(t.a.e.head || t.a.e.lemma)}<div class="note">${esc(t.a.e.m)}</div></td><td>${esc(t.a.d)}</td></tr>` : '')).join('');
  openSheet('Analisi della frase', `<p class="greek-line" lang="grc" style="font-size:1.35rem">${esc(s.gr)}</p><p>${esc(s.it[0])}</p><div class="tbl-wrap"><table class="para wordtable"><thead><tr><th>Parola</th><th>Lemma</th><th>Analisi</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}
function methodSheet() { openSheet('Il metodo di costruzione', `${say('Sette passi per non perdersi in nessuna frase greca.', 'happy', 64)}<ol>${B.METHOD.map((m) => `<li><b>${esc(m.h)}</b><p>${esc(m.p)}</p></li>`).join('')}</ol>`); }

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
    <div><main class="main" id="main" tabindex="-1"><header class="topbar"><div class="row"><div class="brand">${MARK}<b lang="grc">Ἑρμηνεύς</b></div>
      <div class="top-stats"><span class="chip streak ${st ? '' : 'off'}" title="Giorni di fila">${I.flame}${st}<span class="sr"> giorni di fila</span></span><span class="chip xp" title="Punti esperienza">${I.bolt}${S.xp}<span class="sr"> XP</span></span></div></div><div class="meander"></div></header>
      ${view}</main></div>
    <aside class="side" aria-label="I tuoi progressi">${sidePanel()}</aside></div>
    <nav class="tabs" aria-label="Sezioni">${NAV.map(([v, ic, it]) => `<button data-act="tab" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${ic}<span>${it}</span></button>`).join('')}</nav>`;
  if (VIEW === 'words') bindWords();
}
function ringSvg(p, label) {
  const r = 27, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
  return `<svg class="ring" viewBox="0 0 66 66" role="img" aria-label="${esc(label)}"><circle cx="33" cy="33" r="${r}" fill="none" stroke="var(--bg2)" stroke-width="8"/><circle cx="33" cy="33" r="${r}" fill="none" stroke="${v >= 1 ? 'var(--ok-l)' : 'var(--ochre-l)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 33 33)"/><text x="33" y="38" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)">${Math.round(v * 100)}%</text></svg>`;
}
function sententiaOfDay() { const n = daysBetween('2026-01-01', dayKey()); return B.SENTENTIAE[((n % B.SENTENTIAE.length) + B.SENTENTIAE.length) % B.SENTENTIAE.length]; }
function goalCard() {
  const x = todayXP();
  return `<section class="card goalcard">${ringSvg(x / S.goal, `Obiettivo di oggi: ${x} su ${S.goal} XP`)}<div class="txt"><b>Obiettivo di oggi</b><div class="note">${x >= S.goal ? 'Raggiunto! Ogni XP in più è un regalo.' : `${x} di ${S.goal} XP`}</div><div class="bar" style="margin-top:8px"><i style="width:${Math.min(100, Math.round((x / S.goal) * 100))}%"></i></div></div></section>`;
}
function sidePanel() {
  const st = effectiveStreak();
  const rk = rankOf(S.xp);
  const max = sententiaOfDay();
  return `${goalCard()}
    <section class="card"><div style="display:flex;gap:12px;align-items:center">${I.flame.replace('<svg', '<svg style="width:40px;height:40px;flex:none;color:#E06A1F"')}<div><b>${st} ${st === 1 ? 'giorno' : 'giorni'} di fila</b><div class="note">${S.shields ? `${S.shields} ${S.shields === 1 ? 'scudo protegge' : 'scudi proteggono'} la serie` : 'Ogni 7 giorni guadagni uno scudo'}</div></div></div></section>
    <section class="card"><b>Grado: ${gr(rk.r.name)}</b><div class="note">${esc(rk.r.tr)}${rk.next ? ` · ${rk.next.xp - S.xp} XP a ${esc(rk.next.tr)}` : ''}</div><div class="bar" style="margin-top:10px"><i style="width:${rk.next ? Math.round(((S.xp - rk.r.xp) / (rk.next.xp - rk.r.xp)) * 100) : 100}%"></i></div></section>
    <section class="card maxim"><p class="section-title" style="margin-top:0">Massima del giorno</p><p class="gr" lang="grc" style="font-size:1.3rem;margin:0">${esc(max[0])}</p><p style="margin:4px 0">${esc(max[1])}</p><p class="note">${esc(max[2])} · ${esc(max[3])}</p><button class="tool" data-act="speakText" data-w="${esc(max[0])}">${I.sound}Ascolta</button></section>`;
}
const LESSON_ICON = (l) => (l.test ? I.trophy : l.teach ? I.book : I.dumbbell);
function viewPath() {
  const cur = currentIdx();
  const cf = FLAT[cur];
  const greet = S.name ? `Χαῖρε, ${esc(S.name)}! ` : 'Χαῖρε! ';
  let h = `<div class="hello">${ermes('happy', 72)}<div class="bubble">${greet}${cf.lesson.test ? `Pronto per la prova dell’unità «${esc(cf.unit.title)}»?` : `Oggi: <b>${esc(cf.lesson.title)}</b> (${esc(cf.unit.title)}).`}</div></div>`;
  h += `<div class="only-narrow">${goalCard()}</div>`;
  const offs = [0, 46, 70, 46, 0, -46, -70, -46];
  UNITS.forEach((u, ui) => {
    const grp = TOPIC[u.id] && GROUPS[TOPIC[u.id].group] ? GROUPS[TOPIC[u.id].group].color : 'g-nom';
    const fi = firstLessonIdx(ui);
    const locked = !isUnlocked(fi);
    h += `<section class="unit ${grp}${locked ? ' locked' : ''}" id="unit-${u.id}" aria-label="Unità ${ui + 1}: ${esc(u.title)}"><div class="unit-banner"><div class="t"><small>Unità ${ui + 1}</small><b>${esc(u.title)}</b></div><button class="btn small" data-act="topic" data-t="${u.id}" aria-label="Guida: ${esc(u.title)}">${I.book}<span>Guida</span></button></div><div class="path">`;
    u.lessons.forEach((l, li) => {
      const idx = fi + li;
      const st = S.course.stars[l.id] || 0;
      const unlocked = isUnlocked(idx);
      const isCur = idx === cur;
      const cls = ['node', l.test ? 'test' : '', !unlocked ? 'locked' : st ? 'done' : '', isCur ? 'current' : ''].filter(Boolean).join(' ');
      const icon = !unlocked ? I.lock : st && !isCur ? (l.test ? I.trophy : I.check2) : LESSON_ICON(l);
      h += `<div class="node-wrap" style="transform:translateX(${offs[li % offs.length]}px)">${isCur ? '<span class="start-tag" aria-hidden="true">INIZIA</span>' : ''}
        <button class="${cls}" data-act="node" data-i="${idx}" aria-label="${esc(l.title)}${!unlocked ? ' (bloccata)' : st ? ` (${st} ${st === 1 ? 'stella' : 'stelle'})` : ''}" aria-expanded="${openNode === idx}">${icon}</button>
        <div class="node-stars" aria-hidden="true">${l.test ? '' : [1, 2, 3].map((n) => I.star.replace('<svg', `<svg class="${n <= st ? 'on' : ''}"`)).join('')}</div>
        ${openNode === idx ? nodePop(idx) : ''}</div>`;
    });
    h += `</div></section>`;
  });
  h += `<div class="trophy">${I.laurel.replace('<svg', '<svg style="width:28px;height:28px;color:var(--ochre-l)"')}Alla fine del percorso: la corona d’alloro dell’ἑρμηνεύς.</div>`;
  return h;
}
function nodePop(idx) {
  const f = FLAT[idx];
  const l = f.lesson;
  const st = S.course.stars[l.id] || 0;
  if (!isUnlocked(idx)) {
    const unitLocked = !isUnlocked(firstLessonIdx(f.ui));
    return `<div class="node-pop locked" role="dialog" aria-label="${esc(l.title)}"><b>${esc(l.title)}</b><p>${unitLocked ? 'Questa unità è ancora chiusa. Se l’hai già studiata in classe, puoi aprirla.' : 'Completa prima le lezioni precedenti.'}</p>${unitLocked ? `<button class="btn small" data-act="unlockUnit" data-u="${f.ui}">Apri l’unità</button>` : ''}</div>`;
  }
  return `<div class="node-pop" role="dialog" aria-label="${esc(l.title)}"><b>${esc(l.title)}</b><p>${esc(l.sub || '')}${l.test ? ' · serve il 70%' : ''}</p>
    <button class="btn small" data-act="startLesson" data-i="${idx}">${st ? 'Ripeti +XP' : l.test ? 'Inizia la prova' : 'Inizia'}</button>
    ${st && l.teach ? `<button class="btn small ghost" style="margin-top:8px" data-act="startLessonTeach" data-i="${idx}">Rivedi la spiegazione</button>` : ''}</div>`;
}
function scrollToCurrent() { const n = $('.node.current'); if (n) n.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
function viewGym() {
  const T = sel();
  const p = S.prac;
  const units = UNITS.filter((u) => T.has(u.id));
  const unit = p.unit && T.has(p.unit) ? p.unit : units[units.length - 1].id;
  const nErr = S.mistakes.length;
  return `<h1 style="margin-top:18px">Palestra</h1>${say('Qui ti alleni come vuoi tu. Scegli un argomento: le frasi useranno solo le parole che hai già incontrato.', 'happy', 64)}
    <p class="section-title">Argomento</p><div class="chips" role="group" aria-label="Argomento">${units.map((u) => `<button data-act="pracUnit" data-u="${u.id}" aria-pressed="${u.id === unit}">${esc(u.title)}</button>`).join('')}</div>
    <p class="section-title">Esercizi</p><div class="chips" role="group" aria-label="Tipo di esercizi">${[['misto', 'Misti'], ['frasi', 'Frasi'], ['forme', 'Forme'], ['parole', 'Parole']].map(([v, l]) => `<button data-act="pracType" data-v="${v}" aria-pressed="${p.type === v}">${l}</button>`).join('')}</div>
    <div class="setting" style="border:0"><div><b>Solo parole già incontrate</b><span>Disattiva per usare tutto il lessico degli argomenti aperti (più difficile)</span></div><label class="switch"><input type="checkbox" data-set="pracNarrow" ${p.wide ? '' : 'checked'} aria-label="Solo parole già incontrate"><i></i></label></div>
    <button class="btn block" style="margin:10px 0 6px" data-act="practice" data-m="${p.type}">${I.play}Allenati</button>
    <p class="section-title">Altri allenamenti</p><div class="grid2">
      <button class="mode" data-act="practice" data-m="review" ${nErr ? '' : 'disabled'}>${I.retry}<b>Ripasso errori</b><span>${nErr ? nErr + ' da rivedere' : 'nessun errore'}</span></button>
      <button class="mode" data-act="practice" data-m="gr_it" ${T.has('pres') ? '' : 'disabled'}>${I.translate}<b>Versione</b><span>dal greco all’italiano</span></button>
      <button class="mode" data-act="practice" data-m="it_gr" ${T.has('pres') ? '' : 'disabled'}>${I.pen}<b>Retroversione</b><span>dall’italiano al greco</span></button>
      <button class="mode" data-act="practice" data-m="nuove" ${S.settings.gen && T.has('art') ? '' : 'disabled'}>${I.spark}<b>Frasi nuove</b><span>create sul momento</span></button>
      <button class="mode" data-act="practice" data-m="alfabeto">${I.alpha}<b>Alfabeto</b><span>lettere, letture, accenti</span></button>
      <button class="mode" data-act="methodSheet">${I.method}<b>Il metodo</b><span>sette passi per tradurre</span></button></div>`;
}
function viewLibrary() {
  let h = `<h1 style="margin-top:18px">Teoria</h1><p class="muted">I ventidue argomenti del biennio. Le tabelle sono generate dal motore morfologico: niente errori di stampa.</p>
    <div class="tools"><button class="tool" data-act="methodSheet">${I.method}Il metodo di costruzione</button></div>`;
  for (const [gid, gdef] of Object.entries(GROUPS)) {
    const list = TOPICS.filter((t) => t.group === gid);
    if (!list.length) continue;
    h += `<p class="section-title">${esc(gdef.name)}</p><div class="card" style="padding:4px 12px"><ul class="list">${list.map((t) => `<li><button class="rowbtn ${gdef.color}" data-act="topic" data-t="${t.id}"><span class="num">${TOPIC[t.id].n}</span><span class="txt"><b>${esc(t.title)}</b><span>${esc(t.desc)}</span></span>${I.chev}</button></li>`).join('')}</ul></div>`;
  }
  return h;
}
function viewTopic(id) {
  const t = TOPIC[id];
  const ui = unitIdx(id);
  return `<div style="display:flex;align-items:center;gap:10px;margin-top:16px"><button class="iconbtn" data-act="tab" data-v="lib" aria-label="Torna alla teoria">${I.back}</button><span class="tag">${esc(GROUPS[t.group].name)} · ${t.n}</span></div>
    <h1 style="margin-top:12px">${esc(t.title)}</h1><p class="muted">${esc(t.desc)}</p>
    <div class="tools">${ui >= 0 && isUnlocked(firstLessonIdx(ui)) ? `<button class="btn small" data-act="goUnit" data-u="${id}">${I.road}Vai all’unità nel percorso</button>` : ''}</div>
    <section class="card">${theoryHtml(t)}</section>`;
}
function viewWords() {
  const q = vocabQueue();
  const nDue = q.due.length + q.fresh.length;
  const learned = q.all.filter((e) => S.vocab[e.id] && S.vocab[e.id].box >= 3).length;
  return `<h1 style="margin-top:18px">Lessico</h1>
    <section class="card"><h2>Ripetizione dilazionata</h2><p class="note">${nDue ? `${q.due.length} parole da ripassare e ${q.fresh.length} nuove per oggi.` : 'Per oggi hai finito: torna domani.'} ${learned} parole imparate su ${q.all.length} incontrate nel percorso.</p><div id="flash" class="flash"></div></section>
    <section class="card"><h2>Cerca una forma</h2><p class="note">Scrivi una parola greca (anche senza accenti): il motore la analizza.</p>
    <div class="search"><label class="sr" for="q">Forma greca</label><input id="q" class="gr" lang="grc" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="es. λύσει"><button class="btn" data-act="search" aria-label="Cerca">${I.lens}</button></div>
    <p class="note" style="margin-top:6px">Dal computer puoi usare le lettere latine (h = η, w = ω…) e i segni ) ( / \\ = |.</p><div id="results"></div></section>`;
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
    <div class="foot-row" style="justify-content:center;margin-top:12px">${flashCur.shown ? `<button class="btn err small" data-act="flash" data-v="0">Non lo sapevo</button><button class="btn ok small" data-act="flash" data-v="1">Lo sapevo</button>` : `<button class="btn small" data-act="flashShow">Mostra</button><button class="tool" data-act="speakText" data-w="${esc(e.lemma)}">${I.sound}Ascolta</button>`}</div>`;
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
    return `<rect x="${i * 40 + 8}" y="${92 - hgt}" width="24" height="${Math.max(2, hgt)}" rx="6" fill="${vals[i] >= S.goal ? 'var(--ok-l)' : 'var(--ochre-l)'}"/><text x="${i * 40 + 20}" y="110" text-anchor="middle" font-size="11" fill="var(--muted)">${names[new Date(y, m - 1, dd).getDay()]}</text>`;
  }).join('')}<line x1="0" x2="280" y1="${gy}" y2="${gy}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/></svg>`;
}
function medal(id, on) {
  const b = BADGES.find((x) => x.id === id);
  return `<svg class="medal" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="${on ? 'var(--ochre-bg)' : 'var(--bg2)'}" stroke="${on ? 'var(--ochre-l)' : 'var(--line)'}" stroke-width="3"/><path d="M12 30c3-1 5-4 6-8M36 30c-3-1-5-4-6-8M14 22c2 0 3-1 4-3M34 22c-2 0-3-1-4-3" stroke="${on ? 'var(--ochre)' : 'var(--muted)'}" stroke-width="2" fill="none" stroke-linecap="round"/><text x="24" y="29" text-anchor="middle" font-family="GFS Didot, serif" font-size="15" fill="${on ? 'var(--ink)' : 'var(--muted)'}">${esc(b ? b.name[0] : '?')}</text></svg>`;
}
function viewMe() {
  const rk = rankOf(S.xp);
  const acc = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) : 0;
  const set = S.settings;
  const sw = (k, label, sub) => `<div class="setting"><div><b>${label}</b><span>${sub}</span></div><label class="switch"><input type="checkbox" data-set="${k}" ${set[k] === true || set[k] === 'lenient' || set[k] === 'keys' ? 'checked' : ''} aria-label="${esc(label)}"><i></i></label></div>`;
  const cu = FLAT[currentIdx()];
  return `<div style="display:flex;align-items:center;gap:14px;margin-top:18px">${ermes('happy', 72)}<div><h1 style="margin:0">${S.name ? esc(S.name) : 'Il tuo profilo'}</h1><div class="note">${gr(rk.r.name)} · ${esc(rk.r.tr)}</div></div></div>
    <div class="stats3"><div class="stat" style="--c:#E06A1F"><small>Serie</small><b>${effectiveStreak()}</b></div><div class="stat" style="--c:var(--ochre-l)"><small>XP</small><b>${S.xp}</b></div><div class="stat" style="--c:var(--ok-l)"><small>Precisione</small><b>${acc}%</b></div></div>
    <section class="card"><h2>Ultimi sette giorni</h2>${weekSvg()}<p class="note">Lezioni completate: ${S.stats.lessons} · unità superate: ${doneUnits()} su ${UNITS.length} · scudi: ${S.shields}</p></section>
    <p class="section-title">Insegne</p><section class="card"><div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? '' : 'off'}">${medal(b.id, !!S.badges[b.id])}<b lang="grc">${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join('')}</div></section>
    <p class="section-title">Impostazioni</p><section class="card">
    <div class="setting"><div><b>Posizione nel percorso</b><span>Ora: ${esc(cu.unit.title)} · ${esc(cu.lesson.title)}</span></div><button class="btn small ghost" data-act="placement">Cambia</button></div>
    <div class="setting"><div><b>Obiettivo giornaliero</b><span>XP al giorno</span></div><div class="seg">${[30, 50, 80, 120].map((g) => `<button data-act="goal" data-v="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join('')}</div></div>
    ${sw('accents', 'Accenti facoltativi', 'Un errore di accento o di spirito viene segnalato ma non conta come errore')}
    ${sw('input', 'Scrivi invece delle tessere', 'Nelle traduzioni rispondi con la tastiera')}
    ${sw('gen', 'Frasi generate', 'Oltre alle frasi verificate, frasi nuove create sul dispositivo')}
    ${sw('sound', 'Suoni', 'Segnali sonori per le risposte')}
    ${sw('voice', 'Lettura ad alta voce', 'Pronuncia erasmiana con la voce italiana del dispositivo')}
    ${sw('online', 'Wikizionario', 'Collegamento al dizionario online (si invia solo la parola cercata)')}
    <div class="setting"><div><b>Tema</b><span>Colori dell’app</span></div><div class="seg">${[['auto', 'Auto'], ['light', 'Chiaro'], ['dark', 'Scuro']].map(([v, l]) => `<button data-act="theme" data-v="${v}" aria-pressed="${set.theme === v}">${l}</button>`).join('')}</div></div>
    <div class="setting"><div><b>Installa l’app</b><span>${isStandalone() ? 'Hermeneus è già installata.' : 'Sul telefono funziona anche senza rete.'}</span></div><button class="btn small" data-act="install" ${isStandalone() ? 'disabled' : ''}>${I.install}Installa</button></div>
    <div class="setting"><div><b>Nome</b><span>Facoltativo, resta sul dispositivo</span></div><button class="btn small ghost" data-act="rename">Cambia</button></div>
    <div class="setting"><div><b>Copia di sicurezza</b><span>Salva o ripristina i progressi in un file</span></div><div class="seg"><button data-act="export">Salva</button><button data-act="import">Ripristina</button></div></div>
    <div class="setting"><div><b>Azzera i progressi</b><span>Cancella tutto da questo dispositivo</span></div><button class="btn small err" data-act="reset">Azzera</button></div></section>
    <section class="card"><h2>Informazioni</h2><p class="note">Hermeneus funziona tutto sul tuo dispositivo: nessun account, nessuna raccolta di dati, nessuna intelligenza artificiale. Pronuncia erasmiana della scuola italiana, letta dalla sintesi vocale del dispositivo. Caratteri: Gentium Plus, GFS Didot, Fira Sans (licenza SIL OFL 1.1). Dizionario online facoltativo: Wikizionario (CC BY-SA).</p>
    <p class="note">${E.LEX.length} lemmi · ${UNITS.length} unità · ${FLAT.length} lezioni · ${BANK.length} frasi verificate · ${B.SENTENTIAE.length} massime.</p></section>`;
}

/* ---------- Benvenuto e posizione nel percorso ---------- */
let onb = null;
function placementList(selId, actName) {
  return `<button class="choice" data-act="${actName}" data-u="" aria-pressed="${selId === ''}"><span class="num" style="--gc:var(--ok-l)">0</span><span><b>Comincio da zero</b><span>Partiamo dall’alfabeto</span></span></button>
    ${UNITS.slice(0, -1).map((u, i) => `<button class="choice ${TOPIC[u.id] ? GROUPS[TOPIC[u.id].group].color : ''}" data-act="${actName}" data-u="${u.id}" aria-pressed="${selId === u.id}"><span class="num">${i + 1}</span><span><b>Ho studiato fino a: ${esc(u.title)}</b><span>${i ? `Si aprono le unità 1–${i + 1}` : 'Si apre l’unità 1'}; si riparte da «${esc(UNITS[i + 1].title)}»</span></span></button>`).join('')}`;
}
function drawOnb() {
  onb = onb || { step: 0, name: S.name || '', place: '', goal: S.goal, accents: S.settings.accents };
  const steps = `<div class="steps" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= onb.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let h = `<div class="onb">${steps}`;
  if (onb.step === 0) {
    h += `<div style="text-align:center">${ermes('cheer', 150)}</div><h1 style="text-align:center">Χαῖρε! Io sono Ermes.</h1><p style="text-align:center">Il messaggero degli dèi, protettore dei viaggiatori e degli interpreti. Ti guido nel greco, una lezione alla volta: dieci minuti al giorno bastano.</p>
      <section class="card"><label for="nm"><b>Come ti chiami?</b> <span class="muted">(facoltativo)</span></label><input id="nm" class="typed" style="margin-top:8px" maxlength="24" autocomplete="off" value="${esc(onb.name)}" placeholder="Nome o soprannome"><p class="note" style="margin-top:10px">Tutto resta su questo dispositivo: nessun account, nessun dato inviato a nessuno.</p></section>
      <button class="btn block" data-act="onbNext">Cominciamo</button>`;
  } else if (onb.step === 1) {
    h += say('Dove sei arrivato con il programma di classe? Apro le unità che hai già studiato; le altre si sbloccano facendo le lezioni.', 'think', 80) + placementList(onb.place, 'onbPlace') + `<button class="btn block" style="margin-top:8px" data-act="onbNext">Avanti</button>`;
  } else {
    h += say('Ultime due scelte. Potrai cambiarle quando vuoi nel profilo.', 'happy', 80) + `<section class="card"><div class="setting"><div><b>Obiettivo giornaliero</b><span>XP al giorno (una lezione vale circa 60 XP)</span></div><div class="seg">${[[30, 'Calmo'], [50, 'Normale'], [80, 'Serio'], [120, 'Intenso']].map(([g, l]) => `<button data-act="onbGoal" data-v="${g}" aria-pressed="${onb.goal === g}">${l}</button>`).join('')}</div></div>
      <div class="setting"><div><b>Accenti facoltativi</b><span>All’inizio è più sereno: gli errori d’accento vengono segnalati ma non contano.</span></div><label class="switch"><input type="checkbox" id="onbAcc" ${onb.accents === 'lenient' ? 'checked' : ''} aria-label="Accenti facoltativi"><i></i></label></div></section>
      <button class="btn block" data-act="onbDone">Iniziamo il viaggio</button>`;
  }
  h += `${onb.step ? '<button class="btn ghost block" style="margin-top:12px" data-act="onbBack">Indietro</button>' : ''}</div>`;
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
  const sm = (ic) => ic.replace('<svg', '<svg style="width:18px;height:18px;vertical-align:-3px"');
  if (isIOS()) { showModal(`<div style="text-align:center">${ermes('happy', 80)}</div><h2>Installa su iPhone o iPad</h2><ol><li>Apri questa pagina con <b>Safari</b>.</li><li>Tocca <b>Condividi</b> ${sm(I.share)} in basso.</li><li>Scegli <b>Aggiungi alla schermata Home</b> ${sm(I.plus)}.</li><li>Tocca <b>Aggiungi</b>: l’icona di Hermeneus comparirà tra le app.</li></ol><button class="btn block" data-act="closeModal">Ho capito</button>`); return; }
  showModal(`<div style="text-align:center">${ermes('happy', 80)}</div><h2>Installa l’app</h2><p>Su Android apri il menu del browser (⋮) e scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>. Sul computer usa l’icona di installazione nella barra dell’indirizzo.</p>${SITE ? '' : '<p class="note">L’installazione richiede la versione pubblicata sul sito; questo file autonomo si apre comunque in qualunque browser, anche senza rete.</p>'}<button class="btn block" data-act="closeModal">Ho capito</button>`);
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
  tab: (el) => { VIEW = el.dataset.v; openNode = null; render(); window.scrollTo(0, 0); const m = $('#main'); if (m) m.focus({ preventScroll: true }); if (VIEW === 'path') setTimeout(scrollToCurrent, 60); },
  node: (el) => { const i = +el.dataset.i; openNode = openNode === i ? null : i; rerenderKeep(`.node[data-i="${i}"]`); },
  startLesson: (el) => { openNode = null; startLesson(+el.dataset.i); },
  startLessonTeach: (el) => { openNode = null; startLesson(+el.dataset.i, { teach: true }); },
  unlockUnit: (el) => { const ui = +el.dataset.u; askConfirm(`Aprire «${UNITS[ui].title}»? Fallo se l’hai già studiata in classe.`, 'Apri', () => { S.course.unlocked = Math.max(S.course.unlocked, firstLessonIdx(ui)); syncTopics(); save(); openNode = null; render(); setTimeout(scrollToCurrent, 60); }); },
  goUnit: (el) => { VIEW = 'path'; render(); const u = $('#unit-' + el.dataset.u); if (u) u.scrollIntoView({ block: 'start' }); },
  practice: (el) => startPractice(el.dataset.m),
  pracUnit: (el) => { S.prac.unit = el.dataset.u; save(); rerenderKeep(`[data-act="pracUnit"][data-u="${el.dataset.u}"]`); },
  pracType: (el) => { S.prac.type = el.dataset.v; save(); rerenderKeep(`[data-act="pracType"][data-v="${el.dataset.v}"]`); },
  topic: (el) => { VIEW = 'topic:' + el.dataset.t; openNode = null; render(); window.scrollTo(0, 0); },
  quit: () => { const go = () => { SES = null; closeOverlay(); render(); }; if (SES && SES.i > 0 && !SES.done) askConfirm('Vuoi davvero uscire? I progressi di questa lezione andranno persi.', 'Esci', go, true, 'sad'); else go(); },
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
  toggleInput: (el) => { const c = SES.cur; if (c.answered) return; c.inputMode = c.inputMode === 'tiles' ? 'keys' : 'tiles'; c.chosen = []; $('#ansWrap').innerHTML = answerArea(c.it); el.innerHTML = c.inputMode === 'tiles' ? I.keys + 'Scrivi' : I.tiles + 'Tessere'; refreshAnswer(); const t = $('#typed'); if (t) t.focus({ preventScroll: true }); },
  word: (el) => { const it = SES && SES.cur && SES.cur.it; const s = it && it.s; if (!s) return; const tok = tokensOf(s)[+el.dataset.i]; if (tok) wordPop(el, tok); },
  speak: () => speak(SES.cur.it.s.gr),
  speakSent: () => speak(SES.cur.it.s.gr),
  speakForm: () => speak(SES.cur.it.form || SES.cur.it.word),
  speakText: (el) => speak(el.dataset.w),
  method: (el) => { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', on); $$('#ovBody .w.vb').forEach((w) => w.classList.toggle('verb', on)); $('#aux').innerHTML = on ? say(`I verbi sono evidenziati: tanti verbi, tante proposizioni. Poi cerca il soggetto al nominativo e l’oggetto all’accusativo. <button class="tool" data-act="methodSheet">${I.method}Tutti i passi</button>`, 'think', 56) : ''; },
  methodSheet: () => methodSheet(),
  hint: () => hint(),
  theory: (el) => theorySheet(el.dataset.t),
  analysis: () => analysisSheet(SES.cur.it.s),
  paradigm: (el) => { closePop(); paradigmSheet(E.LEX[+el.dataset.e]); },
  closeSheet: () => closeSheet(),
  closeModal: () => closeModal(),
  kb: (el) => { const t = $('#typed'); if (!t || t.readOnly) return; insertText(t, kbUpper ? el.dataset.k.toUpperCase() : el.dataset.k); kbUpper = false; const b = $('#checkBtn'); if (b) b.disabled = !t.value.trim(); },
  kbd: (el) => { const t = $('#typed'); if (!t || t.readOnly) return; applyMark(t, el.dataset.m); },
  kbx: () => { const t = $('#typed'); if (!t || t.readOnly) return; const a = t.selectionStart ?? t.value.length; const chars = [...t.value.slice(0, a)]; chars.pop(); t.value = chars.join('') + t.value.slice(a); normalizeTyped(t, chars.join('').length); const b = $('#checkBtn'); if (b) b.disabled = !t.value.trim(); },
  kbcase: () => { kbUpper = !kbUpper; toast(kbUpper ? 'Prossima lettera maiuscola.' : 'Minuscole.'); },
  placement: () => placementSheet(),
  setPlace: (el) => { const before = S.course.unlocked; placeAt(el.dataset.u || null); S.course.unlocked = Math.max(before, S.course.unlocked); syncTopics(); save(); closeSheet(); render(); toast('Percorso aggiornato.'); },
  goal: (el) => { S.goal = +el.dataset.v; save(); render(); },
  theme: (el) => { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  install: () => installFlow(),
  rename: () => askText('Il tuo nome (facoltativo)', S.name, (n) => { S.name = String(n).trim().slice(0, 24); save(); render(); }),
  export: () => { const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hermeneus-progressi-' + dayKey() + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); },
  import: () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json,.json'; i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then((t) => { try { const d = JSON.parse(t); if (d && (d.v === 1 || d.v === 2)) { localStorage.setItem(KEY, JSON.stringify(d)); load(); applyTheme(); render(); toast('Progressi ripristinati.'); } else toast('File non valido.'); } catch (e) { toast('File non valido.'); } }); }; i.click(); },
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
    S.onboarded = true; save(); onb = null; VIEW = 'path'; render(); setTimeout(scrollToCurrent, 80);
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
  if (!t.dataset.set) return;
  const k = t.dataset.set;
  if (k === 'accents') S.settings.accents = t.checked ? 'lenient' : 'strict';
  else if (k === 'input') S.settings.input = t.checked ? 'keys' : 'tiles';
  else if (k === 'pracNarrow') S.prac.wide = !t.checked;
  else S.settings[k] = t.checked;
  save();
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') { if ($('#pop')) closePop(); else if ($('#modal')) closeModal(); else if ($('#sheet')) closeSheet(); else if (openNode != null) { openNode = null; rerenderKeep(); } return; }
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

/* ---------- Avvio ---------- */
function warmLoop() {
  if (E.isReady()) return;
  const step = () => { E.warm(12); if (!E.isReady()) (window.requestIdleCallback || ((f) => setTimeout(f, 30)))(step); };
  setTimeout(step, 800);
}
function boot() {
  load();
  applyTheme();
  const mq = matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', applyTheme);
  render();
  if (S.onboarded) setTimeout(scrollToCurrent, 120);
  warmLoop();
  try { if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) { /* ignora */ }
  if (SITE && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
// per la verifica automatica nel browser
window.HermApp = { S: () => S, cur: () => SES && SES.cur, startLesson, startPractice, FLAT };
boot();
})();
