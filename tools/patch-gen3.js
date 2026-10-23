// Generatore: vocabolario ammesso (ctx.lex), tempi ammessi (ctx.tenses), sintagmi senza verbo (bPhrase).
const fs = require('fs');
const f = 'src/generator.js';
let g = fs.readFileSync(f, 'utf8');
const R = (a, b, all) => { if (!g.includes(a)) throw new Error('manca: ' + a.slice(0, 70)); g = all ? g.split(a).join(b) : g.replace(a, b); };

R("  function nounsFor(ctx, spec) { return NOUNS.filter((n) => ctx.T.has(n.e.topic) && matches(n, spec)); }",
`  // disponibilità: argomento scelto e, se la lezione lo limita, vocabolario già incontrato
  const inLex = (ctx, e) => !ctx.lex || ctx.lex.has(e.lemma);
  const nOK = (ctx, n) => ctx.T.has(n.e.topic) && inLex(ctx, n.e);
  const aOK = (ctx, a) => ctx.T.has(a.e.topic) && inLex(ctx, a.e);
  const vOK = (ctx, v) => ctx.T.has(v.e.topic) && inLex(ctx, v.e);
  function nounsFor(ctx, spec) { return NOUNS.filter((n) => nOK(ctx, n) && matches(n, spec)); }`);
R("ADJS.filter((a) => ctx.T.has(a.e.topic) &&", "ADJS.filter((a) => aOK(ctx, a) &&", true);
R("NOUNS.filter((n) => ctx.T.has(n.e.topic) &&", "NOUNS.filter((n) => nOK(ctx, n) &&", true);
R("ctx.T.has(v.e.topic === 'mi' ? 'mi' : v.e.topic)", "vOK(ctx, v)", true);
R("ctx.T.has(v.e.topic)", "vOK(ctx, v)", true);
// tempi ammessi dalla lezione
R("    for (const t of ['pres', 'impf', 'fut', 'aor', 'pf']) {\n      const voice = passive",
  "    for (const t of ['pres', 'impf', 'fut', 'aor', 'pf']) {\n      if (ctx.tenses && !ctx.tenses.includes(t)) continue;\n      const voice = passive");
// πέμπω nella finale solo se il vocabolario lo ammette
R("    if (!PEMPO || !sNP || !oNP) return null;", "    if (!PEMPO || !vOK(ctx, PEMPO) || !sNP || !oNP) return null;");
// sintagmi nominali
R("  const pick2 = (i, a, b) => (i ? b : a);", `  const pick2 = (i, a, b) => (i ? b : a);
  // sintagma senza verbo: «ἡ τοῦ ναύτου τόλμα» (genitivo in posizione attributiva) o «ὁ ἀγαθὸς ποιητής»
  function bPhrase(ctx) {
    const n1 = mkNP(ctx, 'H P T X A', { demo: false, adjP: 0.45 });
    if (!n1 || n1.n.o.noart) return null;
    const withGen = !n1.adj || chance(0.5);
    const n2 = withGen ? mkNP(ctx, 'H', { avoid: [n1.n], adj: false, demo: false }) : null;
    if (withGen && (!n2 || n2.n.o.noart)) return null;
    const t1 = grNP(n1, 'nom');
    const t2 = n2 ? grNP(n2, 'gen') : [];
    if (!t1 || !t2) return null;
    const toks = [t1[0], ...t2, ...t1.slice(1)];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      let s = itStr(itNP(n1, sl('a', n1.n.it.length)));
      if (n2) s += ' ' + itStr(itNP(n2, sl('b', n2.n.it.length)), 'di');
      return s;
    };
    return finish(ctx, toks, itFn, [], n2 ? 'Il genitivo fra articolo e nome è in posizione attributiva: «di…».' : 'Aggettivo fra articolo e nome: posizione attributiva.');
  }`);
// costruttori per argomento: i sintagmi nelle prime unità
R("art: [[bBasic, 1]], d1: [[bBasic, 2], [bCopula, 1]],", "art: [[bBasic, 1], [bPhrase, 1]], d1: [[bBasic, 2], [bCopula, 1], [bPhrase, 1]],");
R("d2: [[bBasic, 2], [bCopula, 1]],", "d2: [[bBasic, 2], [bCopula, 1], [bPhrase, 1]],");
R("agg1: [[bCopula, 2], [bBasic, 1]],", "agg1: [[bCopula, 2], [bBasic, 1], [bPhrase, 1]],");
R("d3: [[bBasic, 2], [bCopula, 1]],", "d3: [[bBasic, 2], [bCopula, 1], [bPhrase, 1]],");
// generate: opzioni della lezione; senza il presente solo sintagmi
R("    if (!T.has('pres') || !T.has('art')) return null;\n    const topics = [...T].filter((t) => BY_FOCUS[t]);",
  "    if (!T.has('art')) return null;\n    const noVerb = !T.has('pres');\n    const topics = [...T].filter((t) => BY_FOCUS[t]);");
R("      const ctx = { T, focus: f, focusT: FOCUS_T[f] || null };",
  "      const ctx = { T, focus: f, focusT: FOCUS_T[f] || null, lex: o.lex || null, tenses: o.tenses || null };");
R("        if (SPECIAL[f] && chance(0.7)) s = SPECIAL[f](ctx);",
  "        if (noVerb || (o.phrase && chance(0.5))) s = bPhrase(ctx);\n        else if (o.simple && chance(0.5)) s = (chance(0.5) ? bBasic : bCopula)(ctx);\n        else if (SPECIAL[f] && chance(0.7)) s = SPECIAL[f](ctx);");
R("      if (attempt < 50 && focus && T.has(focus) && !s.tags.includes(focus)) continue;",
  "      if (attempt < 50 && focus && T.has(focus) && !s.tags.includes(focus) && !noVerb) continue;");
R("_internal: { bRel, bBasic,", "_internal: { bPhrase, bRel, bBasic,");
fs.writeFileSync(f, g);
console.log('ok');
