/* Test dello stato salvato (HERM-003 del rapporto di revisione): file da importare, salvataggi guasti,
   codice di ripristino e andata e ritorno della copia su file. */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const C = require('../src/course.js');
const SV = require('../src/savecode.js');
const ST = require('../src/state.js');

const lessonIds = C.UNITS.flatMap((u) => u.lessons.map((l) => l.id));
const badgeIds = Array.from({ length: 18 }, (_, i) => 'b' + i);
const ctx = { lessonIds, lexCount: E.LEX.length };
const N = lessonIds.length;
const errors = [];
let n = 0;
const ok = (what, cond) => { n++; if (!cond) errors.push(what); };
const check = (d) => ST.check(JSON.parse(JSON.stringify(d)), ctx);
const refused = (what, d) => { const r = check(d); ok(`${what}: dovrebbe essere rifiutato`, r.problems.length > 0); return r; };
const accepted = (what, d) => { const r = check(d); ok(`${what}: dovrebbe essere accettato (${r.problems.join('; ')})`, r.problems.length === 0 && !r.fatal); return r; };

/* ---------- il caso del rapporto ---------- */
const report = refused('file del rapporto', { v: 2, onboarded: true, xp: 999, course: { unlocked: -1 } });
ok('file del rapporto: segnala la posizione nel percorso', report.problems.some((p) => p.includes('posizione nel percorso')));

/* ---------- posizione nel percorso ---------- */
for (const [what, u] of [['negativa', -1], ['oltre l’ultima lezione', N], ['molto oltre', 1e6], ['decimale', 2.5], ['stringa', '3'], ['null', null], ['oggetto', {}], ['vero/falso', true]]) {
  refused(`unlocked ${what}`, { v: 2, course: { unlocked: u } });
}
ok('unlocked NaN', ST.check({ v: 2, course: { unlocked: NaN } }, ctx).problems.length > 0);
ok('unlocked infinito', ST.check({ v: 2, course: { unlocked: Infinity } }, ctx).problems.length > 0);
accepted('unlocked 0', { v: 2, course: { unlocked: 0 } });
accepted('unlocked all’ultima lezione', { v: 2, course: { unlocked: N - 1 } });

/* ---------- strutture incomplete o estranee ---------- */
for (const [what, d] of [['null', null], ['lista', []], ['testo', 'ciao'], ['numero', 3], ['senza versione', { xp: 10 }], ['versione 3', { v: 3, course: { unlocked: 0 } }], ['versione testo', { v: '2', course: { unlocked: 0 } }]]) {
  const r = refused(what, d);
  ok(`${what}: non è un salvataggio`, r.fatal);
}
refused('versione 2 senza percorso', { v: 2, xp: 10 });
refused('percorso vuoto', { v: 2, course: {} });
refused('percorso come lista', { v: 2, course: [] });
refused('percorso null', { v: 2, course: null });
accepted('versione 1 con argomenti', { v: 1, onboarded: true, topics: ['alf', 'acc'] });

/* ---------- tipi, enumerazioni e intervalli degli altri campi ---------- */
const base = { v: 2, course: { unlocked: 4 } };
const bad = [
  ['xp negativi', { xp: -5 }], ['xp testo', { xp: '100' }], ['xp enormi', { xp: 1e20 }], ['xp decimali', { xp: 1.5 }],
  ['obiettivo fuori elenco', { goal: 55 }], ['scudi oltre 2', { shields: 3 }], ['serie negativa', { streak: -1 }],
  ['ultimo giorno', { lastDay: 'ieri' }], ['giorni con chiave sbagliata', { days: { oggi: 10 } }], ['giorni con punti negativi', { days: { '2026-10-01': -3 } }],
  ['nome numero', { name: 42 }], ['benvenuto testo', { onboarded: 'sì' }], ['argomenti non lista', { topics: 'alf' }],
  ['stelle oltre 3', { course: { unlocked: 4, stars: { [lessonIds[0]]: 4 } } }], ['stelle testo', { course: { unlocked: 4, stars: { [lessonIds[0]]: '3' } } }],
  ['tema sconosciuto', { settings: { theme: 'neon' } }], ['accenti sconosciuti', { settings: { accents: 'boh' } }], ['suono testo', { settings: { sound: 'no' } }],
  ['impostazioni lista', { settings: [] }], ['livello sconosciuto', { prac: { level: 'impossibile' } }], ['tipo sconosciuto', { prac: { type: 'tutto' } }],
  ['statistica negativa', { stats: { answered: -1 } }], ['statistiche null', { stats: null }], ['padronanza incoerente', { mastery: { alf: { a: 2, c: 5 } } }],
  ['errore senza data', { mistakes: [{ k: 's', id: 'b1', dir: 'gr_it' }] }], ['errore con parola fuori lessico', { mistakes: [{ k: 'f', e: E.LEX.length, key: 'x', t: 'scrivi', at: 1 }] }],
  ['errore di tipo sconosciuto', { mistakes: [{ k: 'z', at: 1 }] }], ['errore con id numerico', { mistakes: [{ k: 's', id: 5, dir: 'gr_it', at: 1 }] }],
  ['lessico con scatola 9', { vocab: { 3: { box: 9, due: '2026-10-01' } } }], ['frase generata senza traduzioni', { genSaved: [{ id: 'g1', gr: 'x', it: [], tok: [] }] }],
];
for (const [what, extra] of bad) refused(what, Object.assign({}, base, extra));

/* ---------- errori su lettere, accenti, lettura e concordanza (ripasso) ---------- */
const xs = [
  { k: 'x', t: 'lettera', d: { reverse: false, prompt: 'Β β', right: 'beta', options: ['beta', 'delta', 'eta'] }, at: 1 },
  { k: 'x', t: 'accento', d: { word: 'λόγος', right: 'parossitona', options: ['parossitona', 'ossitona'] }, at: 2 },
  { k: 'x', t: 'alfabeto', d: { e: 3, word: 'λόγος', right: 'lógos', options: ['lógos', 'lóghos'] }, at: 3 },
  { k: 'x', t: 'accorda', d: { mode: 'art', e: 3, n: 3, nk: 'n.gen.s', nf: 'λόγου', art: '', answer: 'τοῦ', options: ['τοῦ', 'τῷ', 'τόν'] }, at: 4 },
];
accepted('errori da ripassare di ogni tipo', Object.assign({}, base, { mistakes: xs }));
refused('errore di lettera senza opzioni', Object.assign({}, base, { mistakes: [{ k: 'x', t: 'lettera', d: { prompt: 'Β β', right: 'beta', options: [] }, at: 1 }] }));
refused('errore di concordanza con parola fuori lessico', Object.assign({}, base, { mistakes: [{ k: 'x', t: 'accorda', d: Object.assign({}, xs[3].d, { n: E.LEX.length }), at: 1 }] }));
refused('errore di tipo d’esercizio sconosciuto', Object.assign({}, base, { mistakes: [{ k: 'x', t: 'abbina', d: { options: ['a', 'b'] }, at: 1 }] }));

/* ---------- riparazione di un salvataggio già guasto: i dati buoni restano ---------- */
const broken = check({ v: 2, onboarded: true, xp: 123, streak: 4, name: 'Saffo', course: { unlocked: -1, stars: { [lessonIds[0]]: 3 } }, settings: { theme: 'neon', sound: false } });
ok('riparazione: due problemi', broken.problems.length === 2);
ok('riparazione: posizione azzerata', broken.state.course.unlocked === 0);
ok('riparazione: XP, serie e nome conservati', broken.state.xp === 123 && broken.state.streak === 4 && broken.state.name === 'Saffo');
ok('riparazione: stelle conservate', broken.state.course.stars[lessonIds[0]] === 3);
ok('riparazione: tema iniziale, suono conservato', broken.state.settings.theme === 'auto' && broken.state.settings.sound === false);

/* ---------- lo stato candidato è nuovo: l'originale non cambia ---------- */
const input = { v: 2, onboarded: true, xp: 50, course: { unlocked: 3, stars: { [lessonIds[0]]: 2 }, times: {} }, mistakes: [{ k: 'l', e: 3, at: 1 }] };
const frozen = JSON.stringify(input);
const cand = ST.check(input, ctx).state;
cand.xp = 0; cand.course.stars[lessonIds[0]] = 0; cand.mistakes.push({});
ok('il controllo non modifica i dati letti', JSON.stringify(input) === frozen);

/* ---------- andata e ritorno della copia su file ---------- */
let seed = 7;
const rnd = (k) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
const day = (k) => new Date(Date.UTC(2026, 0, 1) + k * 864e5).toISOString().slice(0, 10);
for (let k = 0; k < 300; k++) {
  const S = ST.defaults();
  Object.assign(S, { onboarded: true, name: ['', 'Saffo', 'Niccolò'][rnd(3)], goal: [30, 50, 80, 120][rnd(4)], xp: rnd(90000), streak: rnd(200), lastDay: day(rnd(300)), shields: rnd(3), backupAt: Date.now(), savedAt: Date.now() });
  S.course.unlocked = rnd(N);
  for (let i = 0; i <= S.course.unlocked; i++) if (rnd(3)) { S.course.stars[lessonIds[i]] = 1 + rnd(3); S.course.times[lessonIds[i]] = 1 + rnd(4); }
  S.days[day(rnd(300))] = rnd(400);
  S.mastery.alf = { a: 10, c: rnd(11) };
  S.vocab[rnd(E.LEX.length)] = { box: rnd(6), due: day(rnd(300)) };
  S.mistakes = [{ k: 's', id: 'b' + rnd(200), dir: 'gr_it', at: Date.now() }, { k: 'f', e: rnd(E.LEX.length), key: 'n.nom.s', t: 'scrivi', at: Date.now() }, { k: 'l', e: rnd(E.LEX.length), at: Date.now() }];
  S.recent = ['b1', 'b2'];
  S.genSaved = [{ id: 'g' + k, gr: 'x', it: ['y'], tags: [], focus: 'alf', tip: '', src: 'gen', tok: [[3, 'lemma', 'x'], ['.']] }];
  S.badges = { b1: day(2) };
  S.stats.answered = rnd(5000); S.stats.correct = rnd(5000); S.stats.types = { gr_it: rnd(50) };
  Object.assign(S.settings, { accents: ['lenient', 'strict'][rnd(2)], input: ['tiles', 'keys'][rnd(2)], theme: ['auto', 'light', 'dark'][rnd(3)], online: !rnd(2) });
  Object.assign(S.prac, { unit: rnd(2) ? null : 'alf', type: ['misto', 'frasi', 'forme', 'parole'][rnd(4)], level: ['facile', 'media', 'difficile', 'esperto'][rnd(4)], wide: !rnd(2) });
  S.topics = ['alf'];
  const r = check(S);
  if (r.problems.length || JSON.stringify(r.state) !== JSON.stringify(S)) { errors.push(`copia su file ${k}: ${r.problems.join('; ') || 'stato diverso'}`); break; }
  n++;
}

/* ---------- codice di ripristino: stesso controllo, nessun problema ---------- */
for (let k = 0; k < 300; k++) {
  const S = ST.defaults();
  Object.assign(S, { xp: rnd(200000), streak: rnd(900), shields: rnd(3), goal: [30, 50, 80, 120][rnd(4)], name: 'Ada' });
  S.course.unlocked = rnd(N);
  for (let i = 0; i <= S.course.unlocked; i++) if (rnd(2)) S.course.stars[lessonIds[i]] = 1 + rnd(3);
  const part = SV.decode(SV.encode(S, lessonIds, badgeIds), lessonIds, badgeIds);
  const def = ST.defaults();
  const d = Object.assign(def, part, { v: 2, onboarded: true, course: Object.assign(def.course, part.course), stats: Object.assign(def.stats, part.stats), settings: Object.assign(def.settings, part.settings), prac: Object.assign(def.prac, part.prac) });
  const r = ST.check(d, ctx);
  if (r.problems.length || r.state.course.unlocked !== S.course.unlocked || r.state.xp !== S.xp) { errors.push(`codice ${k}: ${r.problems.join('; ') || 'valori diversi'}`); break; }
  n++;
}

console.log('\nTest dello stato salvato');
console.log(`  Verifiche: ${n} (lezioni del percorso: ${N}, parole del lessico: ${E.LEX.length})`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.slice(0, 30).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
