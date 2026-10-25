/* Test del controllo delle risposte (HERM-001 e HERM-005 del rapporto di revisione). */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
const B = require('../src/bank.js');
const C = require('../src/check.js');
const G = E.G;

const errors = [];
let n = 0;
const eq = (what, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) errors.push(`${what}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); };
const bank = (i) => ({ gr: B.BANK[i][0], it: B.BANK[i][1].split('|'), tokens: SN.lexicalize(B.BANK[i][0]).tokens });

/* ---------- italiano (HERM-001) ---------- */
const b99 = bank(99);
eq('b99 è la frase del rapporto', b99.gr, 'Ὁ ἀνὴρ τὴν γυναῖκα φιλεῖ.');
const st = (ans, refs = b99.it) => C.matchItalian(refs, ans).status;
eq('soggetto e oggetto invertiti', st('La donna ama l’uomo.'), 'review');
eq('riferimento', st("L'uomo ama la donna."), 'exact');
eq('variante prevista', st('Il marito ama la moglie'), 'exact');
eq('maiuscole, apostrofi e punteggiatura', st('l uomo AMA la donna!!'), 'exact');
eq('negazione aggiunta', st("L'uomo non ama la donna."), 'review');
eq('cambio di numero', st('Gli uomini amano la donna.'), 'review');
eq('cambio di tempo', st("L'uomo amava la donna."), 'review');
eq('cambio di persona', st('Amo la donna.'), 'review');
eq('ordine delle parole cambiato', st("Ama la donna l'uomo."), 'review');
eq('accenti italiani dimenticati', st('Il fanciullo e buono.', ['Il fanciullo è buono.']), 'accents');
eq('negazione tolta', st('Il fanciullo è buono.', ['Il fanciullo non è buono.']), 'review');
eq('tessere: frase composta uguale', C.tilesItalian(b99.it, 'l uomo ama la donna'), true);
eq('tessere: ruoli invertiti', C.tilesItalian(b99.it, 'la donna ama l uomo'), false);

/* ---------- greco: iota sottoscritto (HERM-005 A) ---------- */
for (const lenient of [true, false]) {
  const m = lenient ? 'graduale' : 'rigorosa';
  for (const [right, wrong] of [['τῇ', 'τῆ'], ['τῷ', 'τῶ'], ['ἀγορᾷ', 'ἀγορᾶ'], ['χώρᾳ', 'χώρα']]) {
    const r = C.checkForm([right], wrong, { lenient });
    eq(`${m}: ${wrong} senza iota`, [r.ok, r.issues[0] && r.issues[0].kind], [false, 'iota']);
    eq(`${m}: ${right} giusto`, C.checkForm([right], right, { lenient }).exact, true);
    eq(`${m}: ${right} in NFD`, C.checkForm([right], right.normalize('NFD'), { lenient }).exact, true);
  }
  const acc = C.checkForm(['τῇ'], 'τῃ', { lenient });
  eq(`${m}: solo accento sbagliato`, [acc.ok, acc.exact, acc.issues[0].kind], [lenient, false, 'accent']);
}
// iota in una frase intera
const withDat = B.BANK.map((b, i) => i).find((i) => /τῇ /.test(B.BANK[i][0]));
const bd = bank(withDat);
const missingIota = bd.gr.replace('τῇ ', 'τῆ ');
for (const lenient of [true, false]) {
  const r = C.checkGreek(bd.tokens, missingIota, { lenient });
  eq(`frase senza iota (${lenient ? 'graduale' : 'rigorosa'})`, [r.ok, r.issues.some((x) => x.kind === 'iota')], [false, true]);
  eq(`frase esatta (${lenient ? 'graduale' : 'rigorosa'})`, C.checkGreek(bd.tokens, bd.gr, { lenient }).exact, true);
}

/* ---------- greco: forma della negazione (HERM-005 B) ---------- */
const b37 = bank(37);
eq('b37 è la frase del rapporto', b37.gr, 'Ὁ δοῦλος οὐκ ἐλεύθερός ἐστιν.');
const wrongNeg = 'Ὁ δοῦλος οὐ ἐλεύθερός ἐστιν.';
const s1 = C.checkGreek(b37.tokens, wrongNeg, { lenient: false });
eq('rigorosa: οὐ davanti a vocale', [s1.ok, s1.exact, s1.issues[0] && s1.issues[0].kind], [false, false, 'form']);
const s2 = C.checkGreek(b37.tokens, wrongNeg, { lenient: true });
eq('graduale: tollerata ma non esatta', [s2.ok, s2.exact], [true, false]);
eq('rigorosa: οὐκ giusto', C.checkGreek(b37.tokens, b37.gr, { lenient: false }).exact, true);
eq('negazione staccata dalla parola che nega', C.checkGreek(b37.tokens, 'Ὁ δοῦλος ἐλεύθερος οὐκ ἐστιν.', { lenient: true }).ok, false); // οὐκ deve precedere la parola che nega
// forme contestuali prodotte dalla resa della frase
const ou = SN.tok(E.analyze('οὐ').find((a) => a.e.lemma === 'οὐ'));
const art = (f) => SN.tok(E.analyze(f).find((a) => a.e.k === 'art'));
const word = (f) => { const a = E.analyze(f)[0]; return a ? SN.tok(a) : null; };
eq('οὐ davanti a spirito aspro', SN.render([ou, art('ὁ'), word('δοῦλος'), { p: '.' }], { words: true })[0], 'οὐχ');
eq('οὐ davanti a spirito dolce', SN.render([ou, word('ἀνήρ'), { p: '.' }], { words: true })[0], 'οὐκ');
eq('οὐ davanti a consonante', SN.render([ou, word('δοῦλος'), { p: '.' }], { words: true })[0], 'οὐ');
eq('οὐ in fine di frase', SN.render([word('δοῦλος'), ou, { p: '.' }], { words: true })[1], 'οὔ');
eq('ρ iniziale è consonante', G.startsWithVowel('ῥήτωρ'), false);

console.log('\nTest del controllo delle risposte');
console.log(`  Verifiche: ${n}`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.slice(0, 30).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
