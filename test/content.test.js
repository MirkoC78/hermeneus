/* Test dei contenuti di teoria: ogni parola greca nei testi è riconosciuta (con l'accento giusto),
   i sintagmi rispettano gli accenti della frase, le tabelle rimandano a lemmi e forme esistenti. */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const S = require('../src/sentence.js');
const { TOPICS } = require('../src/topics.js');
const errors = [];
let words = 0, phrases = 0, tables = 0, examples = 0;
const find = (l) => E.LEX.find((e) => e.lemma === E.G.nfc(l));
for (const t of TOPICS) {
  const html = JSON.stringify(t.body);
  for (const m of html.matchAll(/<span class=\\"gr\\">(.*?)<\/span>/g)) {
    const txt = m[1];
    const ws = S.splitWords(txt).filter((w) => !S.PUNCT.test(w));
    if (ws.length === 1) {
      words++;
      if (!E.analyze(ws[0]).length) errors.push(`${t.id}: parola sconosciuta «${txt}»`);
    } else {
      phrases++;
      const r = S.lexicalize(txt);
      if (!r.ok) errors.push(`${t.id}: «${txt}» ${r.unknown ? 'sconosciute: ' + r.unknown : 'atteso «' + r.expected + '»'}`);
    }
  }
  for (const b of t.body) {
    const refs = b.decl ? b.decl.map((l) => [l]) : b.conj || b.forms || (b.adj ? [[b.adj]] : b.pron ? [[b.pron]] : []);
    for (const [l, key] of refs) {
      tables++;
      const e = find(l) || E.LEX.find((x) => x.k === 'p' && x.lemma === E.G.nfc(l));
      if (!e) { errors.push(`${t.id}: tabella con lemma inesistente ${l}`); continue; }
      if (key && !e.forms.some((f) => f.key.startsWith(key))) errors.push(`${t.id}: ${l} non ha forme ${key}`);
    }
  }
  for (const [gr] of t.ex || []) { examples++; const r = S.lexicalize(gr); if (!r.ok) errors.push(`${t.id}: esempio «${gr}» non verificato ${r.expected || r.unknown}`); }
}
console.log('\nTest dei contenuti di teoria');
console.log(`  Argomenti: ${TOPICS.length}; parole controllate: ${words}; sintagmi: ${phrases}; tabelle: ${tables}; esempi: ${examples}`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
