/* Test delle analisi nel contesto (HERM-002): ogni frase della banca viene letta con le regole di contesto e
   controllata per reggenza, concordanza e accordo. I casi che le regole non sanno decidere vengono elencati
   per il controllo linguistico, senza far fallire il test. */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
const B = require('../src/bank.js');
const G = E.G;

const errors = [], review = [];
const key = (gr, form) => { const r = SN.lexicalize(gr); const t = r.tokens.find((x) => !x.p && G.strict(x.f) === G.strict(form)); return t && t.a.key; };
const eq = (what, got, want) => { if (got !== want) errors.push(`${what}: ${got} ≠ ${want}`); };
// casi del rapporto
eq('b17 θύρας', key(B.BANK[17][0], 'θύρας'), 'n.acc.p');
eq('b17 φυλάττετε', key(B.BANK[17][0], 'φυλάττετε'), 'pres.imp.act.2p');
eq('b96 βοῦς', key(B.BANK[96][0], 'βοῦς'), 'n.acc.p');
// verbi con 1ª singolare = 3ª plurale (ἐφύλαττον, διέφθειρον…) accanto a un soggetto plurale
let syncretic = 0;
B.BANK.forEach((b, i) => {
  const r = SN.lexicalize(b[0]);
  r.tokens.forEach((t) => {
    if (t.p || !t.a || t.a.e.k !== 'v' || !t.a.p) return;
    const alts = E.analyze(t.a.f).filter((a) => a.e === t.a.e && a.f === t.a.f).map((a) => a.p);
    if (alts.includes('1s') && alts.includes('3p')) { syncretic++; const subj = r.tokens.find((x) => !x.p && x.a && ['n', 'p'].includes(x.a.e.k) && x.a.c === 'nom'); if (subj && subj.a.n === 'p' && subj.a.g !== 'n') eq(`b${i} ${t.f} con soggetto plurale`, t.a.p, '3p'); }
  });
});

// controllo su tutta la banca
const govOf = (e) => { const g = new Set(); for (const x of String(e.m || '').match(/\+[^)]*/g) || []) for (const c of ['gen', 'dat', 'acc']) if (x.includes(c)) g.add(c); return g; };
let checked = 0;
B.BANK.forEach((b, i) => {
  const r = SN.lexicalize(b[0]);
  if (!r.ok) { errors.push(`b${i}: frase non verificata`); return; }
  checked++;
  const T = r.tokens;
  T.forEach((t, j) => {
    if (t.p || !t.a) return;
    // reggenza: la prima parola declinata dopo la preposizione è nel caso retto
    if (t.a.e.k === 'i' && t.a.cat === 'prep' && !t.post) {
      const n = T[j + 1];
      if (n && !n.p && n.a && n.a.c && govOf(t.a.e).size && !govOf(t.a.e).has(n.a.c)) errors.push(`b${i} «${b[0]}»: ${t.f} + ${n.f} (${n.a.d})`);
    }
    // articolo: deve concordare con la parola declinata che lo segue, salvo genitivi o articoli interposti
    if (t.a.e.k === 'art') {
      // nel gruppo (fino al verbo di modo finito) ci dev'essere una parola che concorda: oggetti e genitivi interposti sono ammessi
      const group = [];
      for (let k = j + 1; k < T.length && !T[k].p && !(T[k].a && T[k].a.e.k === 'v' && T[k].a.p); k++) if (T[k].a && T[k].a.c && T[k].a.e.k !== 'art') group.push(T[k]);
      const n = group[0];
      const same = group.some((x) => x.a.c === t.a.c && x.a.n === t.a.n);
      if (n && !same) review.push(`b${i} «${b[0]}»: ${t.f} (${t.a.d}) … ${n.f} (${n.a.d})`);
    }
  });
  if (r.ambiguous && r.ambiguous.length) review.push(`b${i} «${b[0]}»: da decidere ${r.ambiguous.map((k) => T[k].f).join(', ')}`);
});

console.log('\nTest delle analisi nel contesto');
console.log(`  Frasi lette nel contesto: ${checked}; verbi con 1ª sing. = 3ª plur.: ${syncretic}`);
console.log(`  Da controllare a mano (non sono errori automatici): ${review.length}`);
review.slice(0, 60).forEach((x) => console.log('  · ' + x));
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.slice(0, 30).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
