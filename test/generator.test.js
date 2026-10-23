/* Test del generatore: 10.000 frasi su combinazioni di argomenti diverse.
   Per ogni frase: nessun errore, ogni parola riconosciuta dal motore con l'accento giusto nel contesto,
   ogni parola dentro gli argomenti scelti, traduzioni italiane presenti e pulite.
   Uso: node test/generator.test.js [numero] [file-campione] */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const S = require('../src/sentence.js');
require('../src/italian.js'); require('../src/semantic.js');
const GN = require('../src/generator.js');
const fs = require('fs');

// generatore pseudo-casuale riproducibile (mulberry32)
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(20261023);
GN.seed(rnd);

const ORDER = S.ORDER.filter((t) => t !== 'alf');
const N = +process.argv[2] || 10000;
const sampleFile = process.argv[3] || 'campione-frasi.md';
// combinazioni: metà «fino all'argomento k», metà sottoinsiemi casuali (sempre con articolo e presente)
function combo(i) {
  if (i % 2 === 0) { const k = 3 + (i / 2) % (ORDER.length - 2); return ORDER.slice(0, k); }
  const set = ['art', 'pres'];
  for (const t of ORDER) if (!set.includes(t) && rnd() < 0.5) set.push(t);
  return set;
}
const stats = { ok: 0, null: 0, err: 0, unknown: 0, accent: 0, outside: 0, itBad: 0 };
const byFocus = {};
const fails = [];
const samples = [];
const seenCombos = new Set();
const t0 = Date.now();
let i = -1;
while (stats.ok < N && i < 3 * N) {
  i++;
  const sel = combo(i);
  seenCombos.add(sel.slice().sort().join(' '));
  const focus = sel[Math.floor(rnd() * sel.length)];
  let s;
  try { s = GN.generate(sel, focus, { strict: true }); } catch (e) { stats.err++; fails.push(`eccezione [${sel.join(' ')}] ${focus}: ${e.message}`); continue; }
  if (!s) { stats.null++; continue; }
  const T = new Set(sel);
  const lx = S.lexicalize(s.gr);
  if (lx.unknown) { stats.unknown++; fails.push(`parole sconosciute ${lx.unknown}: ${s.gr}`); continue; }
  if (!lx.ok) { stats.accent++; fails.push(`accenti: ${s.gr} ≠ ${lx.expected}`); continue; }
  // ogni parola deve avere un'analisi dentro gli argomenti scelti
  let bad = null;
  for (const tk of lx.tokens) {
    if (tk.p) continue;
    const an = E.analyze(tk.f).filter((a) => a.f === tk.a.f);
    if (!an.some((a) => a.req.every((q) => T.has(q)))) { bad = tk.f; break; }
  }
  if (bad || s.tags.some((q) => !T.has(q))) { stats.outside++; fails.push(`fuori argomento «${bad || s.tags}» [${sel.join(' ')}]: ${s.gr}`); continue; }
  if (!s.it.length || s.it.some((x) => /undefined|null|\s{2}|\s[,.]/.test(x))) { stats.itBad++; fails.push(`italiano: ${s.it.join(' | ')}`); continue; }
  stats.ok++;
  byFocus[s.focus] = (byFocus[s.focus] || 0) + 1;
  if (samples.length < 50 && stats.ok % Math.floor(N / 50) === 1) samples.push({ s, sel, focus });
}
const dt = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\nTest del generatore');
console.log(`  Richieste: ${i + 1} su ${seenCombos.size} combinazioni di argomenti — tempo ${dt} s`);
console.log(`  Frasi generate e verificate: ${stats.ok}; nessuna frase possibile: ${stats.null}`);
console.log(`  Errori: eccezioni ${stats.err}, parole sconosciute ${stats.unknown}, accenti ${stats.accent}, fuori argomento ${stats.outside}, italiano ${stats.itBad}`);
console.log('  Frasi per argomento di focus: ' + ORDER.map((t) => `${t} ${byFocus[t] || 0}`).join(', '));
if (fails.length) { console.log('\nPrimi errori:'); fails.slice(0, 25).forEach((f) => console.log('  ✗ ' + f)); process.exitCode = 1; }
const md = ['# Hermeneus — 50 frasi generate a campione', '', `Seme ${20261023}; per ogni frase: greco, traduzioni accettate, argomento esercitato e argomenti necessari.`, ''];
samples.forEach(({ s, sel, focus }, k) => {
  md.push(`${k + 1}. **${s.gr}**  `);
  md.push(`   ${s.it.join(' · ')}  `);
  md.push(`   _argomento esercitato: ${s.focus}${s.focus !== focus ? ` (richiesto: ${focus})` : ""}; argomenti necessari: ${s.tags.sort((a, b) => S.ORDER.indexOf(a) - S.ORDER.indexOf(b)).join(', ')}_`);
});
fs.writeFileSync(sampleFile, md.join('\n') + '\n');
console.log(`  Campione di ${samples.length} frasi scritto in ${sampleFile}`);
