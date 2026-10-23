// Sostituisce nel generatore i costruttori di finali, temporali e μέν… δέ (patch una tantum).
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
const between = (a, b, rep) => {
  const i = s.indexOf(a), j = s.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('marcatore mancante: ' + (i < 0 ? a : b));
  s = s.slice(0, i) + rep + s.slice(j);
};
between('  // proposizione finale con ἵνα', '  const pick2 = ', `  // proposizione finale: «il comandante manda i soldati affinché custodiscano la città»
  function bFinal(ctx) {
    const PEMPO = VERBS.find((v) => v.la === 'πέμπω');
    const sNP = mkNP(ctx, 'rul fam civ', { adj: false });
    const oNP = mkNP(ctx, 'msg mil srv', { avoid: sNP ? [sNP.n] : [], adj: false });
    if (!PEMPO || !sNP || !oNP) return null;
    const V = pick(VERBS.filter((v) => v.o && !v.inf && !v.say && v !== PEMPO && !v.oc && ctx.T.has(v.e.topic) && matches(oNP.n, v.s)));
    if (!V) return null;
    const gp = grSubjPers(sNP);
    const tt = chooseTense(ctx, PEMPO, false, gp);
    if (!tt || tt.t === 'pf') return null;
    const hist = tt.t === 'impf' || tt.t === 'aor';
    const fp = oNP.num === 'p' ? '3p' : '3s';
    const mood = hist && chance(0.5) ? 'opt' : 'subj';
    const voice = activeVoice(V, 'pres', mood, fp);
    const vf = voice && formKey(V.e, \`pres.\${mood}.\${voice}.\${fp}\`);
    const xNP = mkNP(ctx, V.o, { avoid: [sNP.n, oNP.n] });
    if (!vf || !xNP) return null;
    const sT = grNP(sNP, 'nom'), oT = grNP(oNP, 'acc'), xT = grNP(xNP, 'acc');
    if (!sT || !oT || !xT) return null;
    const conj = pick(['ἵνα', 'ὅπως']);
    const toks = [...sT, ...oT, S.tok(tt.f), S.tok(INV(conj).forms[0]), ...xT, S.tok(vf)];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      const sI = itNP(sNP, sl('s', sNP.n.it.length)), oI = itNP(oNP, sl('o', oNP.n.it.length));
      const itT = TENSE[tt.t].it[sl('t', TENSE[tt.t].it.length) % TENSE[tt.t].it.length];
      return itStr(sI) + ' ' + itVerb(PEMPO, 0, itT, { p: subjP(sNP) }) + ' ' + itStr(oI) + ' ' + (sl('f', 2) ? 'perché' : 'affinché') + ' ' +
        itVerb(V, sl('v', V.it.length), hist ? 'cimpf' : 'cpres', { p: oNP.num === 'p' ? 5 : 2 }) + ' ' + itStr(itNP(xNP, sl('x', xNP.n.it.length)));
    };
    return finish(ctx, toks, itFn, ['cong'], mood === 'opt' ? 'Dopo un tempo storico la finale può avere l\\u2019ottativo (obliquo).' : conj + ' + congiuntivo: proposizione finale.');
  }
  const lowFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const noPunct = (s) => s.replace(/[.?]$/, '');
  // temporale: «dopo che i soldati andarono nella città, custodirono la casa»
  function bTemp(ctx) {
    const t = ctx.T.has('aor') ? 'aor' : 'impf';
    const a = bBasic(ctx, { np: true, tense: t, vf: (v) => !!v.pp && !v.o, neg: false });
    if (!a) return null;
    const sNP = a.meta.sNP;
    const b = bBasic(ctx, { person: PERS.indexOf(grSubjPers(sNP)), noAlt: true, tense: t, vf: (v) => !!v.o && matches(sNP.n, v.s), neg: false });
    if (!b) return null;
    const conj = pick(['ὅτε', 'ἐπεί']);
    const toks = [S.tok(INV(conj).forms[0]), ...a.tokens.slice(0, -1), { p: ',' }, ...b.tokens.slice(0, -1)];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      const c = conj === 'ὅτε' ? 'quando' : sl('c', 2) ? 'quando' : 'dopo che';
      return c + ' ' + lowFirst(noPunct(a.meta.itFn(ch, reg))) + ', ' + noPunct(b.meta.itFn(ch, reg));
    };
    return finish(ctx, toks, itFn, ['sub'], conj + ' + indicativo: proposizione temporale (fatto reale).');
  }
`);
between('  // μέν… δέ: due proposizioni contrapposte', '  function tipFor(', `  // μέν… δέ: due proposizioni contrapposte, con soggetti diversi e lo stesso tempo
  function bMenDe(ctx) {
    const ts = ['pres', 'impf', 'aor', 'fut'].filter((x) => ctx.T.has(x));
    const t = pick(ts);
    const a = bBasic(ctx, { np: true, sFirst: true, tense: t, neg: false });
    const b = bBasic(ctx, { np: true, sFirst: true, tense: t, neg: chance(0.3) });
    if (!a || !b || a.meta.sNP.n === b.meta.sNP.n) return null;
    const ins = (toks, w) => { const x = toks.slice(0, -1); x.splice(1, 0, S.tok(INV(w).forms[0])); return x; };
    const toks = [...ins(a.tokens, 'μέν'), { p: ',' }, ...ins(b.tokens, 'δέ')];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      const x = noPunct(a.meta.itFn(ch, reg));
      const yy = lowFirst(noPunct(b.meta.itFn(ch, reg)));
      // «invece» dopo un soggetto con articolo: «i soldati invece rimangono»
      const inv = /^(il|lo|la|i|gli|le) \\S+ /.test(yy) ? yy.replace(/^(\\S+ \\S+)/, '$1 invece') : null;
      return inv && sl('c', 2) ? x + ', ' + inv : x + ', mentre ' + yy;
    };
    return finish(ctx, toks, itFn, [], 'μέν… δέ contrappone due membri; δέ si traduce «invece», «mentre».');
  }

`);
fs.writeFileSync(f, s);
console.log('ok');
