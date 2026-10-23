const fs = require('fs');
const f = 'src/lessons.js';
let s = fs.readFileSync(f, 'utf8');
const R = (a, b) => { if (!s.includes(a)) throw new Error('manca: ' + a.slice(0, 60)); s = s.replace(a, b); };
R("  function formsIn(e, sc) {\n    return e.forms.filter((f) => f.key !== 'lemma' && f.req.every((q) => sc.T.has(q)) && (!sc.keys || sc.keys.test(f.key)));\n  }",
`  function formsIn(e, sc, noVoc) {
    return e.forms.filter((f) => f.key !== 'lemma' && f.req.every((q) => sc.T.has(q)) && (!sc.keys || sc.keys.test(f.key)) && !(noVoc && f.c === 'voc'));
  }
  // fra più analisi della stessa forma si propone la più naturale (il nominativo prima del vocativo)
  const PREF = ['nominativo', 'accusativo', 'genitivo', 'dativo', 'vocativo'];
  const prefRank = (d) => { const i = PREF.findIndex((p) => d.includes(p)); return i < 0 ? 0 : i; };`);
R("      const f = pick(forms);\n      const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));\n      let pool",
  "      const f = pick(forms.filter((x) => x.c !== 'voc').length ? forms.filter((x) => x.c !== 'voc') : forms);\n      const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d)).sort((a, b) => prefRank(a) - prefRank(b));\n      let pool");
R("      return { type: 'analizza', e, form: f.f, correct: f.d, valid,", "      return { type: 'analizza', e, form: f.f, correct: valid.includes(f.d) && prefRank(valid[0]) < prefRank(f.d) ? valid[0] : f.d, valid,");
R("options: shuffle([f.d, ...dis]), topic: focusOfReq(f.req), key: f.key };\n    }\n    return null;\n  }\n  function buildScrivi",
  "options: shuffle([valid.includes(f.d) && prefRank(valid[0]) < prefRank(f.d) ? valid[0] : f.d, ...dis]), topic: focusOfReq(f.req), key: f.key };\n    }\n    return null;\n  }\n  function buildScrivi");
R("      const forms = formsIn(e, sc).filter((f) => f.f !== e.lemma);", "      const forms = formsIn(e, sc, true).filter((f) => f.f !== e.lemma);");
R("    const nouns = scopeEntries(sc, ['n']).concat(E.LEX.filter((e) => e.k === 'n' && sc.T.has(e.topic) && known(e, sc.T, sc.vocab) && !(e.fl && e.fl.prop)));",
  "    const own = (sc.lemmas || []).map(entryOf).filter((e) => e && e.k === 'n');\n    const nouns = own.length ? own : E.LEX.filter((e) => e.k === 'n' && sc.T.has(e.topic) && known(e, sc.T, sc.vocab) && !(e.fl && e.fl.prop));");
fs.writeFileSync(f, s);
console.log('ok');
