require('../src/greek.js'); const E = require('../src/morph.js'); E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js'); require('../src/italian.js'); require('../src/semantic.js'); require('../src/generator.js'); require('../src/course.js');
const B = require('../src/bank.js'); const L = require('../src/lessons.js');
const BANK = B.BANK.map((b, i) => { const lx = SN.lexicalize(b[0]); return { id: 'b' + i, gr: b[0], it: b[1].split('|'), tags: [...SN.sentenceReqs(lx.tokens, b[2].split(' ')).tags], focus: b[2].split(' ').pop(), tokens: lx.tokens }; });
L.init({ bank: BANK });
for (const id of process.argv.slice(2)) {
  console.log('== ' + id);
  for (const it of L.buildLesson(id, { teach: false })) {
    const d = it.s ? it.s.gr + ' → ' + it.s.it[0] + (it.newWords && it.newWords.length ? '  [nuova: ' + it.newWords + ']' : '')
      : it.type === 'analizza' ? it.form + ' = ' + it.correct + ' | ' + it.options.filter((o) => o !== it.correct).join(' / ')
      : it.type === 'scrivi' ? it.e.lemma + ': ' + it.desc + ' → ' + it.answers
      : it.type === 'accorda' ? (it.art ? it.art + ' ___ ' : '___ ') + it.noun.f + ' → ' + it.answer + ' | ' + it.options
      : it.type === 'abbina' ? it.pairs.map((p) => p.gr + '=' + p.it).join(', ')
      : it.type === 'lettera' ? it.prompt + ' → ' + it.right : it.type === 'accento' ? it.word + ' → ' + it.right : JSON.stringify(Object.keys(it));
    console.log('  ' + it.type.padEnd(9) + d);
  }
}
