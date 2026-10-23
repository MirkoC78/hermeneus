/* Test del percorso: per ogni lezione
   - i lemmi dichiarati esistono nel lessico e le forme ammesse (keys) esistono;
   - le schede di spiegazione hanno greco corretto (parole riconosciute, esempi verificati, tabelle esistenti);
   - la lezione produce almeno 6 esercizi ben formati, ripetendo la costruzione più volte;
   - ogni frase proposta rientra negli argomenti sbloccati e ha al massimo una parola nuova (zero nelle prove). */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
require('../src/italian.js'); require('../src/semantic.js');
const GN = require('../src/generator.js');
const C = require('../src/course.js');
const B = require('../src/bank.js');
const L = require('../src/lessons.js');
const G = E.G;

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ORDER = SN.ORDER;
const BANK = B.BANK.map((b, i) => {
  const lx = SN.lexicalize(b[0]);
  const declared = b[2].split(/\s+/);
  return { id: 'b' + i, gr: b[0], it: b[1].split('|'), tags: [...SN.sentenceReqs(lx.tokens, declared).tags], focus: declared.sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tokens: lx.tokens, src: 'bank' };
});
L.init({ bank: BANK, rand: mulberry32(7) });

const errors = [];
let lessons = 0, items = 0, sentences = 0, cards = 0, newWordItems = 0;
const types = {};
for (const f of L.FLAT) {
  const l = f.lesson;
  lessons++;
  for (const lem of l.lemmas || []) if (!L.entryOf(lem)) errors.push(`${l.id}: lemma inesistente ${lem}`);
  if (l.keys) {
    const re = new RegExp(l.keys);
    const sc = L.scopeOf(l.id);
    const any = E.LEX.some((e) => e.forms.some((x) => re.test(x.key) && x.req.every((q) => sc.T.has(q))));
    if (!any) errors.push(`${l.id}: nessuna forma per ${l.keys}`);
  }
  for (const card of l.teach || []) {
    cards++;
    const html = card.p || '';
    for (const m of html.matchAll(/<span class="gr">(.*?)<\/span>/g)) {
      const ws = SN.splitWords(m[1]).filter((w) => !SN.PUNCT.test(w));
      if (ws.length === 1) { if (!E.analyze(ws[0]).length) errors.push(`${l.id}: parola sconosciuta «${m[1]}»`); }
      else { const r = SN.lexicalize(m[1]); if (!r.ok) errors.push(`${l.id}: «${m[1]}» ${r.unknown ? 'sconosciute ' + r.unknown : 'atteso ' + r.expected}`); }
    }
    if (card.ex) { const r = SN.lexicalize(card.ex[0]); if (!r.ok) errors.push(`${l.id}: esempio «${card.ex[0]}» ${r.unknown ? 'sconosciute ' + r.unknown : 'atteso ' + r.expected}`); }
    for (const lem of card.decl || []) if (!L.entryOf(lem)) errors.push(`${l.id}: tabella con lemma inesistente ${lem}`);
    for (const [lem, key] of card.conj || []) { const e = L.entryOf(lem); if (!e || !e.forms.some((x) => x.key.startsWith(key))) errors.push(`${l.id}: tabella ${lem} ${key} vuota`); }
    if (card.adj && !L.entryOf(card.adj)) errors.push(`${l.id}: aggettivo inesistente ${card.adj}`);
  }
  const sc = L.scopeOf(l.id);
  for (let rep = 0; rep < 4; rep++) {
    let its;
    try { its = L.buildLesson(l.id, { teach: rep === 0 }); } catch (e) { errors.push(`${l.id}: eccezione ${e.message}`); continue; }
    const practice = its.filter((x) => x.type !== 'teach');
    if (practice.length < 6) errors.push(`${l.id}: solo ${practice.length} esercizi`);
    for (const it of its) {
      items++;
      types[it.type] = (types[it.type] || 0) + 1;
      if (it.options && (new Set(it.options.map(String)).size !== it.options.length)) errors.push(`${l.id}: opzioni ripetute in ${it.type}`);
      if (it.type === 'analizza' && !it.valid.includes(it.correct)) errors.push(`${l.id}: analisi incoerente`);
      if (it.s) {
        sentences++;
        const toks = it.s.tokens;
        if (!it.s.tags.every((t) => sc.T.has(t))) errors.push(`${l.id}: frase fuori argomento «${it.s.gr}» [${it.s.tags}]`);
        const unknown = new Set(toks.filter((t) => t && t.a && !L.known(t.a.e, sc.T, sc.vocab)).map((t) => t.a.e.lemma));
        if (unknown.size > sc.maxNew) errors.push(`${l.id}: troppe parole nuove (${[...unknown]}) in «${it.s.gr}»`);
        if (unknown.size) newWordItems++;
        const lx = SN.lexicalize(it.s.gr);
        if (!lx.ok) errors.push(`${l.id}: frase non verificata «${it.s.gr}»`);
      }
    }
  }
}
console.log('\nTest del percorso');
console.log(`  Unità: ${C.UNITS.length}; lezioni: ${lessons}; schede di spiegazione: ${cards}`);
console.log(`  Esercizi costruiti: ${items} (frasi: ${sentences}, di cui con una parola nuova: ${newWordItems})`);
console.log('  Tipi: ' + Object.entries(types).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
[...new Set(errors)].slice(0, 40).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
