/* HERMENEUS — generatore offline di frasi greche con traduzione italiana.
   Le forme greche vengono dal motore (lemma + chiave), gli accenti della frase da HermSentence.render,
   l'italiano da HermIt. Gli argomenti richiesti sono l'unione dei req delle forme usate più quelli
   sintattici: la frase è accettata solo se rientra negli argomenti scelti. */
(function (root) {
  'use strict';
  const E = root.HermEngine || require('./morph.js');
  const S = root.HermSentence || require('./sentence.js');
  const IT = root.HermIt || require('./italian.js');
  const D = root.HERM_SEM || require('./semantic.js');
  const G = E.G;

  let rand = Math.random;
  const rnd = (n) => Math.floor(rand() * n);
  const pick = (a) => a[rnd(a.length)];
  const chance = (p) => rand() < p;
  const PERS = ['1s', '2s', '3s', '1p', '2p', '3p'];

  /* ---------- Lessico semantico ---------- */
  let NOUNS = null, ADJS = null, VERBS = null, ART = null, INV = null;
  function lex(k, lemma) { const n = G.nfc(lemma); return E.LEX.find((e) => e.k === k && e.lemma === n); }
  function init() {
    if (NOUNS) return;
    ART = E.LEX.find((e) => e.k === 'art');
    INV = (w) => E.LEX.find((e) => e.k === 'i' && e.forms.some((f) => f.f === G.nfc(w)));
    NOUNS = [];
    for (const line of D.NOUNS.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const [gr, cls, it, opt] = t.split('|');
      const e = lex('n', gr);
      if (!e) throw new Error('generatore: nome sconosciuto ' + gr);
      const its = it.split(',').map((v) => {
        const [forms, g, gpl] = v.split(':');
        const [sg, pl] = forms.split('/');
        return { sg, pl: pl === '-' ? null : pl, g, gpl: gpl || g };
      });
      const o = {};
      (opt || '').split(',').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); o[k] = v || true; });
      NOUNS.push({ e, cls: new Set(cls.split(' ')), it: its, o, g: e.g.split('/')[0], sg: !its[0].pl || !!e.fl.sg });
    }
    ADJS = [];
    for (const line of D.ADJS.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const [gr, it, cls, pre] = t.split('|');
      const e = lex('a', gr);
      if (!e) throw new Error('generatore: aggettivo sconosciuto ' + gr);
      ADJS.push({ e, it: IT.adjForms(it.replace(/;/g, '|')), base: it.split(';')[0], cls: cls.split(' '), pre: pre === '+' });
    }
    VERBS = D.VERBS.map((v) => {
      const e = lex('v', v.la);
      if (!e) throw new Error('generatore: verbo sconosciuto ' + v.la);
      return Object.assign({}, v, { e });
    });
  }
  // classi: «=lemma» un nome preciso, «!classe» esclusa
const matches = (n, spec) => {
    const t = spec.split(' ');
    if (t.some((c) => c[0] === '!' && n.cls.has(c.slice(1)))) return false;
    return t.some((c) => c[0] !== '!' && (c[0] === '=' ? n.e.lemma === G.nfc(c.slice(1)) : n.cls.has(c)));
  };
  // disponibilità: argomento scelto e, se la lezione lo limita, vocabolario già incontrato
  const inLex = (ctx, e) => !ctx.lex || ctx.lex.has(e.lemma);
  const nOK = (ctx, n) => ctx.T.has(n.e.topic) && inLex(ctx, n.e);
  const aOK = (ctx, a) => ctx.T.has(a.e.topic) && inLex(ctx, a.e);
  const vOK = (ctx, v) => ctx.T.has(v.e.topic) && inLex(ctx, v.e);
  function nounsFor(ctx, spec) { return NOUNS.filter((n) => nOK(ctx, n) && matches(n, spec)); }
  const formKey = (e, key, g) => e.forms.find((f) => f.key === key && (!g || !f.g || f.g === g)) || null;

  /* ---------- Gruppi nominali ---------- */
  // np: { n, num, adj, itv (indice della variante italiana) }
  function mkNP(ctx, spec, o = {}) {
    const cands = nounsFor(ctx, spec).filter((n) => !(o.avoid || []).includes(n) && (!o.place || n.cls.has('P')));
    if (!cands.length) return null;
    const n = pick(cands);
    let num = o.num || (n.sg ? 's' : chance(0.45) ? 'p' : 's');
    if (n.sg) num = 's';
    const np = { n, num, adj: null };
    if (o.adj !== false && ctx.T.has('agg1') && chance(o.adjP ?? 0.3)) {
      const ok = ADJS.filter((a) => aOK(ctx, a) && a.cls.some((c) => n.cls.has(c) || n.e.lemma === c));
      if (ok.length) np.adj = pick(ok);
    }
    // dimostrativo in posizione predicativa: οὗτος ὁ ἀνήρ
    if (ctx.T.has('pron') && !n.o.noart && o.demo !== false && chance(o.demoP ?? (ctx.focus === 'pron' ? 0.6 : 0.12))) np.demo = pick(['houtos', 'ekeinos']);
    return np;
  }
  const DEMO = {};
  function grNP(np, c) {
    const { n, num } = np;
    const nf = formKey(n.e, `n.${c}.${num}`, n.g);
    if (!nf) return null;
    const toks = [];
    if (np.demo) {
      const pe = DEMO[np.demo] || (DEMO[np.demo] = E.LEX.find((e) => e.k === 'p' && e.pid === np.demo));
      const df = pe && formKey(pe, `p.${n.g}.${c}.${num}`);
      if (!df) return null;
      toks.push(S.tok(df));
    }
    if (!n.o.noart) {
      const af = formKey(ART, `art.${n.g}.${c}.${num}`);
      if (!af) return null;
      toks.push(S.tok(af));
    }
    if (np.adj) {
      const adf = formKey(np.adj.e, `a.pos.${n.g}.${c}.${num}`, n.g);
      if (!adf) return null;
      toks.push(S.tok(adf));
    }
    toks.push(S.tok(nf));
    return toks;
  }
  const itNoun = (np, k) => { const v = np.n.it[k % np.n.it.length]; return v; };
  // gruppo nominale italiano: { art, body, g, n }
  function itNP(np, k) {
    const v = itNoun(np, k);
    const num = np.num;
    const word = num === 'p' ? v.pl : v.sg;
    const g = num === 'p' ? v.gpl : v.g;
    let body = word;
    if (np.adj) {
      const af = IT.adjAgree(np.adj.it, g, num);
      if (np.adj.pre) {
        const pf = IT.preForm(np.adj.base, g, num, word);
        body = (pf || af) + (pf && /'$/.test(pf) ? '' : ' ') + word;
      } else body = word + ' ' + af;
    }
    if (np.n.o.noart) return { art: null, body, g, n: num };
    if (np.demo) {
      const d = np.demo === 'houtos' ? 'questo' : 'quello';
      const first = body.split(' ')[0];
      const df = IT.preForm(d, g, num, first);
      return { art: null, body: df + (/'$/.test(df) ? '' : ' ') + body, g, n: num };
    }
    let art = IT.defArt(g, num, body);
    if (num === 'p' && np.n.o.artpl && !np.adj) art = np.n.o.artpl;
    return { art, body, g, n: num };
  }
  const itStr = (x, prep) => IT.withPrep(prep || null, x);

  /* ---------- Verbi ---------- */
  // tempi possibili: chiave greca, tempi italiani, argomenti
  const TENSE = {
    pres: { it: ['pres'] }, impf: { it: ['impf'] }, fut: { it: ['fut'] }, aor: { it: ['pr', 'pp'] }, pf: { it: ['pp'] },
  };
  // diatesi con cui il verbo ha significato attivo in quel tempo
  function activeVoice(V, t, m = 'ind', p = '3s') {
    const has = (v) => V.e.forms.some((f) => f.key === `${t}.${m}.${v}.${p}`);
    const dep = !!V.e.v.dep;
    if (has('act')) return 'act';
    if (t === 'pres' || t === 'impf' || t === 'pf') return dep && has('mp') ? 'mp' : null;
    if (has('mid')) return 'mid';
    if (t === 'aor' && dep && has('pass')) return 'pass';
    return null;
  }
  function vform(V, t, m, voice, p) {
    const key = (t === 'fut' && voice === 'pass' ? 'futp' : t) + `.${m}.${voice}.${p}`;
    return formKey(V.e, key);
  }
  function chooseTense(ctx, V, passive, p) {
    const opts = [];
    for (const t of ['pres', 'impf', 'fut', 'aor', 'pf']) {
      if (ctx.tenses && !ctx.tenses.includes(t)) continue;
      const voice = passive ? (t === 'aor' || t === 'fut' ? 'pass' : 'mp') : activeVoice(V, t, 'ind', p);
      if (!voice) continue;
      const f = vform(V, t, 'ind', voice, p);
      if (!f || !f.req.every((q) => ctx.T.has(q))) continue;
      opts.push({ t, voice, f, w: ctx.focusT === t ? 4 : t === 'pf' ? 0.4 : 1 });
    }
    if (!opts.length) return null;
    const tot = opts.reduce((a, o) => a + o.w, 0);
    let r = rand() * tot;
    for (const o of opts) { r -= o.w; if (r <= 0) return o; }
    return opts[opts.length - 1];
  }
  // forma italiana: p indice di persona (0..5)
  function itVerb(V, k, itT, o) {
    const inf = V.it[k % V.it.length];
    return IT.verb(inf, itT, o);
  }

  /* ---------- Chiusura della frase ---------- */
  function finish(ctx, tokens, itFn, extra = [], tip = '', punct = '.') {
    const toks = tokens.filter(Boolean);
    if (toks.some((t) => !t.p && !t.a)) return null;
    toks.push({ p: punct });
    const tags = new Set(extra);
    for (const t of toks) if (t.a) t.a.req.forEach((q) => tags.add(q));
    for (const q of tags) if (!ctx.T.has(q)) return null;
    const gr = S.render(toks);
    const slots = [];
    const reg = (k, n) => { if (n > 1 && !slots.find((s) => s.k === k)) slots.push({ k, n }); };
    const fmt = (s) => { s = s.replace(/\s+/g, ' ').replace(/\s+([,.;?!])/g, '$1').trim(); return IT.cap(s) + (punct === ';' ? '?' : punct === '·' ? '.' : punct); };
    const base = itFn(() => 0, reg);
    if (!base || /undefined|null/.test(base)) return null;
    const outs = [fmt(base)];
    for (const sl of slots) for (let i = 1; i < sl.n && outs.length < 8; i++) {
      const alt = itFn((k) => (k === sl.k ? i : 0), () => {});
      const f = alt && fmt(alt);
      if (f && !outs.includes(f)) outs.push(f);
    }
    // combinazioni di due varianti (fino a otto traduzioni accettate)
    if (slots.length >= 2) for (let i = 1; i < slots[0].n; i++) for (let j = 1; j < slots[1].n && outs.length < 8; j++) {
      const alt = itFn((k) => (k === slots[0].k ? i : k === slots[1].k ? j : 0), () => {});
      const f = alt && fmt(alt);
      if (f && !outs.includes(f)) outs.push(f);
    }
    return { gr, it: outs, tags: [...tags], tokens: toks, tip };
  }
  const subjP = (np) => (np.num === 'p' ? 5 : 2);
  // neutro plurale soggetto: verbo greco al singolare
  const grSubjPers = (np) => (np.num === 'p' && np.n.g !== 'n' ? '3p' : '3s');

  /* ---------- Costruttori ---------- */
  // frase semplice attiva: soggetto, verbo, oggetto, dativo, complemento di luogo
  // o: np (soggetto espresso), person (persona fissa, soggetto sottinteso), tense (tempo fisso), vf (filtro sui verbi),
  //    sCls (classi ammesse per il soggetto), neg (negazione)
  function bBasic(ctx, o = {}) {
    const V = pick(VERBS.filter((v) => !v.inf && !v.say && vOK(ctx, v) && (!o.vf || o.vf(v)) && (!o.sCls || v.s.split(' ').some((c) => o.sCls.includes(c) || c === 'H'))));
    if (!V) return null;
    const personal = o.person != null || (!o.np && chance(0.25));
    const person = personal ? (o.person != null ? o.person : pick([0, 1, 3, 4])) : null;
    const sNP = personal ? null : mkNP(ctx, o.sCls ? o.sCls : V.s);
    if (!personal && (!sNP || !matches(sNP.n, V.s))) return null;
    const gp = personal ? PERS[person] : grSubjPers(sNP);
    let tt = chooseTense(ctx, V, false, gp);
    if (o.tense) {
      const voice = activeVoice(V, o.tense, 'ind', gp);
      const f = voice && vform(V, o.tense, 'ind', voice, gp);
      tt = f ? { t: o.tense, voice, f } : null;
    }
    if (!tt) return null;
    // persone che hanno la stessa forma (ἔλυον = «scioglievo» e «scioglievano»): tutte accettate
    const samePers = personal ? PERS.map((p, i) => i).filter((i) => V.e.forms.some((f) => f.f === tt.f.f && f.key === tt.f.key.replace(/\.[123][sp]$/, '.' + PERS[i]))) : [];
    const altPers = samePers.length > 1 && !o.noAlt ? [person, ...samePers.filter((i) => i !== person)] : [person];
    const parts = { V: [S.tok(tt.f)] };
    let oNP = null, dNP = null, pp = null;
    if (V.o) {
      oNP = mkNP(ctx, V.o, { avoid: sNP ? [sNP.n] : [] });
      if (!oNP) return null;
      parts.O = grNP(oNP, V.oc || 'acc');
    }
    if (V.d && (V.req === 'd' || chance(0.4))) {
      dNP = mkNP(ctx, V.d, { avoid: [sNP && sNP.n, oNP && oNP.n].filter(Boolean), adj: false });
      if (!dNP && V.req === 'd') return null;
      if (dNP) parts.D = grNP(dNP, 'dat');
    }
    if (V.pp && ctx.T.has('prep') && (V.req === 'loc' || V.req === 'to' || chance(0.6))) {
      const kinds = Object.keys(V.pp).filter((k) => !V.req || V.req === 'd' || V.req === k || !['loc', 'to'].includes(V.req));
      const kind = V.req && V.pp[V.req] ? V.req : pick(kinds);
      const pNP = mkNP(ctx, V.pp[kind], { avoid: [sNP && sNP.n, oNP && oNP.n].filter(Boolean), adj: false, num: 's', place: true, demo: false });
      if (pNP) {
        const prep = kind === 'loc' ? 'ἐν' : kind === 'to' ? 'εἰς' : pick(['ἐκ', 'ἀπό']);
        const c = kind === 'loc' ? 'dat' : kind === 'to' ? 'acc' : 'gen';
        const pf = INV(prep);
        const npT = grNP(pNP, c);
        if (pf && npT) pp = { kind, prep, toks: [S.tok(pf.forms[0]), ...npT], np: pNP };
      }
    }
    if ((V.req === 'loc' || V.req === 'to') && !pp) return null;
    if (sNP) parts.S = grNP(sNP, 'nom');
    if (Object.values(parts).some((x) => x === null)) return null;
    // ordine greco: verbo in fondo o al centro
    const orders = sNP ? [['S', 'O', 'D', 'P', 'V'], ['S', 'D', 'O', 'V', 'P'], ['S', 'V', 'O', 'D', 'P'], ['O', 'V', 'S', 'D', 'P']] : [['O', 'D', 'P', 'V'], ['V', 'O', 'D', 'P'], ['P', 'O', 'D', 'V']];
    const order = pick(o.sFirst ? orders.filter((x) => x[0] === 'S') : orders);
    if (pp) parts.P = pp.toks;
    if (o.neg === undefined) o.neg = chance(0.12);
    if (o.neg) parts.V = [S.tok(INV('οὐ').forms[0]), ...parts.V];
    const toks = order.flatMap((k) => parts[k] || []);
    // italiano
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      const p = personal ? altPers[sl('pp', altPers.length) % altPers.length] : subjP(sNP);
      const sI = sNP ? itNP(sNP, sl('s', sNP.n.it.length)) : null;
      const itT = TENSE[tt.t].it[sl('t', TENSE[tt.t].it.length) % TENSE[tt.t].it.length];
      let vI = itVerb(V, sl('v', V.it.length), itT, { p, g: sI ? sI.g : 'm', n: p >= 3 ? 'p' : 's', neg: !!o.neg });
      let s = (sI ? itStr(sI) + ' ' : '') + vI;
      if (oNP) { const oI = itNP(oNP, sl('o', oNP.n.it.length)); s += ' ' + itStr(oI, V.oit || null); }
      if (dNP) s += ' ' + itStr(itNP(dNP, sl('d', dNP.n.it.length)), 'a');
      if (pp) s += ' ' + itStr(itNP(pp.np, sl('p', pp.np.n.it.length)), pp.kind === 'from' ? 'da' : 'in');
      return s;
    };
    const r = finish(ctx, toks, itFn, [], o.tip || tipFor(ctx, tt));
    if (r) r.meta = { V, sNP, person, tt, oNP, pp, itFn };
    return r;
  }
  // passivo con complemento d'agente
  function bPass(ctx) {
    const V = pick(VERBS.filter((v) => v.pass && vOK(ctx, v)));
    if (!V) return null;
    const sNP = mkNP(ctx, V.o);
    if (!sNP) return null;
    const gp = grSubjPers(sNP);
    const tt = chooseTense(ctx, V, true, gp);
    if (!tt) return null;
    const aNP = ctx.T.has('prep') && chance(0.75) ? mkNP(ctx, V.s, { avoid: [sNP.n], adj: false }) : null;
    const sT = grNP(sNP, 'nom');
    if (!sT) return null;
    let aT = null;
    if (aNP) { const nt = grNP(aNP, 'gen'); if (nt) aT = [S.tok(INV('ὑπό').forms[0]), ...nt]; }
    const vT = [S.tok(tt.f)];
    const toks = chance(0.5) ? [...sT, ...(aT || []), ...vT] : [...sT, ...vT, ...(aT || [])];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      const sI = itNP(sNP, sl('s', sNP.n.it.length));
      const itT = TENSE[tt.t].it[sl('t', TENSE[tt.t].it.length) % TENSE[tt.t].it.length];
      const aux = itT === 'pr' || itT === 'pp' ? 'essere' : sl('x', 2) ? 'venire' : 'essere';
      let s = itStr(sI) + ' ' + itVerb(V, sl('v', V.it.length), itT, { p: subjP(sNP), g: sI.g, n: sI.n, voice: 'pass', passAux: aux });
      if (aNP && aT) s += ' ' + itStr(itNP(aNP, sl('a', aNP.n.it.length)), 'da');
      return s;
    };
    return finish(ctx, toks, itFn, ['mp'], aT ? 'ὑπό + genitivo: complemento d’agente.' : 'Forma passiva: il soggetto subisce l’azione.');
  }
  // soggetto + εἰμί + aggettivo predicativo
  function bCopula(ctx, o = {}) {
    const EIMI = lex('v', 'εἰμί');
    const adjs = ADJS.filter((a) => aOK(ctx, a) && (!o.cmp || a.e.cmp));
    if (!adjs.length) return null;
    const A = pick(adjs);
    const nouns = NOUNS.filter((n) => nOK(ctx, n) && A.cls.some((c) => n.cls.has(c)));
    if (!nouns.length) return null;
    const n = pick(nouns);
    const sNP = { n, num: n.sg ? 's' : chance(0.4) ? 'p' : 's', adj: null };
    const gp = grSubjPers(sNP);
    const ts = ['pres', 'impf', 'fut'].filter((t) => ctx.T.has(t === 'pres' ? 'pres' : t));
    const t = ctx.focusT && ts.includes(ctx.focusT) ? ctx.focusT : pick(ts);
    const vf = formKey(EIMI, t === 'fut' ? `fut.ind.mid.${gp}` : `${t}.ind.act.${gp}`);
    if (!vf) return null;
    let af, cmpNP = null;
    if (o.cmp) {
      const cmpW = A.e.cmp.split('/')[0];
      af = A.e.forms.find((f) => f.key === `a.cmp.${n.g}.nom.${sNP.num}` && f.dl === G.strip(cmpW));
      cmpNP = mkNP(ctx, [...n.cls].filter((c) => A.cls.includes(c)).join(' ') || 'H', { avoid: [n], adj: false, num: sNP.num });
      if (!cmpNP) return null;
    } else af = formKey(A.e, `a.pos.${n.g}.nom.${sNP.num}`, n.g);
    if (!af) return null;
    const sT = grNP(sNP, 'nom');
    const cT = cmpNP ? grNP(cmpNP, 'gen') : [];
    if (!sT || !cT) return null;
    const toks = chance(0.5) ? [...sT, S.tok(af), S.tok(vf), ...cT] : [S.tok(af), S.tok(vf), ...sT, ...cT];
    const itFn = (ch, reg) => {
      const sl = (k, nn) => { reg(k, nn); return ch(k); };
      const sI = itNP(sNP, sl('s', n.it.length));
      const ess = IT.verb('essere', t === 'pres' ? 'pres' : t === 'impf' ? 'impf' : 'fut', { p: subjP(sNP) });
      const adj = IT.adjAgree(A.it, sI.g, sI.n);
      let s = itStr(sI) + ' ' + ess + ' ' + (o.cmp ? cmpIt(A, sI) : adj);
      if (cmpNP) s += ' ' + itStr(itNP(cmpNP, sl('c', cmpNP.n.it.length)), 'di');
      return s;
    };
    return finish(ctx, toks, itFn, o.cmp ? ['agg2'] : [], o.cmp ? 'Secondo termine di paragone in genitivo.' : 'L’aggettivo fuori dal gruppo articolo-nome è predicativo.');
  }
  const CMP_IT = { 'ἀγαθός': 'migliore|migliori', 'κακός': 'peggiore|peggiori', 'μέγας': 'maggiore|maggiori' };
  function cmpIt(A, sI) {
    if (CMP_IT[A.e.lemma]) return IT.adjAgree(IT.adjForms(CMP_IT[A.e.lemma]), sI.g, sI.n);
    return 'più ' + IT.adjAgree(A.it, sI.g, sI.n);
  }
  // vocativo e imperativo
  function bImper(ctx) {
    const V = pick(VERBS.filter((v) => !v.inf && !v.say && v.o && vOK(ctx, v)));
    if (!V) return null;
    const plural = chance(0.5);
    const p = plural ? '2p' : '2s';
    const tOpts = ['pres', 'aor'].filter((t) => ctx.T.has(t));
    const t = ctx.focusT === 'aor' && tOpts.includes('aor') ? 'aor' : pick(tOpts);
    const voice = activeVoice(V, t, 'imp', p);
    const vf = voice && vform(V, t, 'imp', voice, p);
    if (!vf) return null;
    const oNP = mkNP(ctx, V.o);
    if (!oNP) return null;
    const oT = grNP(oNP, V.oc || 'acc');
    const vocN = NOUNS.filter((n) => nOK(ctx, n) && matches(n, V.s) && !n.o.noart && formKey(n.e, `n.voc.${plural ? 'p' : 's'}`, n.g));
    const voc = vocN.length && chance(0.6) ? pick(vocN) : null;
    let vocT = [];
    if (voc) vocT = [S.tok(INV('ὦ').forms[0]), S.tok(formKey(voc.e, `n.voc.${plural ? 'p' : 's'}`, voc.g)), { p: ',' }];
    if (!oT) return null;
    const toks = [...vocT, S.tok(vf), ...oT];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      let s = '';
      if (voc) { const v = voc.it[sl('c', voc.it.length) % voc.it.length]; s = (plural ? v.pl : v.sg) + ', '; }
      s += itVerb(V, sl('v', V.it.length), 'imp', { p: plural ? 4 : 1 }) + ' ' + itStr(itNP(oNP, sl('o', oNP.n.it.length)), V.oit || null);
      return s;
    };
    return finish(ctx, toks, itFn, [], t === 'aor' ? 'Imperativo aoristo: azione puntuale, senza valore temporale.' : 'Imperativo presente.');
  }
  // dimostrativo in posizione predicativa
  function bDemo(ctx) {
    const base = bBasic(ctx, { demo: true });
    return base;
  }
  // participio attributivo o sostantivato come soggetto
  function bPart(ctx) {
    const V = pick(VERBS.filter((v) => v.pp && !v.o && !v.req && v.la !== 'ἀποθνῄσκω' && vOK(ctx, v)));
    if (!V) return null;
    const t = ctx.T.has('aor') && chance(0.4) ? 'aor' : 'pres';
    const voice = activeVoice(V, t, 'ind', '3s');
    if (!voice) return null;
    const main = pick(VERBS.filter((v) => v.o && !v.inf && !v.say && v !== V && vOK(ctx, v)));
    if (!main) return null;
    const sN = NOUNS.filter((n) => nOK(ctx, n) && matches(n, V.s) && matches(n, main.s) && !n.o.noart);
    if (!sN.length) return null;
    const n = pick(sN);
    const num = chance(0.5) ? 'p' : 's';
    const gp = num === 'p' && n.g !== 'n' ? '3p' : '3s';
    const tt = chooseTense(ctx, main, false, gp);
    if (!tt) return null;
    const pf = formKey(V.e, `${t}.part.${voice}.${n.g}.nom.${num}`);
    const art = formKey(ART, `art.${n.g}.nom.${num}`);
    const nf = formKey(n.e, `n.nom.${num}`, n.g);
    const oNP = mkNP(ctx, main.o, { avoid: [n] });
    if (!pf || !art || !nf || !oNP) return null;
    const oT = grNP(oNP, main.oc || 'acc');
    if (!oT) return null;
    const subst = chance(0.4);
    const sT = subst ? [S.tok(art), S.tok(pf)] : [S.tok(art), S.tok(pf), S.tok(nf)];
    const toks = [...sT, ...oT, S.tok(tt.f)];
    const itFn = (ch, reg) => {
      const sl = (k, nn) => { reg(k, nn); return ch(k); };
      const v = n.it[sl('s', n.it.length) % n.it.length];
      const g = num === 'p' ? v.gpl : v.g;
      // tempo della relativa italiana: contemporaneo (presente/imperfetto) o anteriore (passato prossimo/trapassato)
      const past = tt.t === 'impf' || tt.t === 'aor';
      const relT = t === 'aor' ? (past ? 'tp' : 'pp') : (past ? 'impf' : 'pres');
      const rel = itVerb(V, sl('r', V.it.length), relT, { p: num === 'p' ? 5 : 2, g, n: num });
      let sI;
      if (subst) sI = (num === 'p' ? sl('q', 2) ? 'coloro che' : 'quelli che' : 'colui che') + ' ' + rel;
      else { const w = num === 'p' ? v.pl : v.sg; sI = IT.defArt(g, num, w) + (IT.defArt(g, num, w).endsWith("'") ? '' : ' ') + w + ' che ' + rel; }
      const itT = TENSE[tt.t].it[sl('t', TENSE[tt.t].it.length) % TENSE[tt.t].it.length];
      return sI + ' ' + itVerb(main, sl('v', main.it.length), itT, { p: num === 'p' ? 5 : 2, g, n: num }) + ' ' + itStr(itNP(oNP, sl('o', oNP.n.it.length)), main.oit || null);
    };
    return finish(ctx, toks, itFn, [], subst ? 'Participio sostantivato: articolo + participio = «colui che…».' : 'Participio attributivo, tra articolo e nome: si rende con una relativa.');
  }
  // genitivo assoluto (participio presente) + principale
  function bGenAbs(ctx) {
    const V = pick(VERBS.filter((v) => v.pp && !v.o && !v.req && v.la !== 'ἀποθνῄσκω' && vOK(ctx, v)));
    if (!V) return null;
    const voice = activeVoice(V, 'pres', 'ind', '3s');
    const gN = NOUNS.filter((n) => nOK(ctx, n) && matches(n, V.s) && !n.o.noart);
    if (!voice || !gN.length) return null;
    const n = pick(gN);
    const num = n.sg ? 's' : chance(0.6) ? 'p' : 's';
    const pf = formKey(V.e, `pres.part.${voice}.${n.g}.gen.${num}`);
    const gT = grNP({ n, num, adj: null }, 'gen');
    if (!pf || !gT) return null;
    const main = bBasic(Object.assign({}, ctx, { focusT: ctx.T.has('aor') ? 'aor' : 'impf', avoidN: n }));
    if (!main) return null;
    const mainToks = main.tokens.slice(0, -1);
    if (main.tokens.some((t) => t.a && t.a.e === n.e)) return null;
    const toks = [...gT, S.tok(pf), { p: ',' }, ...mainToks];
    const itFn = (ch, reg) => {
      const sl = (k, nn) => { reg(k, nn); return ch(k); };
      const v = n.it[sl('g', n.it.length) % n.it.length];
      const g = num === 'p' ? v.gpl : v.g;
      const w = num === 'p' ? v.pl : v.sg;
      const art = IT.defArt(g, num, w);
      const past = main.tokens.some((t) => t.a && t.a.m === 'ind' && (t.a.t === 'aor' || t.a.t === 'impf'));
      const sub = 'mentre ' + art + (art.endsWith("'") ? '' : ' ') + w + ' ' + itVerb(V, sl('r', V.it.length), past ? 'impf' : 'pres', { p: num === 'p' ? 5 : 2 });
      const m = main.it[sl('m', main.it.length) % main.it.length];
      return sub + ', ' + m.charAt(0).toLowerCase() + m.slice(1).replace(/[.?]$/, '');
    };
    return finish(ctx, toks, itFn, ['part'], 'Genitivo assoluto: nome e participio in genitivo, staccati dalla principale.');
  }
  // verbo servile o dichiarativo + infinito
  function bInf(ctx) {
    const say = ctx.T.has('inf') && chance(0.5);
    const M = pick(VERBS.filter((v) => (say ? v.say : v.inf) && vOK(ctx, v)));
    if (!M) return null;
    const V = pick(VERBS.filter((v) => v.o && !v.inf && !v.say && vOK(ctx, v)));
    if (!V) return null;
    const sNP = mkNP(ctx, M.s);
    if (!sNP) return null;
    const gp = grSubjPers(sNP);
    const tt = chooseTense(ctx, M, false, gp);
    if (!tt || (say && tt.t !== 'pres')) return null;
    const iv = activeVoice(V, 'pres', 'ind', '3s');
    const inf = iv && formKey(V.e, `pres.inf.${iv === 'mid' ? 'mp' : iv}`);
    if (!inf) return null;
    const oNP = mkNP(ctx, V.o, { avoid: [sNP.n] });
    if (!oNP) return null;
    let aNP = null;
    if (say) { aNP = mkNP(ctx, V.s, { avoid: [sNP.n, oNP.n], adj: false }); if (!aNP) return null; }
    const sT = grNP(sNP, 'nom'), oT = grNP(oNP, V.oc || 'acc'), aT = aNP ? grNP(aNP, 'acc') : [];
    if (!sT || !oT || !aT) return null;
    const toks = [...sT, S.tok(tt.f), ...aT, ...oT, S.tok(inf)];
    const itFn = (ch, reg) => {
      const sl = (k, n) => { reg(k, n); return ch(k); };
      const sI = itNP(sNP, sl('s', sNP.n.it.length));
      const itT = TENSE[tt.t].it[sl('t', TENSE[tt.t].it.length) % TENSE[tt.t].it.length];
      let s = itStr(sI) + ' ' + itVerb(M, sl('m', M.it.length), itT, { p: subjP(sNP) });
      if (say) {
        const aI = itNP(aNP, sl('a', aNP.n.it.length));
        s += ' che ' + itStr(aI) + ' ' + itVerb(V, sl('v', V.it.length), 'pres', { p: subjP(aNP) });
      } else s += ' ' + V.it[sl('v', V.it.length) % V.it.length];
      return s + ' ' + itStr(itNP(oNP, sl('o', oNP.n.it.length)), V.oit || null);
    };
    return finish(ctx, toks, itFn, say ? ['inf'] : [], say ? 'Proposizione infinitiva: soggetto in accusativo e verbo all’infinito.' : 'Infinito retto da un verbo servile.');
  }
  // proposizione finale: «il comandante manda i soldati affinché custodiscano la città»
  function bFinal(ctx) {
    const PEMPO = VERBS.find((v) => v.la === 'πέμπω');
    const sNP = mkNP(ctx, 'rul fam civ', { adj: false });
    const oNP = mkNP(ctx, 'msg mil srv', { avoid: sNP ? [sNP.n] : [], adj: false });
    if (!PEMPO || !vOK(ctx, PEMPO) || !sNP || !oNP) return null;
    const V = pick(VERBS.filter((v) => v.o && !v.inf && !v.say && v !== PEMPO && !v.oc && vOK(ctx, v) && matches(oNP.n, v.s)));
    if (!V) return null;
    const gp = grSubjPers(sNP);
    const tt = chooseTense(ctx, PEMPO, false, gp);
    if (!tt || tt.t === 'pf') return null;
    const hist = tt.t === 'impf' || tt.t === 'aor';
    const fp = oNP.num === 'p' ? '3p' : '3s';
    const mood = hist && chance(0.5) ? 'opt' : 'subj';
    const voice = activeVoice(V, 'pres', mood, fp);
    const vf = voice && formKey(V.e, `pres.${mood}.${voice}.${fp}`);
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
    return finish(ctx, toks, itFn, ['cong'], mood === 'opt' ? 'Dopo un tempo storico la finale può avere l\u2019ottativo (obliquo).' : conj + ' + congiuntivo: proposizione finale.');
  }
  const lowFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const noPunct = (s) => s.replace(/[.?]$/, '');
  // temporale: «dopo che i soldati andarono nella città, custodirono la casa»
  function bTemp(ctx) {
    const t = ctx.T.has('aor') ? 'aor' : 'impf';
    const a = bBasic(ctx, { np: true, tense: t, vf: (v) => !!v.pp && !v.o && v.la !== 'ἀποθνῄσκω', neg: false });
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
  const pick2 = (i, a, b) => (i ? b : a);
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
  }
  // soggetto con una relativa: «il soldato, che rimane nella città, custodisce la casa»
  function bRel(ctx) {
    const V2 = pick(VERBS.filter((v) => v.pp && !v.o && !v.req && v.la !== 'ἀποθνῄσκω' && vOK(ctx, v)));
    const main = pick(VERBS.filter((v) => v.o && !v.inf && !v.say && vOK(ctx, v)));
    if (!V2 || !main) return null;
    const sN = NOUNS.filter((n) => nOK(ctx, n) && matches(n, V2.s) && matches(n, main.s));
    if (!sN.length) return null;
    const n = pick(sN);
    const num = n.sg ? 's' : chance(0.5) ? 'p' : 's';
    const sNP = { n, num, adj: null };
    const gp = grSubjPers(sNP);
    const t2 = chooseTense(ctx, V2, false, gp), t1 = chooseTense(ctx, main, false, gp);
    if (!t2 || !t1) return null;
    const relE = E.LEX.find((e) => e.k === 'p' && e.pid === 'hos');
    const rf = formKey(relE, `p.${n.g}.nom.${num}`);
    const kind = Object.keys(V2.pp)[0];
    const pNP = mkNP(ctx, V2.pp[kind], { avoid: [n], adj: false, num: 's', demo: false, place: true });
    const oNP = mkNP(ctx, main.o, { avoid: [n] });
    if (!rf || !pNP || !oNP) return null;
    const prep = kind === 'loc' ? 'ἐν' : kind === 'to' ? 'εἰς' : 'ἐκ';
    const pT = grNP(pNP, kind === 'loc' ? 'dat' : kind === 'to' ? 'acc' : 'gen'), sT = grNP(sNP, 'nom'), oT = grNP(oNP, main.oc || 'acc');
    if (!pT || !sT || !oT) return null;
    const toks = [...sT, { p: ',' }, S.tok(rf), S.tok(INV(prep).forms[0]), ...pT, S.tok(t2.f), { p: ',' }, ...oT, S.tok(t1.f)];
    const itFn = (ch, reg) => {
      const sl = (k, nn) => { reg(k, nn); return ch(k); };
      const sI = itNP(sNP, sl('s', n.it.length));
      const p = subjP(sNP);
      const i2 = TENSE[t2.t].it[0], i1 = TENSE[t1.t].it[sl('t', TENSE[t1.t].it.length) % TENSE[t1.t].it.length];
      const rel = sl('r', 2) ? (sI.n === 'p' ? (sI.g === 'f' ? 'le quali' : 'i quali') : sI.g === 'f' ? 'la quale' : 'il quale') : 'che';
      return itStr(sI) + ', ' + rel + ' ' + itVerb(V2, sl('w', V2.it.length), i2, { p, g: sI.g, n: sI.n }) + ' ' +
        itStr(itNP(pNP, sl('p', pNP.n.it.length)), kind === 'from' ? 'da' : 'in') + ', ' + itVerb(main, sl('v', main.it.length), i1, { p, g: sI.g, n: sI.n }) + ' ' + itStr(itNP(oNP, sl('o', oNP.n.it.length)), main.oit || null);
    };
    return finish(ctx, toks, itFn, [], 'Il relativo concorda con l’antecedente in genere e numero; il caso dipende dalla funzione nella relativa.');
  }
  // μέν… δέ: due proposizioni contrapposte, con soggetti diversi e lo stesso tempo
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
      const inv = /^(il|lo|la|i|gli|le) \S+ /.test(yy) ? yy.replace(/^(\S+ \S+)/, '$1 invece') : null;
      return inv && sl('c', 2) ? x + ', ' + inv : x + ', mentre ' + yy;
    };
    return finish(ctx, toks, itFn, [], 'μέν… δέ contrappone due membri; δέ si traduce «invece», «mentre».');
  }

  function tipFor(ctx, tt) {
    const f = tt.f;
    if (f.t === 'aor') return 'Aoristo indicativo: passato remoto o passato prossimo.';
    if (f.t === 'impf') return 'Imperfetto: l’aumento indica un tempo storico.';
    if (f.t === 'fut') return 'Futuro: il σ (o ψ, ξ) prima della desinenza.';
    if (f.t === 'pf') return 'Perfetto: raddoppiamento, stato raggiunto.';
    return '';
  }

  // costruttori adatti a ciascun argomento (con pesi)
  const BY_FOCUS = {
    art: [[bBasic, 1], [bPhrase, 1]], d1: [[bBasic, 2], [bCopula, 1], [bPhrase, 1]], pres: [[bBasic, 3], [bImper, 1], [bCopula, 1]], d2: [[bBasic, 2], [bCopula, 1], [bPhrase, 1]],
    agg1: [[bCopula, 2], [bBasic, 1], [bPhrase, 1]], prep: [[bBasic, 2]], mp: [[bPass, 3], [bBasic, 1]], impf: [[bBasic, 2], [bPass, 1]],
    contr: [[bBasic, 2], [bPass, 1]], d3: [[bBasic, 2], [bCopula, 1], [bPhrase, 1]], agg2: [[bCopula, 1]], pron: [[bBasic, 1]], rel: [[bRel, 1]],
    fut: [[bBasic, 2], [bPass, 1]], aor: [[bBasic, 2], [bPass, 1], [bImper, 1], [bTemp, 1]], part: [[bPart, 2], [bGenAbs, 1]],
    inf: [[bInf, 1]], mi: [[bBasic, 1]], cong: [[bFinal, 1]], sub: [[bTemp, 1]], perf: [[bMenDe, 1], [bBasic, 1]],
  };
  const FOCUS_T = { impf: 'impf', fut: 'fut', aor: 'aor', perf: 'pf', pres: 'pres' };
  const SPECIAL = { agg2: (ctx) => bCopula(ctx, { cmp: true }) };

  function generate(selected, focus, o = {}) {
    init();
    const T = new Set(selected);
    if (!T.has('art')) return null;
    const noVerb = !T.has('pres');
    const topics = [...T].filter((t) => BY_FOCUS[t]);
    const avoid = new Set(o.avoid || []);
    for (let attempt = 0; attempt < 80; attempt++) {
      const f = focus && T.has(focus) && attempt < 50 ? focus : pick(topics);
      const ctx = { T, focus: f, focusT: FOCUS_T[f] || null, lex: o.lex || null, tenses: o.tenses || null };
      let s = null;
      try {
        if (noVerb || (o.phrase && chance(0.5))) s = bPhrase(ctx);
        else if (o.simple && chance(0.5)) s = (chance(0.5) ? bBasic : bCopula)(ctx);
        else if (SPECIAL[f] && chance(0.7)) s = SPECIAL[f](ctx);
        else {
          const list = BY_FOCUS[f] || [[bBasic, 1]];
          const tot = list.reduce((a, x) => a + x[1], 0);
          let r = rand() * tot, fn = list[0][0];
          for (const [b, w] of list) { r -= w; if (r <= 0) { fn = b; break; } }
          s = fn(ctx);
        }
      } catch (e) { if (o.strict) throw e; s = null; }
      if (!s || avoid.has(s.gr)) continue;
      // la frase deve rientrare negli argomenti scelti e, se possibile, esercitare quello di focus
      if (attempt < 50 && focus && T.has(focus) && !s.tags.includes(focus) && !noVerb) continue;
      s.focus = s.tags.includes(f) ? f : s.tags.slice().sort((a, b) => S.ORDER.indexOf(b) - S.ORDER.indexOf(a))[0];
      s.id = 'g' + hash(s.gr);
      s.src = 'gen';
      return s;
    }
    return null;
  }
  function hash(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h).toString(36); }
  function seed(fn) { rand = fn || Math.random; }

  root.HermGen = { generate, seed, init, _internal: { bPhrase, bRel, bBasic, bPass, bCopula, bImper, bPart, bGenAbs, bInf, bFinal, bTemp, bMenDe } };
  if (typeof module !== 'undefined') module.exports = root.HermGen;
})(typeof window !== 'undefined' ? window : globalThis);
