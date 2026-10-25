/* Test delle correzioni di contenuto della revisione (HERM-007 e HERM-009):
   congiuntivo dopo i verbi di opinione, palestra limitata alle lezioni raggiunte, testi corretti. */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
const IT = require('../src/italian.js');
const SEM = require('../src/semantic.js');
const GN = require('../src/generator.js');
const C = require('../src/course.js');
const B = require('../src/bank.js');
const L = require('../src/lessons.js');
const fs = require('fs');
const path = require('path');
const G = E.G;

const errors = [];
let n = 0;
const ok = (what, cond) => { n++; if (!cond) errors.push(what); };
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- italiano: «ritengono che la figlia ascolti», «dicono che la figlia ascolta» ---------- */
GN.seed(mulberry32(5));
const IND = new Set(), CONG = new Set();
for (const v of SEM.VERBS) for (const inf of v.it) for (const p of [2, 5]) {
  const a = IT.verb(inf, 'pres', { p }), b = IT.verb(inf, 'cpres', { p });
  if (a !== b) { IND.add(a); CONG.add(b); }
}
const upTo = SN.ORDER.slice(0, SN.ORDER.indexOf('inf') + 1).filter((t) => t !== 'alf');
let opinion = 0, saying = 0;
for (let k = 0; k < 3000 && (opinion < 40 || saying < 20); k++) {
  const s = GN.generate(upTo, 'inf', { strict: true });
  if (!s) continue;
  for (const it of s.it) {
    const m = it.match(/\b(ritiene|ritengono|crede|credono|dice|dicono) che (.*)$/);
    if (!m) continue;
    const rest = ' ' + m[2].replace(/[.,;!?]/g, '') + ' ';
    const has = (set) => [...set].some((f) => rest.includes(' ' + f + ' '));
    if (/^(dice|dicono)$/.test(m[1])) { saying++; ok(`dichiarativo con l’indicativo: ${it}`, has(IND)); }
    else { opinion++; ok(`opinione con il congiuntivo: ${it}`, has(CONG) && !has(IND)); }
  }
}
ok(`frasi con verbi di opinione trovate (${opinion})`, opinion >= 10);

/* ---------- palestra: solo le parole delle lezioni raggiunte ---------- */
const BANK = B.BANK.map((b, i) => {
  const lx = SN.lexicalize(b[0]);
  const declared = b[2].split(/\s+/);
  return { id: 'b' + i, gr: b[0], it: b[1].split('|'), tags: [...SN.sentenceReqs(lx.tokens, declared).tags], focus: declared.sort((a, c) => SN.ORDER.indexOf(c) - SN.ORDER.indexOf(a))[0], tokens: lx.tokens, src: 'bank' };
});
L.init({ bank: BANK, rand: mulberry32(9) });
let built = 0, sentences = 0;
for (const f of L.FLAT) {
  if (f.ui === 0 || f.idx % 3) continue; // dall'unità 2, una lezione ogni tre
  const reached = new Set(L.FLAT.filter((x) => x.idx <= f.idx).map((x) => x.lesson.id));
  const vocab = L.vocabUpTo(f.lesson.id);
  const T = L.topicsUpTo(f.lesson.id);
  const items = L.buildPractice({ T, focus: f.unit.id, vocab, reached, gen: true, genShare: 0.5 });
  built += items.length;
  ok(`lezione ${f.lesson.id}: almeno 6 esercizi (${items.length})`, items.length >= 6);
  for (const it of items) {
    if (it.s) { sentences++; ok(`lezione ${f.lesson.id}: frase oltre le lezioni raggiunte: ${it.s.gr}`, !!L.sentenceFits(it.s, T, vocab, 1)); }
    if ((it.type === 'analizza' || it.type === 'scrivi') && it.e && ['n', 'v', 'a'].includes(it.e.k)) ok(`lezione ${f.lesson.id}: forma di una parola non ancora vista: ${it.e.lemma}`, vocab.has(it.e.lemma));
  }
}

/* ---------- testi corretti ---------- */
const src = (f) => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const app = src('app.js'), topics = src('topics.js');
ok('il numero dei passi del metodo non è scritto a mano', !/(Sette|Otto) passi per/.test(app) && /STEPS\(\)/.test(app));
ok('il metodo ha otto passi', B.METHOD.length === 8);
ok('spirito e accento distinti nella teoria', !topics.includes('conta come una lettera') && topics.includes('ὅρος') && topics.includes('ὄρος'));
ok('nessuna promessa «senza errori di stampa»', !app.includes('errori di stampa'));
ok('nessuna promessa «dieci minuti bastano»', !app.includes('dieci minuti al giorno bastano'));
ok('la voce è descritta come lettura approssimata', app.includes('Lettura approssimata con la voce italiana') && topics.includes('lettura approssimata'));
ok('imperativo aoristo senza «azione puntuale»', !src('generator.js').includes('azione puntuale'));
ok('preposizioni: usi del corso, non elenco completo', topics.includes('trattati nel corso'));

console.log('\nTest delle correzioni di contenuto');
console.log(`  Verifiche: ${n}; completive con verbo di opinione: ${opinion}, con verbo dichiarativo: ${saying}; esercizi di palestra: ${built} (frasi: ${sentences})`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.slice(0, 30).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
