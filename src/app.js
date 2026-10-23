/* HERMENEUS — applicazione. Tutto resta sul dispositivo: nessun account, nessun servizio esterno
   (il Wikizionario è solo un collegamento facoltativo). */
(function () {
'use strict';
const G = window.GreekOrtho, E = window.HermEngine, SN = window.HermSentence, IT = window.HermIt, GN = window.HermGen;
const { TOPICS, GROUPS } = window.HERM_TOPICS;
const B = window.HERM_BANK;
E.loadLexicon(window.HERM_LEX);
const TOPIC = Object.fromEntries(TOPICS.map((t, i) => [t.id, Object.assign({}, t, { n: i + 1 })]));
const ORDER = TOPICS.map((t) => t.id);
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

/* ---------- Icone (disegnate per Hermeneus) ---------- */
const svg = (d, o = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${o}>${d}</svg>`;
const I = {
  gym: svg('<path d="M4 20h16M6 20V9M10 20V9M14 20V9M18 20V9M3 9l9-5 9 5z"/>'),
  books: svg('<path d="M5 4h4v16H5zM10 4h4v16h-4z"/><path d="m15.5 5 3.6-.9 2.4 15.5-3.6.9z"/>'),
  words: svg('<rect x="4" y="5" width="12" height="15" rx="2"/><path d="M8 3h11a1 1 0 0 1 1 1v14"/><path d="M7.5 10h5M7.5 13.5h5"/>'),
  me: svg('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1-3.7 3.7-5.6 7-5.6s6 1.9 7 5.6"/>'),
  flame: svg('<path d="M12.5 3c.4 2.8-1.1 4.4-2.5 6S7 12 7 14.8C7 18.2 9.3 21 12.3 21c3.3 0 5.7-2.6 5.7-6.1 0-2.5-1.3-4.4-2.6-5.6.1 1.6-.5 2.9-1.6 3.5.4-3.4-.4-6.6-1.3-8.8Z" fill="currentColor" stroke="none"/>'),
  shield: svg('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>'),
  owl: svg('<path d="M6 5c2 1 4 1.2 6 1.2S16 6 18 5c.8 3 1 6 .5 9-1 4-3.5 6-6.5 6s-5.5-2-6.5-6C5 11 5.2 8 6 5Z"/><circle cx="9.5" cy="11" r="1.6"/><circle cx="14.5" cy="11" r="1.6"/><path d="m11.2 14 .8 1 .8-1"/>'),
  play: svg('<path d="M7 5v14l11-7z" fill="currentColor" stroke="none"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  back: svg('<path d="M15 6 9 12l6 6"/>'),
  chev: svg('<path d="m9 6 6 6-6 6"/>', 'class="chev"'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.6"'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.4"'),
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
  open: svg('<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20"/>'),
  method: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>'),
  install: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5Z"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>'),
  share: svg('<path d="M12 15V4M8 7.5 12 4l4 3.5"/><path d="M6 11v8h12v-8"/>'),
  plus: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>'),
};
const MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#22508F"/><path d="M10 50h44M10 50V42h8v-4h-4v-4h10v8h8v-8h10v4h-4v4h8v8" fill="none" stroke="#E5BA62" stroke-width="3" stroke-linejoin="round"/><text x="32" y="33" text-anchor="middle" font-family="GFS Didot, Gentium Plus, serif" font-size="30" fill="#FDF6E3">Ἑ</text></svg>';

/* ---------- Stato ---------- */
const KEY = 'hermeneus.v1';
const DEFAULT = () => ({
  v: 1, onboarded: false, name: '', topics: [], goal: 50, xp: 0, days: {}, streak: 0, lastDay: null, shields: 0,
  mastery: {}, mistakes: [], badges: {}, vocab: {}, recent: [], genSaved: [],
  stats: { answered: 0, correct: 0, sessions: 0, perfect: 0, forms: 0, typedOK: 0, translated: 0, genSeen: 0, types: {}, clearedReview: 0, accentOK: 0 },
  settings: { sound: true, voice: true, input: 'tiles', accents: 'lenient', theme: 'auto', gen: true, online: true, installHidden: false },
});
let S = DEFAULT();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    const def = DEFAULT();
    S = Object.assign(def, d, { stats: Object.assign(def.stats, d.stats || {}), settings: Object.assign(def.settings, d.settings || {}) });
  } catch (e) { /* archiviazione non disponibile */ }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } }
const sel = () => new Set(S.topics);
function applyTheme() {
  const r = document.documentElement;
  if (S.settings.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.settings.theme);
  const dark = S.settings.theme === 'dark' || (S.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]:not([media])') || (() => { const x = document.createElement('meta'); x.name = 'theme-color'; document.head.appendChild(x); return x; })();
  m.content = dark ? '#0E1420' : '#F3EEE2';
}

/* ---------- Token: da [indice, chiave, forma] all'analisi ---------- */
function resolveTok(t) {
  if (!Array.isArray(t)) return t;
  if (t.length === 1) return { p: t[0] };
  const e = E.LEX[t[0]];
  let a = e && e.forms.find((x) => x.key === t[1] && x.f === t[2]);
  if (!a && t[1] === 'lemma') a = { e, f: t[2], key: 'lemma', d: 'forma di citazione', req: [e.topic] };
  if (!a) return null;
  return SN.tok(a);
}
function packTok(t) {
  if (t.p) return [t.p];
  return [E.LEX.indexOf(t.a.e), t.a.key, t.a.f];
}

/* ---------- Frasi della banca ---------- */
const PRE = window.HERM_PRE || null; // token e argomenti calcolati alla costruzione
const BANK = B.BANK.map((b, i) => {
  const declared = b[2].split(/\s+/);
  const tags = PRE ? PRE.bank[i].tags : declared;
  const focus = declared.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0];
  return { id: 'b' + i, gr: b[0], it: b[1].split('|'), tags, focus, tip: b[3] || '', src: 'bank', _tok: PRE ? PRE.bank[i].tok : null };
});
function tokensOf(s) {
  if (s.tokens) return s.tokens;
  if (s._tok) s.tokens = s._tok.map(resolveTok);
  else { const lx = SN.lexicalize(s.gr); s.tokens = lx.tokens || []; }
  if (s.tokens.some((t) => !t)) { const lx = SN.lexicalize(s.gr); s.tokens = lx.tokens || []; }
  return s.tokens;
}
function sentById(id) {
  if (id[0] === 'b') return BANK[+id.slice(1)] || null;
  const g = (S.genSaved || []).find((x) => x.id === id);
  if (!g) return null;
  return Object.assign({}, g, { tokens: g.tok.map(resolveTok) });
}
function sentencePool(T, topic) {
  return BANK.filter((s) => s.tags.every((t) => T.has(t)) && (!topic || s.tags.includes(topic)));
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
function addXP(n) {
  const before = rankOf(S.xp).i;
  S.xp += n;
  const k = dayKey();
  S.days[k] = (S.days[k] || 0) + n;
  return rankOf(S.xp).i > before;
}
function rankOf(xp) {
  let i = 0;
  RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; });
  return { i, r: RANKS[i], next: RANKS[i + 1] || null };
}
function mastery(t) { const m = S.mastery[t]; return m ? (m.c + 1) / (m.a + 2) : 0.5; }
function recordMastery(t, ok) {
  if (!t) return;
  const m = S.mastery[t] || { a: 0, c: 0 };
  m.a++; if (ok) m.c++;
  if (m.a > 40) { m.a = Math.round(m.a * 0.8); m.c = Math.round(m.c * 0.8); }
  S.mastery[t] = m;
}
const BADGES = [
  { id: 'primo', name: 'Πρῶτον βῆμα', desc: 'Completa il primo allenamento.', test: () => S.stats.sessions >= 1 },
  { id: 'sette', name: 'Ἑπτὰ ἡμέραι', desc: 'Una serie di 7 giorni.', test: () => S.streak >= 7 },
  { id: 'trenta', name: 'Τριάκοντα ἡμέραι', desc: 'Una serie di 30 giorni.', test: () => S.streak >= 30 },
  { id: 'perfetto', name: 'Ἄνευ ἁμαρτίας', desc: 'Un allenamento senza errori.', test: () => S.stats.perfect >= 1 },
  { id: 'cento', name: 'Ἑκατόν', desc: '100 risposte corrette.', test: () => S.stats.correct >= 100 },
  { id: 'cinquecento', name: 'Πεντακόσια', desc: '500 risposte corrette.', test: () => S.stats.correct >= 500 },
  { id: 'interprete', name: 'Ἑρμηνεύς', desc: '100 frasi tradotte bene.', test: () => S.stats.translated >= 100 },
  { id: 'grammatico', name: 'Γραμματικός', desc: '50 forme analizzate o scritte bene.', test: () => S.stats.forms >= 50 },
  { id: 'accenti', name: 'Ὀρθὴ γραφή', desc: '20 risposte scritte in greco con tutti gli accenti giusti.', test: () => S.stats.accentOK >= 20 },
  { id: 'lessico', name: 'Λεξικογράφος', desc: '50 parole imparate nel lessico.', test: () => Object.values(S.vocab).filter((v) => v.box >= 3).length >= 50 },
  { id: 'vario', name: 'Παντοδαπός', desc: 'Prova tutti i tipi di esercizio.', test: () => Object.keys(S.stats.types).length >= 7 },
  { id: 'nuove', name: 'Καινοὶ λόγοι', desc: 'Traduci 10 frasi create sul momento.', test: () => S.stats.genSeen >= 10 },
  { id: 'ripasso', name: 'Ἐπανόρθωσις', desc: 'Svuota il ripasso degli errori.', test: () => S.stats.clearedReview >= 1 },
  { id: 'civetta', name: 'Γλαῦξ', desc: 'Allenati dopo le 22.', test: () => false },
  { id: 'aurora', name: 'Ἠώς', desc: 'Allenati prima delle 8.', test: () => false },
  { id: 'stratego', name: 'Στρατηγός', desc: 'Raggiungi il grado di stratego.', test: () => S.xp >= 5500 },
];
function checkBadges(extra = {}) {
  const won = [];
  for (const b of BADGES) if (!S.badges[b.id] && (b.test() || extra[b.id])) { S.badges[b.id] = dayKey(); won.push(b); }
  return won;
}

/* ---------- Suoni, vibrazione, voce ---------- */
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
const sfx = { ok: () => tone([660, 880]), err: () => tone([220, 180], 0.16, 'triangle'), done: () => tone([523, 659, 784, 1046], 0.14), tap: () => tone([440], 0.04, 'sine', 0.025) };
// la vibrazione è permessa solo dopo un tocco reale dell'utente
function buzz(p) { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch (e) { /* ignora */ } }
let itVoice = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    itVoice = vs.find((v) => /^it(-|_)IT/i.test(v.lang)) || vs.find((v) => /^it/i.test(v.lang)) || null;
  } catch (e) { itVoice = null; }
}
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

/* ---------- Avvisi ---------- */
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
function flushToasts() { if (pendingToasts.length) { const m = pendingToasts.shift(); toast(m); if (pendingToasts.length) setTimeout(flushToasts, 3400); } }
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const cols = ['#22508F', '#E5BA62', '#A0471F', '#2D7363', '#8FB2EA'];
  const P = Array.from({ length: 90 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 3, r: Math.random() * 6 + 3, c: pick(cols), a: Math.random() * 6 }));
  let f = 0;
  (function step() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) { p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.a += 0.15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
    if (++f < 110) requestAnimationFrame(step); else c.remove();
  })();
}

/* ---------- Costruzione degli esercizi ---------- */
const XP_BASE = { gr_it: 12, it_gr: 14, analizza: 8, scrivi: 10, completa: 8, lessico: 6, alfabeto: 5 };
const KIND = {
  gr_it: [I.translate, 'Traduci in italiano'], it_gr: [I.pen, 'Traduci in greco'], analizza: [I.lens, 'Analizza la forma'],
  scrivi: [I.table, 'Scrivi la forma'], completa: [I.tiles, 'Completa la frase'], lessico: [I.cards, 'Lessico'], alfabeto: [I.alpha, 'Leggi la parola'],
};
function topicsWeighted(T) { return ORDER.filter((t) => T.has(t)); }
function latestTopic() { const t = ORDER.filter((x) => S.topics.includes(x)); return t[t.length - 1]; }
function weakTopics(n) { return ORDER.filter((t) => S.topics.includes(t)).sort((a, b) => mastery(a) - mastery(b) || ORDER.indexOf(b) - ORDER.indexOf(a)).slice(0, n); }
function pickSentences(pool, n) {
  const recent = new Set(S.recent);
  const fresh = pool.filter((s) => !recent.has(s.id));
  const src = fresh.length >= n ? fresh : pool;
  const latest = latestTopic();
  const w = (s) => 1 + (s.focus === latest ? 2 : 0) + (1 - mastery(s.focus)) * 2;
  const out = [];
  const bag = src.slice();
  while (out.length < n && bag.length) {
    const tot = bag.reduce((a, s) => a + w(s), 0);
    let r = Math.random() * tot, k = 0;
    for (; k < bag.length; k++) { r -= w(bag[k]); if (r <= 0) break; }
    out.push(bag.splice(Math.min(k, bag.length - 1), 1)[0]);
  }
  return out;
}
function genSentence(T, focus, avoid) {
  if (!S.settings.gen) return null;
  const s = GN.generate([...T], focus, { avoid });
  if (!s) return null;
  s.tokens = s.tokens.filter(Boolean);
  return s;
}
// forme utilizzabili di un lemma con gli argomenti scelti
function formsUsable(e, T) { return e.forms.filter((f) => f.key !== 'lemma' && f.req.every((q) => T.has(q))); }
function entryPool(T, kinds) { return E.LEX.filter((e) => (!kinds || kinds.includes(e.k)) && e.k !== 'i' && T.has(e.topic)); }
function buildAnalizza(T, topic) {
  for (let k = 0; k < 30; k++) {
    let pool = entryPool(T, ['n', 'a', 'v', 'p', 'art']);
    if (topic) pool = pool.filter((e) => e.topic === topic || e.k === 'v' && ['mp', 'impf', 'fut', 'aor', 'perf', 'cong', 'part'].includes(topic));
    const e = pick(pool);
    if (!e) return null;
    let forms = formsUsable(e, T);
    if (topic && e.k === 'v') forms = forms.filter((f) => f.req.includes(topic)) .length ? forms.filter((f) => f.req.includes(topic)) : forms;
    if (forms.length < 4) continue;
    const f = pick(forms);
    const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));
    const dis = shuffle(uniq(forms.map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 3);
    if (dis.length < 3) continue;
    return { type: 'analizza', e, form: f.f, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: focusOfReq(f.req), key: f.key };
  }
  return null;
}
function buildScrivi(T, topic) {
  for (let k = 0; k < 30; k++) {
    let pool = entryPool(T, ['n', 'a', 'v', 'p']);
    if (topic) pool = pool.filter((e) => e.topic === topic) .length ? pool.filter((e) => e.topic === topic) : pool;
    const e = pick(pool);
    if (!e) return null;
    const forms = formsUsable(e, T).filter((f) => f.f !== (e.lemma));
    if (!forms.length) continue;
    const f = pick(forms);
    const answers = uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.f));
    return { type: 'scrivi', e, desc: f.d, answers, nu: f.nu, topic: focusOfReq(f.req), key: f.key };
  }
  return null;
}
function buildCompleta(s, T) {
  const toks = tokensOf(s);
  const cand = toks.map((t, i) => ({ t, i })).filter(({ t }) => t && t.a && ['n', 'v', 'a', 'p'].includes(t.a.e.k) && t.a.key !== 'lemma');
  for (const { t, i } of shuffle(cand)) {
    const others = shuffle(uniq(formsUsable(t.a.e, T).map((x) => x.f).filter((f) => f !== t.a.f && G.strict(f) !== G.strict(t.a.f)))).slice(0, 3);
    if (others.length < 3) continue;
    return { type: 'completa', s, idx: i, answer: t.a.f, options: shuffle([t.a.f, ...others]), topic: s.focus };
  }
  return null;
}
function buildLessico(T, reverse) {
  const pool = E.LEX.filter((e) => ['n', 'v', 'a'].includes(e.k) && T.has(e.topic) && !(e.fl && e.fl.prop));
  if (pool.length < 4) return null;
  const due = pool.filter((e) => { const v = S.vocab[e.id]; return !v || v.due <= dayKey(); });
  const e = pick(due.length ? due : pool);
  const others = shuffle(pool.filter((x) => x !== e && x.m !== e.m && x.k === e.k)).slice(0, 3);
  if (others.length < 3) return null;
  return { type: 'lessico', e, reverse: !!reverse, options: shuffle([e, ...others]), topic: e.topic };
}
function buildAlfabeto(T) {
  const pool = E.LEX.filter((e) => (e.k === 'n' || e.k === 'v' || e.k === 'a') && (T.size < 3 || T.has(e.topic)) && G.syllables(e.lemma) <= 4);
  const e = pick(pool.length ? pool : E.LEX.filter((x) => x.k === 'n'));
  const word = e.lemma;
  const right = G.translit(word);
  const swaps = [['ē', 'e'], ['ō', 'o'], ['ph', 'p'], ['ch', 'k'], ['th', 't'], ['y', 'u'], ['h', ''], ['x', 'ks'], ['ps', 'p']];
  const dis = new Set();
  for (const [a, b] of shuffle(swaps)) { if (right.includes(a)) dis.add(right.replace(a, b)); if (dis.size >= 2) break; }
  while (dis.size < 3) dis.add(G.translit(pick(pool).lemma));
  dis.delete(right);
  return { type: 'alfabeto', e, word, right, options: shuffle([right, ...[...dis].slice(0, 3)]), topic: 'alf' };
}
function focusOfReq(req) { return req.slice().sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0]; }

const PLAN = ['gr_it', 'it_gr', 'analizza', 'gr_it', 'completa', 'it_gr', 'scrivi', 'gr_it', 'lessico', 'it_gr', 'analizza', 'gr_it'];
function buildItems(mode, opts = {}) {
  const T = sel();
  const items = [];
  if (mode === 'review') {
    for (const m of S.mistakes.slice(-12)) {
      let it = null;
      if (m.k === 's') { const s = sentById(m.id); if (s) it = { type: m.dir, s, topic: s.focus }; }
      else if (m.k === 'c') { const s = sentById(m.id); if (s) it = buildCompleta(s, T); }
      else if (m.k === 'f') {
        const e = E.LEX[m.e];
        const f = e && e.forms.find((x) => x.key === m.key);
        if (e && f) {
          if (m.t === 'scrivi') it = { type: 'scrivi', e, desc: f.d, answers: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.f)), topic: focusOfReq(f.req), key: f.key };
          else {
            const forms = formsUsable(e, T);
            const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));
            const dis = shuffle(uniq(forms.map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 3);
            if (dis.length === 3) it = { type: 'analizza', e, form: f.f, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: focusOfReq(f.req), key: f.key };
          }
        }
      } else if (m.k === 'l') { const e = E.LEX[m.e]; if (e) { const b = buildLessico(T); if (b) { b.e = e; b.options = shuffle([e, ...b.options.filter((o) => o !== e).slice(0, 3)]); it = b; } } }
      if (it) { it.review = m; items.push(it); }
    }
    return shuffle(items);
  }
  const hasSent = T.has('pres') || sentencePool(T).length > 0;
  let plan;
  if (mode === 'gr_it' || mode === 'it_gr') plan = Array(10).fill(mode);
  else if (mode === 'forme') plan = ['analizza', 'scrivi', 'analizza', 'completa', 'scrivi', 'analizza', 'completa', 'scrivi', 'analizza', 'scrivi'];
  else if (mode === 'lessico') plan = Array(12).fill('lessico');
  else if (mode === 'alfabeto') plan = Array(10).fill('alfabeto');
  else if (mode === 'nuove') plan = ['gr_it', 'it_gr', 'gr_it', 'completa', 'it_gr', 'gr_it', 'it_gr', 'completa', 'gr_it', 'it_gr'];
  else plan = PLAN.slice();
  if (!hasSent) plan = T.has('art') ? ['analizza', 'alfabeto', 'scrivi', 'lessico', 'analizza', 'alfabeto', 'scrivi', 'lessico', 'analizza', 'alfabeto'] : Array(10).fill('alfabeto');
  if (T.size <= 2 && T.has('alf') && mode === 'mix') plan = plan.map((p, i) => (i % 2 ? p : 'alfabeto'));
  const sp = sentencePool(T, opts.topic);
  const nSent = plan.filter((p) => p === 'gr_it' || p === 'it_gr' || p === 'completa').length;
  const share = mode === 'nuove' ? 1 : sp.length < 8 ? 0.7 : 0.45;
  const gen = [];
  const want = Math.round(nSent * share);
  for (let i = 0; i < want * 2 && gen.length < want; i++) {
    const focus = opts.topic || pick(weakTopics(3).concat([latestTopic()]));
    const g = genSentence(T, focus, gen.map((x) => x.gr));
    if (g) gen.push(g);
  }
  const chosen = shuffle(pickSentences(sp, nSent - gen.length).concat(gen));
  let si = 0;
  for (const p of plan) {
    let it = null;
    if (p === 'gr_it' || p === 'it_gr') { const s = chosen[si++]; if (s) it = { type: p, s, topic: s.focus }; }
    else if (p === 'completa') { const s = chosen[si++]; if (s) it = buildCompleta(s, T); }
    else if (p === 'analizza') it = buildAnalizza(T, opts.topic);
    else if (p === 'scrivi') it = buildScrivi(T, opts.topic);
    else if (p === 'lessico') it = buildLessico(T, Math.random() < 0.35);
    else if (p === 'alfabeto') it = buildAlfabeto(T);
    if (!it) it = buildAnalizza(T) || buildAlfabeto(T);
    if (it) items.push(it);
  }
  return items;
}

/* ---------- Sessione ---------- */
let SES = null;
function startSession(mode, opts = {}) {
  if (!S.topics.length) { toast('Scegli prima gli argomenti studiati.'); openPicker(); return; }
  const items = buildItems(mode, opts);
  if (!items.length) { toast(mode === 'review' ? 'Nessun errore da ripassare.' : 'Non ci sono ancora esercizi per questi argomenti.'); return; }
  SES = { mode, opts, items, i: 0, combo: 0, best: 0, xp: 0, ok: 0, ko: 0, start: Date.now(), cur: null, done: false };
  openOverlay();
  renderItem();
}
function openOverlay() {
  closeOverlay();
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Allenamento');
  ov.innerHTML = `<div class="ov-inner"><div class="ov-head"><button class="iconbtn" data-act="quit" aria-label="Chiudi l'allenamento">${I.close}</button><div class="progress" role="progressbar" aria-label="Avanzamento" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="combo" id="combo" aria-live="polite"></div></div><div class="ov-body" id="ovBody"></div></div><div class="ov-foot" id="ovFootWrap"><div class="foot-in" id="ovFoot"></div></div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
}
function closeOverlay() { const o = $('#ov'); if (o) o.remove(); document.body.style.overflow = ''; closePop(); }
function setProgress(p) { const b = $('#ov .progress'); if (b) { b.firstChild.style.width = Math.round(p * 100) + '%'; b.setAttribute('aria-valuenow', Math.round(p * 100)); } }
function setCombo() { const c = $('#combo'); if (c) c.innerHTML = SES.combo >= 2 ? I.flame + '<span>' + SES.combo + '</span><span class="sr"> risposte giuste di fila</span>' : ''; }

function renderItem() {
  closePop();
  const it = SES.items[SES.i];
  if (!it) return finishSession();
  setProgress(SES.i / SES.items.length);
  setCombo();
  const [ico, label] = KIND[it.type];
  const typed = S.settings.input === 'keys';
  SES.cur = { it, answered: false, chosen: [], picked: null, inputMode: typed ? 'keys' : 'tiles' };
  let html = `<div class="kind">${ico}<span>${label}</span>${it.review ? ' <span class="tag">ripasso</span>' : ''}${it.s && it.s.src === 'gen' ? ' <span class="tag">frase nuova</span>' : ''}</div>`;
  if (it.type === 'gr_it') html += renderGrIt(it);
  else if (it.type === 'it_gr') html += renderItGr(it);
  else if (it.type === 'analizza') html += renderAnalizza(it);
  else if (it.type === 'scrivi') html += renderScrivi(it);
  else if (it.type === 'completa') html += renderCompleta(it);
  else if (it.type === 'lessico') html += renderLessico(it);
  else if (it.type === 'alfabeto') html += renderAlfabeto(it);
  $('#ovBody').innerHTML = html;
  $('#ovBody').classList.remove('fx-in'); void $('#ovBody').offsetWidth; $('#ovBody').classList.add('fx-in');
  $('#ovFootWrap').className = 'ov-foot';
  renderFoot();
  if (it.type === 'gr_it' || it.type === 'it_gr') refreshAnswer();
  const t = $('#typed'); if (t && !matchMedia('(pointer: coarse)').matches) t.focus({ preventScroll: true });
  $('.ov-inner').scrollTop = 0;
}
function renderFoot() {
  const it = SES.cur.it;
  const needsCheck = ['gr_it', 'it_gr', 'scrivi'].includes(it.type);
  $('#ovFoot').innerHTML = needsCheck ? `<button class="btn block" data-act="check" id="checkBtn">Controlla</button>` : `<p class="note" style="text-align:center;margin:6px 0">Scegli una risposta.</p>`;
}
function greekLine(s, o = {}) {
  const toks = tokensOf(s);
  const words = SN.render(toks, { words: true });
  let h = '';
  toks.forEach((t, i) => {
    if (!t) return;
    if (t.p) { h += esc(t.p); return; }
    let w = words[i];
    if (i === firstWordIdx(toks)) w = SN.capFirst(w);
    if (o.blank === i) { h += (h ? ' ' : '') + `<span class="blank" id="blank" aria-label="spazio vuoto">…</span>`; return; }
    const verb = t.a && t.a.e.k === 'v' && t.a.m && !['inf', 'part'].includes(t.a.m);
    h += (h ? ' ' : '') + `<button class="w${verb ? ' vb' : ''}" data-act="word" data-i="${i}" lang="grc">${esc(w)}</button>`;
  });
  return `<p class="greek-line" lang="grc">${h}</p>`;
}
const firstWordIdx = (toks) => toks.findIndex((t) => t && !t.p);
function renderGrIt(it) {
  const s = it.s;
  let h = `<p class="prompt">Traduci in italiano. Tocca una parola per l'analisi.</p>${greekLine(s)}`;
  h += `<div class="tools"><button class="tool" data-act="speak">${I.sound}Ascolta</button><button class="tool" data-act="method" aria-pressed="false">${I.method}Metodo</button><button class="tool" data-act="hint">${I.bulb}Aiuto</button><button class="tool" data-act="toggleInput">${SES.cur.inputMode === 'tiles' ? I.keys + 'Scrivi' : I.tiles + 'Tessere'}</button></div><div id="aux"></div>`;
  h += `<div id="ansWrap">${answerArea(it)}</div>`;
  return h;
}
function renderItGr(it) {
  const s = it.s;
  let h = `<p class="prompt">Traduci in greco.</p><p class="it-line">${esc(s.it[0])}</p>`;
  h += `<div class="tools"><button class="tool" data-act="hint">${I.bulb}Aiuto</button><button class="tool" data-act="toggleInput">${SES.cur.inputMode === 'tiles' ? I.keys + 'Scrivi' : I.tiles + 'Tessere'}</button></div><div id="aux"></div>`;
  h += `<div id="ansWrap">${answerArea(it)}</div>`;
  return h;
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
function tileLabel(t) {
  if (t.lemma === 'οὐ') return 'οὐ';
  if (t.lemma === 'ἐκ') return 'ἐκ';
  return t.f;
}
function greekTiles(s) {
  const toks = tokensOf(s).filter((t) => t && !t.p);
  const tiles = toks.map((t) => ({ label: tileLabel(t), tok: t }));
  const have = new Set(tiles.map((t) => G.strict(t.label)));
  const T = sel();
  const dis = [];
  for (const t of shuffle(toks)) {
    if (dis.length >= 3) break;
    if (!t.a || !['n', 'v', 'a', 'art', 'p'].includes(t.a.e.k) || t.a.key === 'lemma') continue;
    const alts = shuffle(formsUsable(t.a.e, T).filter((f) => !have.has(G.strict(f.f)) && f.key.split('.').slice(0, 2).join('.') === t.a.key.split('.').slice(0, 2).join('.')));
    const f = alts[0];
    if (f) { have.add(G.strict(f.f)); dis.push({ label: f.f, tok: SN.tok(f), distractor: true }); }
  }
  return shuffle(tiles.concat(dis));
}
const IT_FUNC = ['il', 'la', 'i', 'le', 'gli', 'di', 'a', 'da', 'in', 'con', 'che', 'non', 'un', 'una', 'del', 'della', 'al', 'alla', 'nel', 'nella', 'e', 'ma'];
function italianTiles(s) {
  const words = s.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/).filter(Boolean);
  const tiles = words.map((w) => ({ label: w }));
  const have = new Set(words.map((w) => w.toLowerCase()));
  const extra = [];
  const pool = shuffle(BANK.filter((b) => b !== s).slice(0, 40)).flatMap((b) => b.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/)).filter((w) => w.length > 3 && !have.has(w.toLowerCase()));
  for (const w of shuffle(IT_FUNC)) { if (extra.length >= 1) break; if (!have.has(w)) { extra.push(w); have.add(w); } }
  for (const w of pool) { if (extra.length >= 3) break; if (!have.has(w.toLowerCase())) { extra.push(w.toLowerCase()); have.add(w.toLowerCase()); } }
  return shuffle(tiles.concat(extra.map((w) => ({ label: w, distractor: true }))));
}
function refreshAnswer() {
  const c = SES.cur;
  if (c.inputMode !== 'tiles') return;
  const a = $('#answer'); if (!a) return;
  a.innerHTML = c.chosen.map((k, j) => `<button class="tile${c.it.type === 'it_gr' ? ' gr' : ''}" data-act="untile" data-j="${j}" ${c.it.type === 'it_gr' ? 'lang="grc"' : ''}>${esc(c.tiles[k].label)}</button>`).join('');
  a.classList.toggle('filled', c.chosen.length > 0);
  $$('#bank .tile').forEach((b) => b.classList.toggle('used', c.chosen.includes(+b.dataset.k)));
  const comp = $('#composed');
  if (comp) comp.textContent = c.chosen.length ? SN.render(c.chosen.map((k) => c.tiles[k].tok).concat([{ p: '.' }])) : '';
}
function renderAnalizza(it) {
  return `<p class="prompt">Che forma è? <span class="muted">(lemma: ${gr(it.e.head || it.e.lemma)})</span></p><p class="bigform" lang="grc">${esc(it.form)}</p>
    <div class="tools" style="justify-content:center"><button class="tool" data-act="speakForm">${I.sound}Ascolta</button></div>
    <div class="opts">${it.options.map((o, k) => `<button class="opt" data-act="pick" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
}
function renderScrivi(it) {
  return `<p class="prompt">Scrivi la forma richiesta di ${gr(it.e.head || it.e.lemma)}.</p><p class="desc">${esc(it.desc)}</p>
    <label class="sr" for="typed">La forma in greco</label><input id="typed" class="typed gr" lang="grc" inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrivi in greco…">${keyboardHtml()}`;
}
function renderCompleta(it) {
  return `<p class="prompt">Scegli la forma giusta per completare la frase.</p>${greekLine(it.s, { blank: it.idx })}<p class="muted">${esc(it.s.it[0])}</p>
    <div class="opts two">${it.options.map((o, k) => `<button class="opt gr" lang="grc" data-act="pick" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
}
function renderLessico(it) {
  if (it.reverse) return `<p class="prompt">Come si dice in greco?</p><p class="it-line" style="text-align:center;font-size:1.4rem">${esc(it.e.m)}</p><div class="opts">${it.options.map((o, k) => `<button class="opt gr" lang="grc" data-act="pick" data-k="${k}">${esc(o.head || o.lemma)}</button>`).join('')}</div>`;
  return `<p class="prompt">Che cosa significa?</p><p class="bigform" lang="grc">${esc(it.e.head || it.e.lemma)}</p><div class="opts">${it.options.map((o, k) => `<button class="opt" data-act="pick" data-k="${k}">${esc(o.m)}</button>`).join('')}</div>`;
}
function renderAlfabeto(it) {
  return `<p class="prompt">Leggi la parola: quale trascrizione è giusta?</p><p class="bigform" lang="grc">${esc(it.word)}</p>
    <div class="tools" style="justify-content:center"><button class="tool" data-act="speakForm">${I.sound}Ascolta</button></div>
    <div class="opts two">${it.options.map((o, k) => `<button class="opt" data-act="pick" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
}

/* ---------- Tastiera greca ---------- */
const KB_ROWS = [['ς', 'ε', 'ρ', 'τ', 'υ', 'θ', 'ι', 'ο', 'π'], ['α', 'σ', 'δ', 'φ', 'γ', 'η', 'ξ', 'κ', 'λ'], ['ζ', 'χ', 'ψ', 'ω', 'β', 'ν', 'μ']];
const DIA = [['\u0313', '᾿', 'spirito dolce'], ['\u0314', '῾', 'spirito aspro'], ['\u0301', '´', 'acuto'], ['\u0300', '`', 'grave'], ['\u0342', '῀', 'circonflesso'], ['\u0345', 'ͺ', 'iota sottoscritto'], ['\u0308', '¨', 'dieresi']];
function keyboardHtml() {
  return `<div class="kb" role="group" aria-label="Tastiera greca">${KB_ROWS.map((r) => `<div class="kb-row">${r.map((l) => `<button type="button" data-act="kb" data-k="${l}" aria-label="${l}">${l}</button>`).join('')}</div>`).join('')}
    <div class="kb-row">${DIA.map(([m, s, n]) => `<button type="button" class="dia" data-act="kbd" data-m="${m}" aria-label="${n}">${s}</button>`).join('')}<button type="button" class="del" data-act="kbx" aria-label="Cancella">⌫</button></div>
    <div class="kb-row"><button type="button" class="wide" data-act="kb" data-k=" " aria-label="Spazio">spazio</button><button type="button" class="wide" data-act="kbcase" aria-label="Maiuscola">Maiusc.</button></div></div>
    <p class="kb-hint">Con la tastiera del computer: lettere latine → greche (h = η, w = ω, q = θ, c = ξ, y = ψ, x = χ, f = φ); ) dolce, ( aspro, / acuto, \\ grave, = circonflesso, | iota sottoscritto.</p>`;
}
let kbUpper = false;
const LAT = { a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι', k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ', t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς', v: 'ς' };
const LAT_DIA = { ')': '\u0313', '(': '\u0314', '/': '\u0301', '\\': '\u0300', '=': '\u0342', '|': '\u0345', '+': '\u0308' };
function insertText(el, txt) {
  const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, a) + txt + el.value.slice(b);
  const p = a + txt.length;
  normalizeTyped(el, p);
}
function normalizeTyped(el, caret) {
  const before = el.value.slice(0, caret), after = el.value.slice(caret);
  const nb = G.nfc(before), na = G.nfc(after);
  // il sigma prima del cursore resta «finale» solo se è davvero in fine di parola
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
}
function onTypedKey(ev) {
  const el = ev.target;
  if (!el.classList.contains('gr')) return;
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key;
  if (LAT_DIA[k]) { ev.preventDefault(); applyMark(el, LAT_DIA[k]); return; }
  if (k.length === 1 && /[a-zA-Z]/.test(k)) {
    const g = LAT[k.toLowerCase()];
    if (g) { ev.preventDefault(); insertText(el, k === k.toUpperCase() && k !== k.toLowerCase() ? g.toUpperCase() : g); }
  }
  if (k === 'Enter' && el.tagName === 'INPUT') { ev.preventDefault(); act('check'); }
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
    if (x.t.encl) { v.add(G.stripAccents(x.w)); v.add(x.t.f); }
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
    if (k === ans.length) {
      const order = assign.map((i) => ref[i].t.f);
      if (SN.orderOK(refTokens, order)) found = assign.slice();
      return;
    }
    for (const i of cand[k]) { if (used[i]) continue; used[i] = true; assign.push(i); dfs(k + 1); assign.pop(); used[i] = false; if (found) return; }
  })(0);
  if (!found) return { ok: false, accent: [] };
  const strictEq = (a, b) => G.strict(a) === G.strict(b);
  const twoAcc = (s) => { const L = G.parse(s); const N = G.nuclei(L); const acc = N.filter((n) => L[n.j].ac); if (acc.length === 2) L[acc[1].j].ac = ''; return G.strict(G.serialize(L)); };
  const accent = [];
  ans.forEach((w, k) => {
    const vs = V[found[k]];
    if (!vs.some((x) => strictEq(x, w) || twoAcc(x) === twoAcc(w))) accent.push({ got: w, want: ref[found[k]].w });
  });
  return { ok: accent.length === 0 || lenient, accent, exact: accent.length === 0 };
}
function act(name, el) { ACT[name] && ACT[name](el); }
function doCheck() {
  const c = SES.cur; if (!c || c.answered) return;
  const it = c.it;
  let res = null;
  if (it.type === 'gr_it') {
    if (c.inputMode === 'tiles') {
      if (!c.chosen.length) return toast('Componi la traduzione con le tessere.');
      const built = c.chosen.map((k) => c.tiles[k].label).join(' ');
      const ok = it.s.it.some((r) => normIt(r) === normIt(built));
      res = { ok, sol: it.s.it[0], given: built, near: !ok && simLoose(normIt(built), normIt(it.s.it[0])) > 0.7 };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la traduzione.');
      const m = bestItalianMatch(it.s, ans);
      if (m.best >= 0.88) res = { ok: true, sol: m.bestRef, given: ans, typed: true, note: normIt(ans) !== normIt(m.bestRef) ? 'Versione di riferimento: ' + m.bestRef : '' };
      else return selfGrade(it, ans, m.bestRef, false);
    }
  } else if (it.type === 'it_gr') {
    const ref = tokensOf(it.s);
    if (c.inputMode === 'tiles') {
      if (!c.chosen.length) return toast('Componi la frase con le tessere.');
      const toks = c.chosen.map((k) => c.tiles[k]);
      const noDis = toks.every((t) => !t.distractor) && toks.length === ref.filter((t) => t && !t.p).length;
      const ok = noDis && SN.orderOK(ref, toks.map((t) => t.tok.f));
      const builtStr = SN.render(toks.map((t) => t.tok).concat([{ p: '.' }]));
      const same = G.strict(builtStr) === G.strict(it.s.gr);
      res = { ok, sol: it.s.gr, given: builtStr, greek: true, note: ok && !same ? 'Giusto: in greco l’ordine delle parole è libero. Ordine del testo: ' + it.s.gr : '' };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la frase in greco.');
      const r = checkTypedGreek(ref, ans);
      res = { ok: r.ok, sol: it.s.gr, given: ans, greek: true, typed: true, accent: r.accent, accentOnly: r.ok && !r.exact };
      if (r.ok && r.exact) S.stats.accentOK++;
    }
  } else if (it.type === 'analizza') {
    const o = it.options[c.picked];
    const ok = it.valid.includes(o);
    res = { ok, sol: it.correct, others: it.valid.length > 1 ? it.valid : null, forms: true };
    markOptions(ok, (k) => it.valid.includes(it.options[k]));
  } else if (it.type === 'scrivi') {
    const raw = G.nfc($('#typed').value.trim());
    if (!raw) return toast('Scrivi la forma.');
    const lenient = S.settings.accents === 'lenient';
    const alts = it.answers.concat(it.nu ? it.answers.map((a) => a + 'ν') : []);
    const exact = alts.some((a) => G.strict(a) === G.strict(raw));
    const loose = alts.some((a) => G.bare(a) === G.bare(raw));
    const ok = exact || (loose && lenient);
    res = { ok, sol: it.answers.join(' / '), greek: true, forms: true, accentOnly: ok && !exact, accent: loose && !exact ? [{ got: raw, want: it.answers[0] }] : [] };
    if (exact) S.stats.accentOK++;
  } else if (it.type === 'completa') {
    const ok = it.options[c.picked] === it.answer;
    res = { ok, sol: it.s.gr, greek: true };
    markOptions(ok, (k) => it.options[k] === it.answer);
    const b = $('#blank'); if (b) b.textContent = SN.render(tokensOf(it.s), { words: true })[it.idx];
  } else if (it.type === 'lessico') {
    const ok = it.options[c.picked] === it.e;
    res = { ok, sol: (it.e.head || it.e.lemma) + ' = ' + it.e.m, greek: false };
    markOptions(ok, (k) => it.options[k] === it.e);
    srs(it.e, ok);
  } else if (it.type === 'alfabeto') {
    const ok = it.options[c.picked] === it.right;
    res = { ok, sol: it.word + ' = ' + it.right };
    markOptions(ok, (k) => it.options[k] === it.right);
  }
  finalize(res);
}
function markOptions(ok, isRight) {
  $$('#ovBody .opt').forEach((b, k) => {
    b.disabled = true;
    if (isRight(k)) b.classList.add('right');
    else if (+k === SES.cur.picked && !ok) b.classList.add('wrong');
  });
}
function selfGrade(it, ans, sol) {
  const c = SES.cur; c.answered = true;
  $('#typed').readOnly = true;
  $('#ovFoot').innerHTML = `<div class="fb"><div class="fb-ico" style="background:var(--ochre-line)">${I.bulb}</div><div class="fb-txt"><h3>Confronta con la soluzione</h3>
    <p>Soluzione: <span class="sol">${esc(sol)}</span></p>${it.s.it.length > 1 ? `<p class="note">Anche: ${it.s.it.filter((x) => x !== sol).slice(0, 2).map(esc).join(' · ')}</p>` : ''}<p class="note">La tua traduzione è diversa da quelle previste: giudica tu.</p></div></div>
    <div class="grid2" style="grid-template-columns:1fr 1fr"><button class="btn err" data-act="self" data-v="0">Ho sbagliato</button><button class="btn ok" data-act="self" data-v="1">Era corretta</button></div>`;
  c.selfData = { ans, sol };
}
const PRAISE = ['Εὖ γε!', 'Καλῶς!', 'Ὀρθῶς!', 'Ἄριστα!', 'Εὖ!'];
function finalize(res) {
  const c = SES.cur, it = c.it;
  c.answered = true; c.res = res;
  $$('#ovBody .tile, #ovBody .opt, #ovBody .kb button').forEach((b) => (b.disabled = true));
  const t = $('#typed'); if (t) t.readOnly = true;
  S.stats.answered++;
  S.stats.types[it.type] = (S.stats.types[it.type] || 0) + 1;
  const topic = it.topic || (it.s && it.s.focus);
  recordMastery(topic, res.ok);
  let gained = 0;
  if (res.ok) {
    SES.combo++; SES.best = Math.max(SES.best, SES.combo); SES.ok++; S.stats.correct++;
    gained = XP_BASE[it.type] * (res.accentOnly ? 0.7 : 1) + (SES.combo >= 3 ? Math.min(SES.combo, 6) * 2 : 0) + (it.s && it.s.src === 'gen' ? 2 : 0) + (res.typed ? 3 : 0);
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
  }
  if (it.s) S.recent = S.recent.filter((x) => x !== it.s.id).concat([it.s.id]).slice(-40);
  gained = Math.round(gained);
  SES.xp += gained;
  setCombo();
  save();
  showFeedback(res, gained);
}
function addMistake(it) {
  let m = null;
  if (it.s && it.s.src === 'gen') {
    const packed = { id: it.s.id, gr: it.s.gr, it: it.s.it, tags: it.s.tags, focus: it.s.focus, tip: it.s.tip, src: 'gen', tok: it.s.tokens.map(packTok) };
    S.genSaved = (S.genSaved || []).filter((x) => x.id !== it.s.id).concat([packed]).slice(-60);
  }
  if (it.type === 'gr_it' || it.type === 'it_gr') m = { k: 's', id: it.s.id, dir: it.type };
  else if (it.type === 'completa') m = { k: 'c', id: it.s.id };
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
    body += `<h3 lang="grc" class="gr">${pick(PRAISE)}</h3><p>${res.accentOnly ? 'Giusta, ma controlla accenti e spiriti.' : 'Risposta corretta.'} ${gained ? '+' + gained + ' XP' : ''}${SES.combo >= 3 ? ' · ' + SES.combo + ' di fila' : ''}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (res.others && res.others.length > 1) body += `<p class="note">La forma può essere anche: ${res.others.filter((o) => o !== it.options[SES.cur.picked]).map(esc).join('; ')}.</p>`;
  } else {
    body += `<h3>${res.near ? 'Quasi!' : 'Non proprio'}</h3><p>Soluzione: <span class="sol${res.greek ? ' gr' : ''}" ${res.greek ? 'lang="grc"' : ''}>${esc(res.sol)}</span></p>`;
    if (res.others) body += `<p class="note">Questa forma può essere anche: ${res.others.filter((o) => o !== res.sol).map(esc).join('; ')}</p>`;
  }
  if (res.accent && res.accent.length) body += `<p class="accent-warn">Segni diacritici: ${res.accent.slice(0, 3).map((a) => `${gr(a.got)} → ${gr(a.want)}`).join(', ')}${S.settings.accents === 'lenient' ? ' (non conta come errore)' : ''}</p>`;
  if (it.s && it.s.tip) body += `<p class="note">${I.bulb.replace('<svg', '<svg style="width:15px;height:15px;vertical-align:-2px"')} ${esc(it.s.tip)}</p>`;
  const extra = [];
  if (topic && TOPIC[topic]) extra.push(`<button class="tool" data-act="theory" data-t="${topic}">${I.open}Teoria: ${esc(TOPIC[topic].short)}</button>`);
  if (it.s) extra.push(`<button class="tool" data-act="analysis">${I.lens}Analisi</button>`);
  if (it.s) extra.push(`<button class="tool" data-act="speakSent">${I.sound}Ascolta</button>`);
  $('#ovFoot').innerHTML = `<div class="fb ${res.ok ? 'ok' : 'err'}" role="status" aria-live="polite"><div class="fb-ico">${res.ok ? I.check : I.x}</div><div class="fb-txt">${body}</div></div>
    ${extra.length ? `<div class="fb-extra">${extra.join('')}</div>` : ''}<button class="btn block ${res.ok ? 'ok' : 'err'}" data-act="next" id="nextBtn">Continua</button>`;
  setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 60);
  // dopo un errore, la scheda di teoria si propone da sola una volta per argomento
  if (!res.ok && topic && TOPIC[topic] && !SES.shownTheory) { SES.shownTheory = {}; }
  if (!res.ok && topic && TOPIC[topic] && !SES.shownTheory[topic] && SES.ko >= 2) { SES.shownTheory[topic] = true; const cur = SES.cur; setTimeout(() => { if (SES && SES.cur === cur && !SES.done && !$('#sheet')) theorySheet(topic, true); }, 400); }
}
function finishSession() {
  SES.done = true;
  const total = SES.ok + SES.ko;
  const perfect = total >= 5 && SES.ko === 0;
  const bonus = perfect ? 20 : 0;
  const rankUp = addXP(SES.xp + bonus);
  if (total > 0) touchStreak();
  S.stats.sessions++;
  if (perfect) S.stats.perfect++;
  if (SES.mode === 'review' && S.mistakes.length === 0 && total > 0) S.stats.clearedReview++;
  const h = new Date().getHours();
  const won = checkBadges({ civetta: h >= 22, aurora: h < 8 });
  save();
  setProgress(1);
  sfx.done(); confetti();
  const acc = total ? Math.round((SES.ok / total) * 100) : 0;
  const goalDone = todayXP() >= S.goal;
  $('#ovBody').innerHTML = `<div class="empty fx-in" style="padding-top:24px">
    <h2 class="disp" style="font-size:2rem;color:var(--ink)" lang="grc">${perfect ? 'Ἄνευ ἁμαρτίας' : acc >= 70 ? 'Καλῶς πεποίηκας' : 'Ὁ πόνος πάντα νικᾷ'}</h2>
    <p>${perfect ? 'Nessun errore: +20 XP di bonus.' : acc >= 70 ? 'Ottimo lavoro.' : 'Gli errori vanno nel ripasso: li rivedrai presto.'}</p>
    <div class="grid2" style="grid-template-columns:repeat(3,1fr);margin:18px 0">
      <div class="card" style="margin:0"><b style="font-size:1.4rem">+${SES.xp + bonus}</b><div class="note">XP</div></div>
      <div class="card" style="margin:0"><b style="font-size:1.4rem">${acc}%</b><div class="note">precisione</div></div>
      <div class="card" style="margin:0"><b style="font-size:1.4rem">${SES.best}</b><div class="note">di fila</div></div></div>
    ${goalDone ? '<p class="banner" style="justify-content:center">Obiettivo di oggi raggiunto!</p>' : `<p class="note">Oggi: ${todayXP()} / ${S.goal} XP</p>`}
    ${rankUp ? `<p class="banner" style="justify-content:center">Nuovo grado: ${gr(rankOf(S.xp).r.name)} (${esc(rankOf(S.xp).r.tr)})</p>` : ''}
    ${won.map((b) => `<p class="banner" style="justify-content:center">Insegna: ${gr(b.name)} — ${esc(b.desc)}</p>`).join('')}
    </div>`;
  $('#ovFootWrap').className = 'ov-foot';
  $('#ovFoot').innerHTML = `<div class="grid2" style="grid-template-columns:1fr 1fr">${S.mistakes.length ? '<button class="btn ghost" data-act="startReview">Ripassa gli errori</button>' : '<button class="btn ghost" data-act="again">Ancora</button>'}<button class="btn" data-act="endSession">Fine</button></div>`;
  setTimeout(() => { const b = $('#ovFoot .btn:last-child'); if (b) b.focus(); }, 60);
}
function endSession() { SES = null; closeOverlay(); render(); flushToasts(); }

/* ---------- Ripetizione dilazionata ---------- */
const BOX_DAYS = [0, 1, 2, 4, 8, 16];
function srs(e, ok) {
  const v = S.vocab[e.id] || { box: 0, due: dayKey() };
  v.box = ok ? Math.min(5, v.box + 1) : 0;
  v.due = addDays(dayKey(), BOX_DAYS[v.box]);
  S.vocab[e.id] = v;
}
function vocabQueue() {
  const T = sel();
  const ents = E.LEX.filter((e) => ['n', 'v', 'a'].includes(e.k) && T.has(e.topic) && !(e.fl && e.fl.prop));
  const due = ents.filter((e) => S.vocab[e.id] && S.vocab[e.id].due <= dayKey());
  const fresh = ents.filter((e) => !S.vocab[e.id]).slice(0, Math.max(0, 10 - due.length));
  return { due, fresh, all: ents };
}

/* ---------- Popover e fogli ---------- */
function closePop() { const p = $('#pop'); if (p) p.remove(); }
function wordPop(btn, tok) {
  closePop();
  const a = tok.a;
  if (!a) return;
  const e = a.e;
  const others = E.isReady() ? uniq(E.analyze(a.f).filter((x) => x !== a).map((x) => `${x.e.head || x.e.lemma}: ${x.d}`)).slice(0, 4) : [];
  const p = document.createElement('div');
  p.className = 'pop'; p.id = 'pop'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Analisi della parola');
  p.innerHTML = `<h4 lang="grc">${esc(a.f)}</h4><div class="lem">${gr(e.head || e.lemma)} — ${esc(e.m)}</div>
    <p style="margin:6px 0 0"><b>${esc(a.d)}</b></p>${others.length ? `<p class="note" style="margin:4px 0 0">Altre analisi possibili:</p><ul>${others.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
    <div class="row"><button class="tool" data-act="speakWord" data-w="${esc(a.f)}">${I.sound}Ascolta</button>${e.k !== 'i' && e.k !== 'art' ? `<button class="tool" data-act="paradigm" data-e="${E.LEX.indexOf(e)}">${I.table}Paradigma</button>` : ''}${S.settings.online ? `<a class="tool" href="https://it.wiktionary.org/wiki/${encodeURIComponent(e.lemma)}" target="_blank" rel="noopener noreferrer">${I.globe}Wikizionario</a>` : ''}</div>`;
  document.body.appendChild(p);
  const r = btn.getBoundingClientRect();
  const w = p.offsetWidth, h = p.offsetHeight;
  let left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
  let top = r.bottom + 8;
  if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
  p.style.left = left + 'px'; p.style.top = top + 'px';
}
function openSheet(title, html, o = {}) {
  closeSheet();
  const bg = document.createElement('div');
  bg.className = 'sheet-bg'; bg.id = 'sheet';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="Chiudi">${I.close}</button></div><div class="sheet-body ${o.cls || ''}">${html}</div></div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  setTimeout(() => { const b = $('#sheet .iconbtn'); if (b) b.focus(); }, 30);
}
function closeSheet() { const s = $('#sheet'); if (s) s.remove(); }
function showModal(html) {
  closeModal();
  const bg = document.createElement('div');
  bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal fx-in" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeModal(); });
  document.body.appendChild(bg);
  setTimeout(() => { const b = $('#modal button'); if (b) b.focus(); }, 30);
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
// conferma e richiesta di testo dentro l'app (i dialoghi nativi possono essere bloccati)
let modalCb = null;
function askConfirm(text, okLabel, cb, danger) { modalCb = cb; showModal(`<h2>${esc(text)}</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:14px"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn ${danger ? 'err' : ''}" data-act="modalOk">${esc(okLabel)}</button></div>`); }
function askText(label, value, cb) { modalCb = cb; showModal(`<label for="mdIn"><b>${esc(label)}</b></label><input id="mdIn" class="typed" style="margin-top:8px" maxlength="24" autocomplete="off" value="${esc(value)}"><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:14px"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn" data-act="modalOk">Salva</button></div>`); setTimeout(() => { const i = $('#mdIn'); if (i) i.focus(); }, 40); }
function analysisSheet(s) {
  const toks = tokensOf(s);
  const words = SN.render(toks, { words: true });
  const rows = toks.map((t, i) => (t && !t.p && t.a ? `<tr><td class="gr" lang="grc">${esc(words[i])}</td><td>${gr(t.a.e.head || t.a.e.lemma)}<div class="note">${esc(t.a.e.m)}</div></td><td>${esc(t.a.d)}</td></tr>` : '')).join('');
  openSheet('Analisi della frase', `<p class="greek-line" lang="grc" style="font-size:1.3rem">${esc(s.gr)}</p><p>${esc(s.it[0])}</p>
    <div class="tbl-wrap"><table class="para wordtable"><thead><tr><th>Parola</th><th>Lemma</th><th>Analisi</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}
function methodSheet() {
  openSheet('Il metodo di costruzione', `<ol>${B.METHOD.map((m) => `<li><b>${esc(m.h)}</b><p>${esc(m.p)}</p></li>`).join('')}</ol>`);
}

/* ---------- Teoria: tabelle generate dal motore ---------- */
const CASE_ROWS = [['nom', 'Nom.'], ['gen', 'Gen.'], ['dat', 'Dat.'], ['acc', 'Acc.'], ['voc', 'Voc.']];
const PERS_ROWS = [['1s', '1ª sing.'], ['2s', '2ª sing.'], ['3s', '3ª sing.'], ['1p', '1ª plur.'], ['2p', '2ª plur.'], ['3p', '3ª plur.']];
const IMP_ROWS = [['2s', '2ª sing.'], ['3s', '3ª sing.'], ['2p', '2ª plur.'], ['3p', '3ª plur.']];
const findLemma = (l) => E.LEX.find((e) => e.lemma === G.nfc(l) && e.k !== 'i') || E.LEX.find((e) => e.lemma === G.nfc(l));
const cellForms = (e, key) => uniq(e.forms.filter((f) => f.key === key).map((f) => f.f + (f.nu ? '(ν)' : ''))).join(' / ') || '—';
function tblHtml(cols, rows, cap, grCols = []) {
  return `<div class="tbl-wrap"><table class="para">${cap ? `<caption>${esc(cap)}</caption>` : ''}<thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td class="${grCols.includes(i) || grCols === 'all' ? 'gr' : ''}" ${grCols.includes(i) || grCols === 'all' ? 'lang="grc"' : ''}>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function declTable(lemmas, cap) {
  const ents = lemmas.map(findLemma).filter(Boolean);
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASE_ROWS) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...ents.map((e) => cellForms(e, `n.${c}.${n}`))]);
  const cols = ['', ...ents.map((e) => e.lemma)];
  return tblHtml(cols, rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap, ents.map((_, i) => i + 1));
}
function conjTable(specs, cap) {
  const cols = [''], data = [];
  let imp = false;
  for (const [l, key] of specs) {
    const e = findLemma(l);
    if (!e) continue;
    const [t, m, v] = key.split('.');
    imp = m === 'imp';
    cols.push(`${l} — ${E.TENSE_IT[t === 'futp' ? 'fut' : t] || t}${v === 'mp' ? ' m.-p.' : v === 'mid' ? ' medio' : v === 'pass' ? ' passivo' : ''}`);
    data.push({ e, key });
  }
  const rowsDef = imp ? IMP_ROWS : PERS_ROWS;
  const rows = rowsDef.map(([p, lab]) => [lab, ...data.map(({ e, key }) => cellForms(e, `${key}.${p}`))]);
  return tblHtml(cols, rows, cap, data.map((_, i) => i + 1));
}
function adjTable(l, cap) {
  const e = findLemma(l);
  if (!e) return '';
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASE_ROWS) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...['m', 'f', 'n'].map((g) => cellForms(e, `a.pos.${g}.${c}.${n}`))]);
  return tblHtml(['', 'Maschile', 'Femminile', 'Neutro'], rows, cap, [1, 2, 3]);
}
function pronTable(l, cap, ent) {
  const e = ent || E.LEX.find((x) => (x.k === 'p' || x.k === 'art') && x.lemma === G.nfc(l));
  if (!e) return '';
  const pre = e.k === 'art' ? 'art' : 'p';
  const gens = uniq(e.forms.map((f) => f.g)).filter(Boolean);
  const gl = { m: 'Maschile', f: 'Femminile', n: 'Neutro', x: 'Masch./femm.' };
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASE_ROWS) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...gens.map((g) => cellForms(e, `${pre}.${g}.${c}.${n}`))]);
  return tblHtml(['', ...gens.map((g) => gl[g])], rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap, gens.map((_, i) => i + 1));
}
function formsTable(specs) {
  const rows = specs.map(([l, key, lab]) => { const e = findLemma(l); return [lab, e ? cellForms(e, key) : '—']; });
  return tblHtml(['', 'Forma'], rows, '', [1]);
}
function theoryHtml(t) {
  let h = '';
  for (const b of t.body) {
    if (b.p) h += `<p>${b.p.replace(/class="gr"/g, 'class="gr" lang="grc"').replace(/class="gr x"/g, 'class="gr x" lang="grc"')}</p>`;
    else if (b.tbl) h += tblHtml(b.tbl.c, b.tbl.r, b.cap, t.id === 'alf' ? [] : 'all');
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
  const t = TOPIC[id];
  if (!t) return;
  openSheet(t.n + '. ' + t.title, (auto ? '<p class="banner" style="margin-top:0">Hai sbagliato un paio di volte su questo argomento: ecco un ripasso veloce.</p>' : '') + theoryHtml(t));
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
let VIEW = 'home';
function render() {
  if (!S.onboarded) return startOnboarding();
  const app = $('#app');
  const st = effectiveStreak();
  app.innerHTML = `<header class="topbar"><div class="row"><div class="brand">${MARK}<b lang="grc">Ἑρμηνεύς</b><small>l’interprete</small></div>
    <div class="top-stats"><span class="chip streak" title="Serie di giorni">${I.flame}${st}<span class="sr"> giorni di fila</span></span><span class="chip xp" title="Punti esperienza">${S.xp} XP</span></div></div><div class="meander"></div></header>
    <main id="main" tabindex="-1">${VIEW === 'home' ? viewHome() : VIEW === 'lib' ? viewLibrary() : VIEW === 'words' ? viewWords() : viewMe()}</main>
    <nav class="tabs" aria-label="Sezioni">${[['home', I.gym, 'Γυμνάσιον', 'Palestra'], ['lib', I.books, 'Βιβλία', 'Teoria'], ['words', I.words, 'Λέξεις', 'Lessico'], ['me', I.me, 'Ἐγώ', 'Profilo']]
      .map(([v, ic, g, it]) => `<button data-act="tab" data-v="${v}" ${VIEW === v ? 'aria-current="page"' : ''}>${ic}<span class="gr" lang="grc">${g}</span><span>${it}</span></button>`).join('')}</nav>`;
  if (VIEW === 'words') bindWords();
}
function ringSvg(p, label) {
  const r = 38, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
  return `<svg class="ring" viewBox="0 0 92 92" role="img" aria-label="${esc(label)}"><circle cx="46" cy="46" r="${r}" fill="none" stroke="var(--bg2)" stroke-width="9"/><circle cx="46" cy="46" r="${r}" fill="none" stroke="var(--lapis)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 46 46)"/><text x="46" y="44" text-anchor="middle" font-size="18" font-weight="700" fill="var(--ink)">${Math.round(v * 100)}%</text><text x="46" y="61" text-anchor="middle" font-size="10" fill="var(--muted)">obiettivo</text></svg>`;
}
function sententiaOfDay() { const n = daysBetween('2026-01-01', dayKey()); return B.SENTENTIAE[((n % B.SENTENTIAE.length) + B.SENTENTIAE.length) % B.SENTENTIAE.length]; }
function viewHome() {
  const T = sel();
  const x = todayXP();
  const rk = rankOf(S.xp);
  const nErr = S.mistakes.length;
  const sp = sentencePool(T).length;
  const st = effectiveStreak();
  const max = sententiaOfDay();
  const latest = latestTopic();
  const canSent = T.has('pres') || sp > 0;
  let h = '';
  if (installable() && !S.settings.installHidden) h += `<div class="banner">${I.install}<p>Installa Hermeneus sul telefono: si apre come un'app e funziona anche senza rete.</p><button class="btn small" data-act="install">Installa</button></div>`;
  h += `<section class="card tint"><div class="hero">${ringSvg(x / S.goal, `Obiettivo di oggi: ${x} su ${S.goal} XP`)}<div class="hero-txt">
    <h2>${S.name ? 'Χαῖρε, ' + esc(S.name) + '!' : 'Χαῖρε!'}</h2><p class="muted small">${x >= S.goal ? 'Obiettivo di oggi raggiunto.' : `Oggi ${x} di ${S.goal} XP.`} Serie: ${st} ${st === 1 ? 'giorno' : 'giorni'}${S.shields ? ` · ${S.shields} ${S.shields === 1 ? 'scudo' : 'scudi'}` : ''}.</p>
    <button class="btn block" data-act="start" data-m="mix">${I.play}Allenati</button></div></div></section>`;
  h += `<p class="section-title">Esercizi</p><div class="grid2">
    <button class="mode" data-act="start" data-m="gr_it" ${canSent ? '' : 'disabled'}>${I.translate}<b>Versione</b><span>dal greco all'italiano</span></button>
    <button class="mode" data-act="start" data-m="it_gr" ${canSent ? '' : 'disabled'}>${I.pen}<b>Retroversione</b><span>dall'italiano al greco</span></button>
    <button class="mode" data-act="start" data-m="forme">${I.lens}<b>Forme</b><span>analizza, scrivi, completa</span></button>
    <button class="mode" data-act="start" data-m="lessico">${I.cards}<b>Lessico</b><span>parole e significati</span></button>
    <button class="mode" data-act="start" data-m="nuove" ${S.settings.gen && T.has('pres') && T.has('art') ? '' : 'disabled'}>${I.spark}<b>Frasi nuove</b><span>create sul momento</span></button>
    <button class="mode" data-act="start" data-m="review" ${nErr ? '' : 'disabled'}>${I.retry}<b>Ripasso</b><span>${nErr ? nErr + ' errori da rivedere' : 'nessun errore'}</span></button>
    <button class="mode" data-act="start" data-m="alfabeto">${I.alpha}<b>Alfabeto</b><span>leggi e trascrivi</span></button></div>`;
  h += `<section class="card maxim"><p class="section-title" style="margin-top:0">Massima del giorno</p><p class="gr" lang="grc">${esc(max[0])}</p><p>${esc(max[1])}</p><cite>${esc(max[2])}</cite><p class="note">${esc(max[3])}</p><button class="tool" data-act="speakText" data-w="${esc(max[0])}">${I.sound}Ascolta</button></section>`;
  h += `<section class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div><b>Grado: ${gr(rk.r.name)}</b><div class="note">${esc(rk.r.tr)}${rk.next ? ` · ${rk.next.xp - S.xp} XP a ${esc(rk.next.tr)}` : ''}</div></div>${I.owl.replace('<svg', '<svg style="width:34px;height:34px;color:var(--ochre)"')}</div>
    <div class="bar" style="margin-top:10px"><i style="width:${rk.next ? Math.round(((S.xp - rk.r.xp) / (rk.next.xp - rk.r.xp)) * 100) : 100}%"></i></div></section>`;
  h += `<section class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 style="margin:0">I tuoi argomenti</h2><button class="btn small ghost" data-act="picker">Modifica</button></div>
    <p class="note">${T.size} argomenti scelti${latest ? ' · ultimo: ' + esc(TOPIC[latest].title) : ''}. ${sp} frasi verificate disponibili${S.settings.gen ? ', più le frasi generate' : ''}.</p>
    <ul class="list">${ORDER.filter((t) => T.has(t)).slice(-4).reverse().map((t) => topicRow(t, true)).join('')}</ul></section>`;
  return h;
}
function topicRow(id, practice) {
  const t = TOPIC[id];
  const m = S.mastery[id];
  return `<li><button class="rowbtn" data-act="${practice ? 'topicPractice' : 'topic'}" data-t="${id}"><span class="num ${GROUPS[t.group].color}">${t.n}</span><span class="txt"><b>${esc(t.title)}</b><span>${m ? Math.round(mastery(id) * 100) + '% di risposte giuste' : esc(t.desc)}</span></span>${I.chev}</button></li>`;
}
function viewLibrary() {
  let h = `<h1 style="margin-top:18px">Teoria</h1><p class="muted">I ventidue argomenti del biennio, nell'ordine dei manuali. Le tabelle sono generate dal motore morfologico.</p>
    <div class="tools"><button class="tool" data-act="methodSheet">${I.method}Il metodo di costruzione</button></div>`;
  for (const [gid, gdef] of Object.entries(GROUPS)) {
    const list = TOPICS.filter((t) => t.group === gid);
    if (!list.length) continue;
    h += `<p class="section-title">${esc(gdef.name)}</p><div class="card" style="padding:4px 12px"><ul class="list">${list.map((t) => topicRow(t.id)).join('')}</ul></div>`;
  }
  return h;
}
function viewTopic(id) {
  const t = TOPIC[id];
  const T = sel();
  return `<div style="display:flex;align-items:center;gap:10px;margin-top:16px"><button class="iconbtn" data-act="tab" data-v="lib" aria-label="Torna alla teoria">${I.back}</button><span class="tag">${esc(GROUPS[t.group].name)} · ${t.n}</span></div>
    <h1 style="margin-top:12px">${esc(t.title)}</h1><p class="muted">${esc(t.desc)}</p>
    <div class="tools"><button class="btn small" data-act="topicPractice" data-t="${id}" ${T.has(id) ? '' : 'disabled'}>${I.play}Esercitati su questo argomento</button>${T.has(id) ? '' : `<button class="btn small ghost" data-act="addTopic" data-t="${id}">Aggiungi ai miei argomenti</button>`}</div>
    <section class="card">${theoryHtml(t)}</section>`;
}
function viewWords() {
  const q = vocabQueue();
  const nDue = q.due.length + q.fresh.length;
  const learned = Object.values(S.vocab).filter((v) => v.box >= 3).length;
  return `<h1 style="margin-top:18px">Lessico</h1>
    <section class="card"><h2>Ripetizione dilazionata</h2><p class="note">${nDue ? `${q.due.length} parole da ripassare e ${q.fresh.length} nuove per oggi.` : 'Per oggi hai finito: torna domani.'} ${learned} parole imparate su ${q.all.length}.</p>
    <div id="flash" class="flash"></div></section>
    <section class="card"><h2>Cerca una forma</h2><p class="note">Scrivi una parola greca (anche senza accenti): il motore la analizza.</p>
    <div class="search"><label class="sr" for="q">Forma greca</label><input id="q" class="gr" lang="grc" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="es. λύσει"><button class="btn" data-act="search">${I.lens}<span class="sr">Cerca</span></button></div>
    <p class="note" style="margin-top:6px">Con la tastiera del computer puoi usare le lettere latine (h = η, w = ω…) e i segni ) ( / \\ = |.</p><div id="results"></div></section>`;
}
let flashCur = null;
function bindWords() {
  const q = vocabQueue();
  const list = q.due.concat(q.fresh);
  const f = $('#flash');
  if (!f) return;
  if (!list.length) { f.innerHTML = '<p class="muted">Nessuna parola da ripassare adesso.</p>'; return; }
  flashCur = { e: list[0], shown: false };
  drawFlash();
  const inp = $('#q');
  inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); act('search'); } else onTypedKey(ev); });
}
function drawFlash() {
  const f = $('#flash'); if (!f || !flashCur) return;
  const e = flashCur.e;
  f.innerHTML = `<span class="gr" lang="grc">${esc(e.head || e.lemma)}</span><div class="meaning">${flashCur.shown ? esc(e.m) : '<span class="muted">Ricordi il significato?</span>'}</div>
    <div class="tools" style="justify-content:center;margin-top:12px">${flashCur.shown ? `<button class="btn err small" data-act="flash" data-v="0">Non lo sapevo</button><button class="btn ok small" data-act="flash" data-v="1">Lo sapevo</button>` : `<button class="btn small" data-act="flashShow">Mostra</button><button class="tool" data-act="speakText" data-w="${esc(e.lemma)}">${I.sound}Ascolta</button>`}</div>`;
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
    out.innerHTML = (exact ? '' : '<p class="note">Nessuna forma con questi accenti: ecco le forme che differiscono solo per i segni diacritici.</p>') +
      `<ul class="analysis-list">${Object.entries(groups).map(([k, g]) => `<li><b lang="grc">${esc(g.e.head || g.e.lemma)}</b> — ${esc(g.e.m)}<ul>${uniq(g.items.map((a) => `${a.f}: ${a.d}`)).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><button class="tool" data-act="paradigm" data-e="${k}">${I.table}Paradigma</button></li>`).join('')}</ul>`;
  }, 20);
}
function weekSvg() {
  const days = [...Array(7)].map((_, i) => addDays(dayKey(), i - 6));
  const vals = days.map((d) => S.days[d] || 0);
  const max = Math.max(S.goal, ...vals);
  const names = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  return `<svg class="week" viewBox="0 0 280 120" role="img" aria-label="XP degli ultimi sette giorni: ${vals.join(', ')}">${days.map((d, i) => {
    const hgt = Math.round((vals[i] / max) * 80);
    const [y, m, dd] = d.split('-').map(Number);
    const wd = new Date(y, m - 1, dd).getDay();
    return `<rect x="${i * 40 + 8}" y="${92 - hgt}" width="24" height="${Math.max(2, hgt)}" rx="5" fill="${vals[i] >= S.goal ? 'var(--lapis)' : 'var(--ochre-line)'}"/><text x="${i * 40 + 20}" y="110" text-anchor="middle" font-size="11" fill="var(--muted)">${names[wd]}</text>`;
  }).join('')}<line x1="0" x2="280" y1="${92 - Math.round((S.goal / max) * 80)}" y2="${92 - Math.round((S.goal / max) * 80)}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/></svg>`;
}
function medal(id, on) {
  return `<svg class="medal" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="${on ? 'var(--ochre-bg)' : 'var(--bg2)'}" stroke="${on ? 'var(--ochre-line)' : 'var(--line)'}" stroke-width="2.5"/><path d="M12 30c3-1 5-4 6-8M36 30c-3-1-5-4-6-8M14 22c2 0 3-1 4-3M34 22c-2 0-3-1-4-3" stroke="${on ? 'var(--ochre)' : 'var(--muted)'}" stroke-width="2" fill="none" stroke-linecap="round"/><text x="24" y="29" text-anchor="middle" font-family="GFS Didot, serif" font-size="15" fill="${on ? 'var(--ink)' : 'var(--muted)'}">${esc(BADGES.find((b) => b.id === id).name[0])}</text></svg>`;
}
function viewMe() {
  const rk = rankOf(S.xp);
  const acc = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) : 0;
  const set = S.settings;
  const sw = (k, label, sub) => `<div class="setting"><div><b>${label}</b><span>${sub}</span></div><label class="switch"><input type="checkbox" data-set="${k}" ${set[k] === true || set[k] === 'lenient' || set[k] === 'keys' ? 'checked' : ''} aria-label="${esc(label)}"><i></i></label></div>`;
  return `<h1 style="margin-top:18px">${S.name ? esc(S.name) : 'Il tuo profilo'}</h1>
    <section class="card"><b>Grado: ${gr(rk.r.name)}</b> <span class="muted">(${esc(rk.r.tr)})</span><div class="bar" style="margin:10px 0"><i style="width:${rk.next ? Math.round(((S.xp - rk.r.xp) / (rk.next.xp - rk.r.xp)) * 100) : 100}%"></i></div>
    <p class="note">${S.xp} XP${rk.next ? ` · prossimo grado ${gr(rk.next.name)} a ${rk.next.xp} XP` : ' · grado massimo'}</p>
    <div class="grid2" style="grid-template-columns:repeat(3,1fr)"><div><b>${effectiveStreak()}</b><div class="note">giorni di fila</div></div><div><b>${S.shields}</b><div class="note">scudi</div></div><div><b>${acc}%</b><div class="note">precisione</div></div></div>
    ${weekSvg()}</section>
    <p class="section-title">Insegne</p><section class="card"><div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? '' : 'off'}">${medal(b.id, !!S.badges[b.id])}<b lang="grc">${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join('')}</div></section>
    <p class="section-title">Impostazioni</p><section class="card">
    <div class="setting"><div><b>Argomenti studiati</b><span>${S.topics.length} su ${ORDER.length}</span></div><button class="btn small ghost" data-act="picker">Modifica</button></div>
    <div class="setting"><div><b>Obiettivo giornaliero</b><span>XP al giorno</span></div><div class="seg">${[30, 50, 80, 120].map((g) => `<button data-act="goal" data-v="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join('')}</div></div>
    ${sw('accents', 'Accenti facoltativi', 'Un errore di accento o di spirito viene segnalato ma non conta come errore')}
    ${sw('input', 'Scrivi invece delle tessere', 'Risposte da tastiera nelle traduzioni')}
    ${sw('gen', 'Frasi generate', 'Oltre alle frasi verificate, frasi nuove create sul dispositivo')}
    ${sw('sound', 'Suoni', 'Segnali sonori per le risposte')}
    ${sw('voice', 'Lettura ad alta voce', 'Pronuncia erasmiana con la voce italiana del dispositivo')}
    ${sw('online', 'Wikizionario', 'Mostra il collegamento al dizionario online (si invia solo la parola cercata)')}
    <div class="setting"><div><b>Tema</b><span>Aspetto dei colori</span></div><div class="seg">${[['auto', 'Auto'], ['light', 'Chiaro'], ['dark', 'Scuro']].map(([v, l]) => `<button data-act="theme" data-v="${v}" aria-pressed="${set.theme === v}">${l}</button>`).join('')}</div></div>
    <div class="setting"><div><b>Installa l'app</b><span>${isStandalone() ? 'Hermeneus è già installata.' : 'Sul telefono funziona anche senza rete.'}</span></div><button class="btn small" data-act="install" ${isStandalone() ? 'disabled' : ''}>${I.install}Installa</button></div>
    <div class="setting"><div><b>Nome</b><span>Facoltativo, resta sul dispositivo</span></div><button class="btn small ghost" data-act="rename">Cambia</button></div>
    <div class="setting"><div><b>Copia di sicurezza</b><span>Salva o ripristina i progressi in un file</span></div><div class="seg"><button data-act="export">Salva</button><button data-act="import">Ripristina</button></div></div>
    <div class="setting"><div><b>Azzera i progressi</b><span>Cancella tutto da questo dispositivo</span></div><button class="btn small err" data-act="reset">Azzera</button></div></section>
    <section class="card"><h2>Informazioni</h2><p class="note">Hermeneus funziona tutto sul tuo dispositivo: nessun account, nessuna raccolta di dati, nessuna intelligenza artificiale. La pronuncia è quella erasmiana della scuola italiana; la lettura usa la sintesi vocale del dispositivo. Caratteri: Gentium Plus, GFS Didot, Fira Sans (licenza SIL OFL 1.1). Il dizionario online facoltativo è il Wikizionario (CC BY-SA).</p>
    <p class="note">${E.LEX.length} lemmi, ${BANK.length} frasi verificate, ${B.SENTENTIAE.length} massime.</p></section>`;
}

/* ---------- Scelta degli argomenti e onboarding ---------- */
function pickerHtml(set) {
  return `<p class="note">Tocca «fin qui» su un argomento per selezionare tutto il programma fino a quel punto; poi aggiungi o togli i singoli argomenti.</p>
    ${TOPICS.map((t) => `<div class="topic-pick"><input type="checkbox" id="tp-${t.id}" data-tp="${t.id}" ${set.has(t.id) ? 'checked' : ''}><label for="tp-${t.id}"><b>${t.n}. ${esc(t.title)}</b><span>${esc(t.desc)}</span></label><button class="btn small ghost" data-act="upto" data-t="${t.id}" aria-label="Seleziona fino a ${esc(t.short)}">fin qui</button></div>`).join('')}`;
}
let pickSet = null;
function openPicker() {
  pickSet = sel();
  openSheet('Argomenti studiati', pickerHtml(pickSet) + `<div style="position:sticky;bottom:0;background:var(--bg);padding:12px 0"><button class="btn block" data-act="savePicker">Salva</button></div>`);
}
function redrawPicker() { $$('[data-tp]').forEach((c) => { c.checked = pickSet.has(c.dataset.tp); }); }
let onb = null;
function startOnboarding() {
  onb = onb || { step: 0, name: S.name || '', set: new Set(S.topics.length ? S.topics : ['alf', 'art', 'd1', 'pres']), goal: S.goal, accents: S.settings.accents };
  drawOnb();
}
function drawOnb() {
  const app = $('#app');
  const steps = `<div class="steps" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= onb.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let h = `<header class="topbar"><div class="row"><div class="brand">${MARK}<b lang="grc">Ἑρμηνεύς</b><small>l’interprete</small></div></div><div class="meander"></div></header><main id="main" tabindex="-1" style="padding-top:12px">${steps}`;
  if (onb.step === 0) {
    h += `<h1>Benvenuto in Hermeneus</h1><p>Una palestra di traduzione dal greco e verso il greco per il biennio del liceo classico: frasi sugli argomenti che hai studiato, teoria a portata di mano, lessico e un po' di sana competizione con te stesso.</p>
      <section class="card"><label for="nm"><b>Come ti chiami?</b> <span class="muted">(facoltativo)</span></label><input id="nm" class="typed" style="margin-top:8px" maxlength="24" autocomplete="off" value="${esc(onb.name)}" placeholder="Nome o soprannome">
      <p class="note" style="margin-top:10px">Tutto resta su questo dispositivo: nessun account, nessun dato inviato a nessuno.</p></section>
      <button class="btn block" data-act="onbNext">Avanti</button>`;
  } else if (onb.step === 1) {
    h += `<h1>Fin dove sei arrivato?</h1><section class="card">${pickerHtml(onb.set)}</section><button class="btn block" data-act="onbNext">Avanti</button>`;
  } else {
    h += `<h1>Ultime scelte</h1><section class="card"><div class="setting"><div><b>Obiettivo giornaliero</b><span>XP al giorno</span></div><div class="seg">${[30, 50, 80, 120].map((g) => `<button data-act="onbGoal" data-v="${g}" aria-pressed="${onb.goal === g}">${g}</button>`).join('')}</div></div>
      <div class="setting"><div><b>Accenti facoltativi</b><span>Gli errori d'accento vengono segnalati ma non contano. Potrai cambiare idea nel profilo.</span></div><label class="switch"><input type="checkbox" id="onbAcc" ${onb.accents === 'lenient' ? 'checked' : ''} aria-label="Accenti facoltativi"><i></i></label></div></section>
      <button class="btn block" data-act="onbDone">Comincia</button>`;
  }
  h += `${onb.step ? '<button class="btn ghost block" style="margin-top:10px" data-act="onbBack">Indietro</button>' : ''}</main>`;
  app.innerHTML = h;
}

/* ---------- Installazione ---------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); deferredPrompt = ev; if (S.onboarded && !SES) render(); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('Hermeneus è installata.'); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const installable = () => !isStandalone() && (deferredPrompt || isIOS() || SITE);
function installFlow() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; render(); }); return; }
  if (isIOS()) {
    showModal(`<h2>Installa su iPhone o iPad</h2><ol><li>Apri questa pagina con <b>Safari</b>.</li><li>Tocca il pulsante <b>Condividi</b> ${I.share.replace('<svg', '<svg style="width:18px;height:18px;vertical-align:-3px"')} in basso.</li><li>Scegli <b>Aggiungi alla schermata Home</b> ${I.plus.replace('<svg', '<svg style="width:18px;height:18px;vertical-align:-3px"')}.</li><li>Tocca <b>Aggiungi</b>: l'icona di Hermeneus comparirà tra le app.</li></ol><button class="btn block" data-act="closeModal">Ho capito</button>`);
    return;
  }
  showModal(`<h2>Installa l'app</h2><p>Su Android apri il menu del browser (⋮) e scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>. Su computer usa l'icona di installazione nella barra dell'indirizzo.</p>${SITE ? '' : '<p class="note">L’installazione richiede la versione pubblicata sul sito; questo file autonomo si può comunque aprire da qualunque browser, anche senza rete.</p>'}<button class="btn block" data-act="closeModal">Ho capito</button><button class="btn ghost block" style="margin-top:8px" data-act="hideInstall">Non mostrare più l'avviso</button>`);
}

/* ---------- Azioni ---------- */
const ACT = {
  tab: (el) => { VIEW = el.dataset.v; render(); window.scrollTo(0, 0); const m = $('#main'); if (m) m.focus({ preventScroll: true }); },
  start: (el) => startSession(el.dataset.m),
  topicPractice: (el) => { if (!S.topics.includes(el.dataset.t)) { toast('Aggiungi prima l’argomento ai tuoi argomenti.'); return; } startSession('topic', { topic: el.dataset.t }); },
  topic: (el) => { VIEW = 'topic:' + el.dataset.t; const app = $('#main'); app.innerHTML = viewTopic(el.dataset.t); window.scrollTo(0, 0); app.focus({ preventScroll: true }); },
  addTopic: (el) => { S.topics = uniq(S.topics.concat([el.dataset.t])).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)); save(); ACT.topic(el); toast('Argomento aggiunto.'); },
  quit: () => { const go = () => { SES = null; closeOverlay(); render(); }; if (SES && SES.i > 0 && !SES.done) askConfirm('Interrompere l’allenamento? I punti di questa sessione andranno persi.', 'Interrompi', go); else go(); },
  modalOk: () => { const i = $('#mdIn'); const v = i ? i.value : true; const cb = modalCb; modalCb = null; closeModal(); if (cb) cb(v); },
  check: () => doCheck(),
  next: () => { SES.i++; renderItem(); },
  again: () => { const m = SES.mode, o = SES.opts; startSession(m, o); },
  startReview: () => startSession('review'),
  endSession: () => endSession(),
  tile: (el) => { const c = SES.cur; if (c.answered) return; const k = +el.dataset.k; if (c.chosen.includes(k)) return; c.chosen.push(k); sfx.tap(); refreshAnswer(); },
  untile: (el) => { const c = SES.cur; if (c.answered) return; c.chosen.splice(+el.dataset.j, 1); refreshAnswer(); },
  pick: (el) => { const c = SES.cur; if (c.answered) return; c.picked = +el.dataset.k; doCheck(); },
  self: (el) => { const c = SES.cur; const d = c.selfData; c.answered = false; finalize({ ok: el.dataset.v === '1', sol: d.sol, given: d.ans, typed: true, self: true }); },
  toggleInput: (el) => { const c = SES.cur; if (c.answered) return; c.inputMode = c.inputMode === 'tiles' ? 'keys' : 'tiles'; c.chosen = []; $('#ansWrap').innerHTML = answerArea(c.it); el.innerHTML = c.inputMode === 'tiles' ? I.keys + 'Scrivi' : I.tiles + 'Tessere'; refreshAnswer(); const t = $('#typed'); if (t) t.focus({ preventScroll: true }); },
  word: (el) => { const it = SES && SES.cur && SES.cur.it; const s = it && it.s; if (!s) return; const tok = tokensOf(s)[+el.dataset.i]; if (tok) wordPop(el, tok); },
  speak: () => speak(SES.cur.it.s.gr),
  speakSent: () => speak(SES.cur.it.s.gr),
  speakForm: () => speak(SES.cur.it.form || SES.cur.it.word),
  speakWord: (el) => speak(el.dataset.w),
  speakText: (el) => speak(el.dataset.w),
  method: (el) => { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', on); $$('#ovBody .w.vb').forEach((w) => w.classList.toggle('verb', on)); $('#aux').innerHTML = on ? `<div class="tip"><b>Metodo</b>I verbi di modo finito sono evidenziati: tanti verbi, tante proposizioni. Poi cerca il soggetto (nominativo) e l'oggetto (accusativo). <button class="tool" data-act="methodSheet">${I.method}Tutti i passi</button></div>` : ''; },
  methodSheet: () => methodSheet(),
  hint: () => hint(),
  theory: (el) => theorySheet(el.dataset.t),
  analysis: () => analysisSheet(SES.cur.it.s),
  paradigm: (el) => { closePop(); paradigmSheet(E.LEX[+el.dataset.e]); },
  closeSheet: () => closeSheet(),
  closeModal: () => closeModal(),
  kb: (el) => { const t = $('#typed'); if (!t || t.readOnly) return; insertText(t, kbUpper ? el.dataset.k.toUpperCase() : el.dataset.k); if (kbUpper) { kbUpper = false; } },
  kbd: (el) => { const t = $('#typed'); if (!t || t.readOnly) return; applyMark(t, el.dataset.m); },
  kbx: () => { const t = $('#typed'); if (!t || t.readOnly) return; const a = t.selectionStart ?? t.value.length; const chars = [...t.value.slice(0, a)]; chars.pop(); t.value = chars.join('') + t.value.slice(a); normalizeTyped(t, chars.join('').length); },
  kbcase: () => { kbUpper = !kbUpper; toast(kbUpper ? 'Prossima lettera maiuscola.' : 'Minuscole.'); },
  picker: () => openPicker(),
  upto: (el) => { const k = ORDER.indexOf(el.dataset.t); const set = onb && !S.onboarded ? onb.set : pickSet; set.clear(); ORDER.slice(0, k + 1).forEach((t) => set.add(t)); if (onb && !S.onboarded) drawOnb(); else redrawPicker(); },
  savePicker: () => { if (!pickSet.size) { toast('Scegli almeno un argomento.'); return; } S.topics = ORDER.filter((t) => pickSet.has(t)); save(); closeSheet(); render(); toast('Argomenti aggiornati.'); },
  goal: (el) => { S.goal = +el.dataset.v; save(); render(); },
  theme: (el) => { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  install: () => installFlow(),
  hideInstall: () => { S.settings.installHidden = true; save(); closeModal(); render(); },
  rename: () => askText('Il tuo nome (facoltativo)', S.name, (n) => { S.name = String(n).trim().slice(0, 24); save(); render(); }),
  export: () => { const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hermeneus-progressi-' + dayKey() + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); },
  import: () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json,.json'; i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then((t) => { try { const d = JSON.parse(t); if (d && d.v === 1) { localStorage.setItem(KEY, JSON.stringify(d)); load(); applyTheme(); render(); toast('Progressi ripristinati.'); } else toast('File non valido.'); } catch (e) { toast('File non valido.'); } }); }; i.click(); },
  reset: () => askConfirm('Cancellare tutti i progressi da questo dispositivo?', 'Cancella', () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ } S = DEFAULT(); onb = null; applyTheme(); render(); }, true),
  search: () => searchForm(),
  flashShow: () => { flashCur.shown = true; drawFlash(); },
  flash: (el) => { srs(flashCur.e, el.dataset.v === '1'); save(); bindWords(); },
  onbNext: () => { if (onb.step === 0) onb.name = ($('#nm').value || '').trim().slice(0, 24); if (onb.step === 1 && !onb.set.size) { toast('Scegli almeno un argomento.'); return; } onb.step++; drawOnb(); window.scrollTo(0, 0); },
  onbBack: () => { onb.step--; drawOnb(); },
  onbGoal: (el) => { onb.goal = +el.dataset.v; drawOnb(); },
  onbDone: () => { const acc = $('#onbAcc'); S.name = onb.name; S.topics = ORDER.filter((t) => onb.set.has(t)); S.goal = onb.goal; S.settings.accents = acc && acc.checked ? 'lenient' : 'strict'; S.onboarded = true; save(); onb = null; VIEW = 'home'; render(); },
};
function hint() {
  const it = SES.cur.it;
  const s = it.s;
  const toks = tokensOf(s);
  const verb = toks.find((t) => t && t.a && t.a.e.k === 'v' && t.a.m && !['inf', 'part'].includes(t.a.m));
  const subj = toks.find((t) => t && t.a && ['n', 'p'].includes(t.a.e.k) && t.a.c === 'nom');
  let txt = '';
  if (verb) txt += `Il verbo è ${gr(verb.a.f)}: ${esc(verb.a.d)} di ${gr(verb.a.e.head || verb.a.e.lemma)} («${esc(verb.a.e.m)}»). `;
  if (subj) txt += `Il soggetto è ${gr(subj.a.f)}. `;
  if (!txt) txt = esc(s.tip || 'Cerca il verbo, poi il soggetto al nominativo.');
  $('#aux').innerHTML = `<div class="tip"><b>Aiuto</b>${txt}</div>`;
}

/* ---------- Eventi ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  const pop = $('#pop');
  if (pop && !ev.target.closest('#pop') && !(el && el.dataset.act === 'word')) closePop();
  if (!el) return;
  if (el.disabled) return;
  const name = el.dataset.act;
  if (ACT[name]) { ev.preventDefault(); ACT[name](el); }
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.dataset.tp) {
    const set = onb && !S.onboarded ? onb.set : pickSet;
    if (t.checked) set.add(t.dataset.tp); else set.delete(t.dataset.tp);
  } else if (t.dataset.set) {
    const k = t.dataset.set;
    if (k === 'accents') S.settings.accents = t.checked ? 'lenient' : 'strict';
    else if (k === 'input') S.settings.input = t.checked ? 'keys' : 'tiles';
    else S.settings[k] = t.checked;
    save();
  }
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') { if ($('#pop')) closePop(); else if ($('#modal')) closeModal(); else if ($('#sheet')) closeSheet(); return; }
  if (ev.target && ev.target.id === 'typed') {
    onTypedKey(ev);
    if (ev.key === 'Enter' && ev.target.tagName === 'TEXTAREA' && !ev.shiftKey) { ev.preventDefault(); if (SES && SES.cur && SES.cur.answered) act('next'); else act('check'); }
    return;
  }
  if (ev.key === 'Enter' && SES && SES.cur && SES.cur.answered && !ev.target.closest('button,input,textarea')) { ev.preventDefault(); act('next'); }
});
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if ((t.id === 'typed' || t.id === 'q') && t.classList.contains('gr')) normalizeTyped(t, t.selectionStart ?? t.value.length);
});
window.addEventListener('resize', closePop);
window.addEventListener('scroll', closePop, true);

/* ---------- Avvio ---------- */
function warmLoop() {
  if (E.isReady()) return;
  const step = () => {
    E.warm(12);
    if (!E.isReady()) (window.requestIdleCallback || ((f) => setTimeout(f, 30)))(step);
  };
  setTimeout(step, 600);
}
function boot() {
  load();
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  render();
  warmLoop();
  try { if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) { /* ignora */ }
  if (SITE && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.HermApp = { S: () => S, startSession, buildItems, BANK };
boot();
})();
