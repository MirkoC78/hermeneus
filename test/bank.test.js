/* Test della banca di frasi e delle massime: ogni parola è riconosciuta dal motore, gli accenti
   rispettano le regole della frase, e gli argomenti dichiarati bastano a riconoscere ogni parola. */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const S = require('../src/sentence.js');
const B = require('../src/bank.js');
const TOPIC_IDS = new Set(['alf', 'art', 'd1', 'pres', 'd2', 'agg1', 'prep', 'mp', 'impf', 'contr', 'd3', 'agg2', 'pron', 'rel', 'fut', 'aor', 'part', 'inf', 'mi', 'cong', 'sub', 'perf']);
const errors = [];
const computed = [];
function checkSentence(gr, tags, label) {
  const r = S.lexicalize(gr);
  if (r.unknown) { errors.push(`${label}: parole sconosciute ${r.unknown.join(', ')} — «${gr}»`); return false; }
  if (!r.ok) { errors.push(`${label}: accenti nel contesto — scritto «${gr}», atteso «${r.expected}»`); return false; }
  if (!tags) return true;
  for (const t of tags) if (!TOPIC_IDS.has(t)) { errors.push(`${label}: argomento inesistente ${t}`); return false; }
  // argomenti calcolati dalle parole: devono essere argomenti del programma e includere quelli dichiarati
  const { tags: need, chosen } = S.sentenceReqs(r.tokens, [...tags]);
  if (chosen.some((c, k) => !r.tokens[k].p && !c)) { errors.push(`${label}: parola senza analisi — «${gr}»`); return false; }
  for (const t of need) if (!TOPIC_IDS.has(t)) { errors.push(`${label}: argomento inesistente ${t}`); return false; }
  computed.push([...need]);
  return true;
}
let ok = 0;
const perTopic = {};
B.BANK.forEach((b, i) => {
  const tags = new Set(b[2].split(/\s+/));
  if (checkSentence(b[0], tags, `frase ${i + 1}`)) ok++;
  if (computed.length) for (const t of computed[computed.length - 1]) perTopic[t] = (perTopic[t] || 0) + 1;
  if (!b[1] || !b[1].trim()) errors.push(`frase ${i + 1}: manca la traduzione`);
});
let okS = 0;
B.SENTENTIAE.forEach((s, i) => { if (checkSentence(s[0], null, `massima ${i + 1}`)) okS++; });
console.log('\nTest della banca di frasi');
console.log(`  Frasi verificate: ${ok}/${B.BANK.length}`);
console.log(`  Massime verificate: ${okS}/${B.SENTENTIAE.length}`);
console.log('  Frasi per argomento: ' + [...TOPIC_IDS].filter((t) => t !== 'alf').map((t) => `${t} ${perTopic[t] || 0}`).join(', '));
if (errors.length) { console.log('\nErrori:'); errors.forEach((e) => console.log('  ✗ ' + e)); process.exitCode = 1; }
