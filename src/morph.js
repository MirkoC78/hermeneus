/* HERMENEUS — motore morfologico del greco antico (attico, biennio).
   Genera le forme dai temi dichiarati nel lessico e costruisce l'indice forma → analisi.
   Ogni analisi porta gli argomenti di programma necessari per riconoscerla (req). */
(function (root) {
  'use strict';
  const G = root.GreekOrtho || require('./greek.js');

  const CASES = ['nom', 'gen', 'dat', 'acc', 'voc'];
  const CASE_IT = { nom: 'nominativo', gen: 'genitivo', dat: 'dativo', acc: 'accusativo', voc: 'vocativo' };
  const NUM_IT = { s: 'singolare', p: 'plurale' };
  const GEN_IT = { m: 'maschile', f: 'femminile', n: 'neutro' };
  const PERS = ['1s', '2s', '3s', '1p', '2p', '3p'];
  const PERS_IT = { '1s': '1ª pers. sing.', '2s': '2ª pers. sing.', '3s': '3ª pers. sing.', '1p': '1ª pers. plur.', '2p': '2ª pers. plur.', '3p': '3ª pers. plur.' };
  const IMP_P = ['2s', '3s', '2p', '3p'];
  const TENSE_IT = { pres: 'presente', impf: 'imperfetto', fut: 'futuro', aor: 'aoristo', pf: 'perfetto' };
  const MOOD_IT = { ind: 'indicativo', subj: 'congiuntivo', opt: 'ottativo', imp: 'imperativo', inf: 'infinito', part: 'participio' };
  const VOICE_IT = { act: 'attivo', mp: 'medio-passivo', mid: 'medio', pass: 'passivo' };

  /* ---------- utilità ---------- */
  function parseFlags(s) {
    const o = {};
    if (!s) return o;
    s.split(',').forEach((kv) => {
      kv = kv.trim();
      if (!kv) return;
      const i = kv.indexOf('=');
      if (i < 0) o[kv] = true; else o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
    });
    return o;
  }
  // "a b(ν) c/d" → [[a],[b (nu)],[c,d]]
  function cell(s) {
    if (!s || s === '-') return [];
    return s.split('/').map((x) => {
      const nu = /\(ν\)$/.test(x);
      return { f: G.nfc(x.replace(/\(ν\)$/, '')), nu };
    });
  }
  const bareEnd = (s) => G.stripAccents(G.strip(s));
  function endsWithG(word, end) { return bareEnd(word).endsWith(end); }
  // toglie la desinenza (numero di lettere della desinenza, quantità e accenti esclusi)
  function cut(word, nLetters) {
    const L = G.parse(word);
    let k = 0, i = L.length;
    while (i > 0 && k < nLetters) { i--; if (!L[i].mark) k++; }
    const stem = L.slice(0, i);
    return stem;
  }
  function lettersStr(L) {
    // ricompone in notazione dati (con quantità _ e marcatori)
    let s = '';
    for (const l of L) {
      if (l.mark) { s += l.b; continue; }
      let ch = l.up ? l.b.toUpperCase() : l.b;
      if (l.di) ch += '\u0308';
      if (l.br) ch += l.br === 's' ? '\u0313' : '\u0314';
      if (l.ac) ch += l.ac === 'a' ? '\u0301' : l.ac === 'g' ? '\u0300' : '\u0342';
      if (l.is) ch += '\u0345';
      if (l.q === 'L') ch += '_';
      if (l.q === 'S') ch += '^';
      s += ch;
    }
    return s;
  }
  const stemOf = (word, n) => lettersStr(cut(word, n));
  function unacc(s) { const L = G.parse(s); L.forEach((l) => { if (!l.mark) l.ac = ''; }); return lettersStr(L); }

  // forma con accento persistente
  function P(str, anchor, o) { return G.pers(str, anchor, o); }
  // forma con desinenza accentata: il tema perde l'accento
  function FX(stem, end, o) {
    const L = G.parse(unacc(stem) + end);
    G.contract(L, o || {});
    return G.serialize(L);
  }
  function R(str, o) { return G.rec(str, o); }

  /* ---------- registrazione ---------- */
  const LEX = [];
  const STRICT = new Map();
  const BARE = new Map();
  let seq = 0;

  function addKey(map, k, a) {
    if (!map.has(k)) map.set(k, []);
    const arr = map.get(k);
    if (!arr.some((x) => x.e === a.e && x.key === a.key && x.f === a.f)) arr.push(a);
  }
  function index(a, variant) {
    const v = variant || a.f;
    addKey(STRICT, G.strict(v), a);
    addKey(BARE, G.bare(v), a);
  }
  // Le forme di nomi, aggettivi e verbi si generano alla prima richiesta (e.forms) e solo allora entrano nell'indice:
  // il caricamento è immediato e il browser completa l'indice a piccoli passi (warm).
  let pending = 0;
  function indexForms(e, forms) {
    for (const a of forms) {
      a.e = e;
      index(a);
      if (a.nu) index(a, a.f + 'ν');
      if (a.encl) {
        index(a, G.stripAccents(a.f));
        if (a.nu) index(a, G.stripAccents(a.f) + 'ν');
        // davanti a un'altra enclitica l'enclitica riceve l'acuto sull'ultima (πατήρ μού ἐστιν)
        index(a, G.addUltimaAcute(G.stripAccents(a.f)));
      }
      if (a.procl) index(a, G.addUltimaAcute(a.f));
      if (a.alt) for (const x of a.alt) index(a, x);
    }
  }
  function register(e, gen) {
    e.id = e.id || 'e' + (seq++);
    LEX.push(e);
    if (!gen) { indexForms(e, e.forms); e.ready = true; return e; }
    let cache = null;
    pending++;
    Object.defineProperty(e, 'forms', {
      enumerable: true, configurable: true,
      get() {
        if (!cache) { cache = gen(); e.ready = true; pending--; indexForms(e, cache); }
        return cache;
      },
    });
    return e;
  }
  // genera le forme ancora mancanti per al massimo ms millisecondi; restituisce la quota completata (0..1)
  let warmPos = 0;
  function warm(ms = 1e9) {
    const t0 = Date.now();
    while (warmPos < LEX.length && Date.now() - t0 < ms) { void LEX[warmPos].forms; warmPos++; }
    return warmPos >= LEX.length ? 1 : warmPos / LEX.length;
  }
  const isReady = () => pending === 0;
  function form(f, key, d, req, extra) {
    return Object.assign({ f, key, d, req }, extra || {});
  }

  /* ---------- Articolo ---------- */
  const ART = {
    m: ['ὁ', 'τοῦ', 'τῷ', 'τόν', '', 'οἱ', 'τῶν', 'τοῖς', 'τούς', ''],
    f: ['ἡ', 'τῆς', 'τῇ', 'τήν', '', 'αἱ', 'τῶν', 'ταῖς', 'τάς', ''],
    n: ['τό', 'τοῦ', 'τῷ', 'τό', '', 'τά', 'τῶν', 'τοῖς', 'τά', ''],
  };
  function nominalDesc(c, n, g) { return CASE_IT[c] + ' ' + NUM_IT[n] + (g ? ' ' + GEN_IT[g] : ''); }
  function buildArticle() {
    const forms = [];
    for (const g of ['m', 'f', 'n']) ART[g].forEach((f, i) => {
      if (!f) return;
      const c = CASES[i % 5], n = i < 5 ? 's' : 'p';
      forms.push(form(G.nfc(f), `art.${g}.${c}.${n}`, nominalDesc(c, n, g), ['art'], { g, c, n, procl: !/[\u0301\u0342]/.test(f.normalize('NFD')) }));
    });
    return register({ k: 'art', lemma: 'ὁ, ἡ, τό', m: 'il, lo, la (articolo)', topic: 'art', forms });
  }

  /* ---------- Nomi ---------- */
  const PL1 = ['αι', 'ῶν*', 'αις', 'α_ς', 'αι'];
  const D1 = {
    '1a': (q) => [['α' + q, 'α_ς', 'ᾳ', 'α' + q + 'ν', 'α' + q], PL1],
    '1ai': () => [['α', 'ης', 'ῃ', 'αν', 'α'], PL1],
    '1h': () => [['η', 'ης', 'ῃ', 'ην', 'η'], PL1],
    '1as': () => [['α_ς', 'ου', 'ᾳ', 'α_ν', 'α_'], PL1],
    '1es': (q, vA) => [['ης', 'ου', 'ῃ', 'ην', vA ? 'α' : 'η'], PL1],
    '2': () => [['ος', 'ου', 'ῳ', 'ον', 'ε'], ['οι', 'ων', 'οις', 'ους', 'οι']],
    '2n': () => [['ον', 'ου', 'ῳ', 'ον', 'ον'], ['α', 'ων', 'οις', 'α', 'α']],
  };
  const END_LEN = { '1a': 1, '1ai': 1, '1h': 1, '1as': 2, '1es': 2, '2': 2, '2n': 2 };
  // decl da nominativo e genitivo
  function nounType(nom, gen, g) {
    const N = bareEnd(nom), Gn = bareEnd(gen);
    if (Gn.endsWith('ας') && N.endsWith('α')) return '1a';
    if (Gn.endsWith('ης') && N.endsWith('α')) return '1ai';
    if (Gn.endsWith('ης') && N.endsWith('η')) return '1h';
    if (Gn.endsWith('ου') && N.endsWith('ας')) return '1as';
    if (Gn.endsWith('ου') && N.endsWith('ης')) return '1es';
    if (Gn.endsWith('ου') && N.endsWith('ος') && g !== 'n') return '2';
    if (Gn.endsWith('ου') && N.endsWith('ον') && g === 'n') return '2n';
    return '3';
  }
  // genera le forme flesse di una declinazione tematica a partire da tema + desinenze
  function themeForms(stem, anchor, sing, plur, opt = {}) {
    const out = { s: [], p: [] };
    const make = (end, c) => {
      if (end == null) return null;
      const clean = end.replace(/[*#]/g, '');
      if (end.includes('*')) return FX(stem, clean);
      const circ = c === 'gen' || c === 'dat';
      return P(stem + clean, anchor, { circUlt: circ && opt.oxy, ultShort: end.includes('#') });
    };
    sing.forEach((e, i) => out.s.push(make(e, CASES[i])));
    plur.forEach((e, i) => out.p.push(make(e, CASES[i])));
    return out;
  }
  function dpl3(stem) {
    // dativo plurale della III declinazione: tema + σι con le assimilazioni
    const L = G.parse(stem);
    const last = L[L.length - 1], prev = L[L.length - 2];
    const s = lettersStr(L.slice(0, -1));
    const b = last.b;
    if ('κγχ'.includes(b)) return s + 'ξι';
    if ('πβφ'.includes(b)) return s + 'ψι';
    if (b === 'τ' && prev && prev.b === 'ν') {
      const s2 = lettersStr(L.slice(0, -3));
      const v = L[L.length - 3];
      const vv = lettersStr([{ ...v, ac: '' }]);
      if (v.b === 'ο') return s2 + vv + 'υσι';
      if (v.b === 'α') return s2 + 'α_σι';
      if (v.b === 'ε') return s2 + vv + 'ισι';
      if (v.b === 'υ') return s2 + 'υ_σι';
    }
    if ('τδθ'.includes(b) && prev && 'κγχ'.includes(prev.b)) return lettersStr(L.slice(0, -2)) + 'ξι';
    if ('τδθ'.includes(b) && prev && 'πβφ'.includes(prev.b)) return lettersStr(L.slice(0, -2)) + 'ψι';
    if ('τδθν'.includes(b)) return s + 'σι';
    return stem + 'σι';
  }

  function nounForms(e) {
    const { nom, gen, g } = e;
    const fl = e.fl;
    const out = [];
    const push = (f, c, n, nu) => {
      if (!f) return;
      for (const x of (Array.isArray(f) ? f : [f])) out.push({ f: G.nfc(x.f || x), c, n, nu: x.nu || nu || false });
    };
    if (fl.full) {
      const [s, p] = fl.full.split(';').map((x) => x.trim().split(/\s+/));
      (s || []).forEach((x, i) => cell(x).forEach((y) => push(y.f, CASES[i], 's', y.nu)));
      (p || []).forEach((x, i) => cell(x).forEach((y) => push(y.f, CASES[i], 'p', y.nu)));
      return out;
    }
    const type = e.type;
    const anchor = G.anchorOf(nom);
    const nNom = G.syllables(nom);
    const oxy = anchor === nNom - 1;
    if (type !== '3') {
      const stem = stemOf(nom, END_LEN[type]);
      const longA = type === '1a' && G.parse(nom).filter((l) => !l.mark).slice(-1)[0].q === 'L';
      const [s, p] = D1[type](longA ? '_' : '', !!fl.vA);
      const tf = themeForms(stem, anchor, s, p, { oxy });
      if (!fl.pl) tf.s.forEach((f, i) => push(i === 0 ? G.strip(nom) : f, CASES[i], 's'));
      if (!fl.sg) tf.p.forEach((f, i) => push(f, CASES[i], 'p'));
    } else if (fl.tpl === 'genos') {
      const stem = stemOf(nom, 2);
      const tf = themeForms(stem, anchor, ['ος', 'ους', 'ει', 'ος', 'ος'], ['η', 'ῶν*', 'εσι', 'η', 'η'], {});
      tf.s.forEach((f, i) => push(f, CASES[i], 's'));
      if (!fl.sg) tf.p.forEach((f, i) => push(f, CASES[i], 'p', i === 2));
    } else if (fl.tpl === 'polis') {
      const stem = stemOf(nom, 2);
      const tf = themeForms(stem, anchor, ['ις', 'εως#', 'ει', 'ιν', 'ι'], ['εις', 'εων#', 'εσι', 'εις', 'εις'], {});
      tf.s.forEach((f, i) => push(f, CASES[i], 's'));
      if (!fl.sg) tf.p.forEach((f, i) => push(f, CASES[i], 'p', i === 2));
    } else if (fl.tpl === 'eus') {
      const stem = stemOf(nom, 3);
      const S = ['εύς', 'έως', 'εῖ', 'έα_', 'εῦ'].map((x) => FX(stem, x));
      const Pl = ['εῖς/ῆς', 'έων', 'εῦσι', 'έα_ς', 'εῖς'];
      S.forEach((f, i) => push(f, CASES[i], 's'));
      Pl.forEach((x, i) => x.split('/').forEach((y) => push(FX(stem, y), CASES[i], 'p', i === 2)));
    } else if (fl.tpl === 'es') {
      // nomi propri in -ης, -ους (Σωκράτης)
      const stem = stemOf(nom, 2);
      push(G.strip(nom), 'nom', 's');
      push(P(stem + 'ους', anchor), 'gen', 's');
      push(P(stem + 'ει', anchor), 'dat', 's');
      push(P(stem + 'η', anchor), 'acc', 's');
      push(R(stem + 'ες'), 'voc', 's');
    } else {
      // III declinazione a tema consonantico
      const stem = stemOf(gen, 2);
      const mono = nNom === 1;
      const neut = g === 'n';
      const a3 = (end, c, n) => {
        if (mono && (c === 'gen' || c === 'dat')) return P(stem + end, 99, { circUlt: true });
        return P(stem + end, anchor);
      };
      const dpl = fl.dpl ? G.nfc(fl.dpl) : (mono ? P(dpl3(stem), 99, { circUlt: true }) : P(dpl3(stem), anchor));
      const accS = fl.acc ? G.nfc(fl.acc) : neut ? G.strip(nom) : a3('α', 'acc');
      const voc = fl.novoc ? null : fl.voc ? G.nfc(fl.voc) : G.strip(nom);
      if (!fl.pl) {
        push(G.strip(nom), 'nom', 's');
        push(G.strip(gen), 'gen', 's');
        push(a3('ι', 'dat'), 'dat', 's');
        push(accS, 'acc', 's');
        if (voc) push(voc, 'voc', 's');
      }
      if (!fl.sg) {
        const np = neut ? a3('α', 'nom') : a3('ες', 'nom');
        push(np, 'nom', 'p');
        push(fl.gpl ? G.nfc(fl.gpl) : a3('ων', 'gen'), 'gen', 'p');
        push(dpl, 'dat', 'p', true);
        push(neut ? np : a3('ας', 'acc'), 'acc', 'p');
        push(np, 'voc', 'p');
      }
    }
    // vocativo dichiarato nel lessico (eccezioni come ἄδελφε)
    if (fl.voc && type !== '3') {
      for (let i = out.length - 1; i >= 0; i--) if (out[i].c === 'voc' && out[i].n === 's') out.splice(i, 1);
      out.push({ f: G.nfc(fl.voc), c: 'voc', n: 's' });
    }
    if (fl.novoc) for (let i = out.length - 1; i >= 0; i--) if (out[i].c === 'voc' && out[i].n === 's') out.splice(i, 1);
    return out;
  }
  const DECL_TOPIC = { 1: 'd1', 2: 'd2', 3: 'd3' };
  function addNoun(line) {
    const [nom, gen, g, m, flags] = line;
    const fl = parseFlags(flags);
    const type = fl.full ? (fl.decl ? (fl.decl === '3' ? '3' : fl.decl) : '3') : nounType(nom, gen, g);
    const decl = fl.decl ? +fl.decl : type === '3' ? 3 : type === '2' || type === '2n' ? 2 : 1;
    const e = { k: 'n', nom: G.nfc(nom), gen: G.nfc(gen || ''), g, m, fl, type, decl };
    const topic = fl.topic || DECL_TOPIC[decl];
    const gens = g.split('/');
    const gen1 = () => {
      const forms = [];
      for (const x of nounForms(e)) for (const gg of gens) {
        forms.push(form(x.f, `n.${x.c}.${x.n}`, nominalDesc(x.c, x.n), [topic], { c: x.c, n: x.n, g: gg, nu: x.nu }));
      }
      return forms;
    };
    const lemma = G.strip(nom);
    return register({
      k: 'n', lemma, gen: gen ? G.strip(gen) : '', g, m, decl, topic, fl, prop: !!fl.prop,
      head: lemma + (gen ? ', ' + G.strip(gen) : '') + ', ' + gens.map((x) => ({ m: 'ὁ', f: 'ἡ', n: 'τό' }[x])).join('/'),
    }, gen1);
  }

  /* ---------- Aggettivi ---------- */
  // prima classe: -ος -η/-ᾱ -ον (o a due uscite)
  function adj1Forms(masc, fem, neut, o = {}) {
    const anchor = G.anchorOf(masc);
    const n = G.syllables(masc);
    const oxy = anchor === n - 1;
    const stem = stemOf(masc, 2);
    const out = [];
    const push = (f, c, num, g) => { if (f) out.push({ f: G.nfc(f), c, n: num, g }); };
    const M = themeForms(stem, anchor, D1['2']()[0], D1['2']()[1], { oxy });
    M.s.forEach((f, i) => push(i === 0 ? G.strip(masc) : f, CASES[i], 's', 'm'));
    M.p.forEach((f, i) => push(f, CASES[i], 'p', 'm'));
    if (fem) {
      // fem === 'auto': -ᾱ dopo ε ι ρ, altrimenti -η
      const pureA = fem === 'auto' ? /[ειρ]$/.test(G.stripAccents(G.strip(stem))) : !bareEnd(fem).endsWith('η');
      const fe = pureA ? ['α_', 'α_ς', 'ᾳ', 'α_ν', 'α_'] : ['η', 'ης', 'ῃ', 'ην', 'η'];
      const F = themeForms(stem, anchor, fe, ['αι', 'ων', 'αις', 'α_ς', 'αι'], { oxy });
      F.s.forEach((f, i) => push(f, CASES[i], 's', 'f'));
      F.p.forEach((f, i) => push(f, CASES[i], 'p', 'f'));
    } else {
      M.s.forEach((f, i) => push(i === 0 ? G.strip(masc) : f, CASES[i], 's', 'f'));
      M.p.forEach((f, i) => push(f, CASES[i], 'p', 'f'));
    }
    const nE = o.pronN ? ['ο', 'ου', 'ῳ', 'ο', 'ο'] : D1['2n']()[0];
    const Nn = themeForms(stem, anchor, nE, D1['2n']()[1], { oxy });
    Nn.s.forEach((f, i) => push(f, CASES[i], 's', 'n'));
    Nn.p.forEach((f, i) => push(f, CASES[i], 'p', 'n'));
    return out;
  }
  // seconda classe e comparativi in -ων (accento recessivo)
  function adjOnForms(masc, o = {}) {
    const stem = stemOf(masc, 2); // εὐδαιμ
    const out = [];
    const push = (f, c, n, g, nu) => { if (f) out.push({ f: G.nfc(f), c, n, g, nu: !!nu }); };
    const r = (end) => R(stem + end);
    for (const g of ['m', 'f']) {
      push(G.strip(masc), 'nom', 's', g);
      push(r('ονος'), 'gen', 's', g);
      push(r('ονι'), 'dat', 's', g);
      push(r('ονα'), 'acc', 's', g);
      if (o.comp) push(r('ω'), 'acc', 's', g);
      push(r('ον'), 'voc', 's', g);
      push(r('ονες'), 'nom', 'p', g);
      if (o.comp) push(r('ους'), 'nom', 'p', g);
      push(r('ονων'), 'gen', 'p', g);
      push(r('οσι'), 'dat', 'p', g, true);
      push(r('ονας'), 'acc', 'p', g);
      if (o.comp) push(r('ους'), 'acc', 'p', g);
      push(r('ονες'), 'voc', 'p', g);
    }
    push(r('ον'), 'nom', 's', 'n'); push(r('ονος'), 'gen', 's', 'n'); push(r('ονι'), 'dat', 's', 'n'); push(r('ον'), 'acc', 's', 'n'); push(r('ον'), 'voc', 's', 'n');
    for (const c of ['nom', 'acc', 'voc']) { push(r('ονα'), c, 'p', 'n'); if (o.comp) push(r('ω'), c, 'p', 'n'); }
    push(r('ονων'), 'gen', 'p', 'n'); push(r('οσι'), 'dat', 'p', 'n', true);
    return out;
  }
  function adjEsForms(masc) {
    const stem = stemOf(masc, 2); // ἀληθ
    const out = [];
    const push = (f, c, n, g, nu) => out.push({ f: FX(stem, f), c, n, g, nu: !!nu });
    for (const g of ['m', 'f']) {
      ['ής', 'οῦς', 'εῖ', 'ῆ', 'ές'].forEach((x, i) => push(x, CASES[i], 's', g));
      ['εῖς', 'ῶν', 'έσι', 'εῖς', 'εῖς'].forEach((x, i) => push(x, CASES[i], 'p', g, i === 2));
    }
    ['ές', 'οῦς', 'εῖ', 'ές', 'ές'].forEach((x, i) => push(x, CASES[i], 's', 'n'));
    ['ῆ', 'ῶν', 'έσι', 'ῆ', 'ῆ'].forEach((x, i) => push(x, CASES[i], 'p', 'n', i === 2));
    return out;
  }
  function adjUsForms(masc) {
    const stem = stemOf(masc, 2); // ἡδ
    const out = [];
    const push = (f, c, n, g, nu) => out.push({ f: FX(stem, f), c, n, g, nu: !!nu });
    ['ύς', 'έος', 'εῖ', 'ύν', 'ύ'].forEach((x, i) => push(x, CASES[i], 's', 'm'));
    ['εῖς', 'έων', 'έσι', 'εῖς', 'εῖς'].forEach((x, i) => push(x, CASES[i], 'p', 'm', i === 2));
    ['εῖα', 'εί_ας', 'είᾳ', 'εῖαν', 'εῖα'].forEach((x, i) => push(x, CASES[i], 's', 'f'));
    ['εῖαι', 'ειῶν', 'εί_αις', 'εί_ας', 'εῖαι'].forEach((x, i) => push(x, CASES[i], 'p', 'f'));
    ['ύ', 'έος', 'εῖ', 'ύ', 'ύ'].forEach((x, i) => push(x, CASES[i], 's', 'n'));
    ['έα', 'έων', 'έσι', 'έα', 'έα'].forEach((x, i) => push(x, CASES[i], 'p', 'n', i === 2));
    return out;
  }
  // tabelle complete: "m: 5|5 ; f: 5|5 ; n: 5|5" con celle separate da spazi, "-" = manca
  function fullGendered(spec) {
    const out = [];
    spec.split(';').forEach((part) => {
      const [g, rest] = part.split(':').map((x) => x.trim());
      if (!rest) return;
      const [s, p] = rest.split('|').map((x) => x.trim().split(/\s+/));
      (s || []).forEach((x, i) => cell(x).forEach((y) => out.push({ f: y.f, c: CASES[i], n: 's', g, nu: y.nu })));
      (p || []).forEach((x, i) => cell(x).forEach((y) => out.push({ f: y.f, c: CASES[i], n: 'p', g, nu: y.nu })));
    });
    return out;
  }
  const DEG_IT = { pos: '', cmp: 'comparativo, ', sup: 'superlativo, ' };
  function addAdj(line) {
    const [masc, fem, neut, m, flags] = line;
    const fl = parseFlags(flags);
    let topic = fl.topic || 'agg1';
    if (!fl.full && (fl.tpl === 'es' || fl.tpl === 'us' || fl.tpl === 'on')) topic = fl.topic || 'agg2';
    const gen1 = () => {
    let raw;
    if (fl.full) { raw = fullGendered(fl.full); }
    else if (fl.tpl === 'es') raw = adjEsForms(masc);
    else if (fl.tpl === 'us') raw = adjUsForms(masc);
    else if (fl.tpl === 'on') raw = adjOnForms(masc);
    else raw = adj1Forms(masc, fem, neut, { pronN: !!fl.pronN });
    const forms = raw.map((x) => form(x.f, `a.pos.${x.g}.${x.c}.${x.n}`, nominalDesc(x.c, x.n, x.g), [topic], { c: x.c, n: x.n, g: x.g, deg: 'pos', nu: x.nu }));
    const degree = (list, deg) => {
      if (!list) return;
      list.split('/').forEach((w) => {
        const b = bareEnd(w);
        let rr;
        if (b.endsWith('ων')) rr = adjOnForms(w, { comp: true });
        else rr = adj1Forms(w, 'auto', null);
        rr.forEach((x) => forms.push(form(x.f, `a.${deg}.${x.g}.${x.c}.${x.n}`, DEG_IT[deg] + nominalDesc(x.c, x.n, x.g), ['agg2'], { c: x.c, n: x.n, g: x.g, deg, nu: x.nu, dl: G.strip(w) })));
      });
    };
    degree(fl.cmp, 'cmp');
    degree(fl.sup, 'sup');
    return forms;
    };
    const lemma = [masc, fem, neut].filter(Boolean).map((x) => G.strip(x)).join(', ');
    return register({ k: 'a', lemma: G.strip(masc), head: lemma, m, topic, fl, cmp: fl.cmp, sup: fl.sup }, gen1);
  }

  /* ---------- Pronomi ---------- */
  function addPron(id, head, m, topic, spec, extra = {}) {
    const raw = fullGendered(spec);
    const forms = raw.map((x) => form(x.f, `p.${x.g}.${x.c}.${x.n}`, nominalDesc(x.c, x.n, x.g === 'x' ? null : x.g), [topic],
      { c: x.c, n: x.n, g: x.g, nu: x.nu, encl: extra.encl ? extra.encl(x.f) : false, noGrave: !!extra.noGrave }));
    return register({ k: 'p', pid: id, lemma: head.split(',')[0].trim(), head, m, topic, forms, encl: !!extra.encl, noGrave: !!extra.noGrave });
  }

  /* ---------- Verbi ---------- */
  const E = {
    indA: ['ω', 'εις', 'ει', 'ομεν', 'ετε', 'ουσι(ν)'],
    indM: ['ομαι', 'ῃ/ει', 'εται', 'ομεθα', 'εσθε', 'ονται'],
    impfA: ['ον', 'ες', 'ε(ν)', 'ομεν', 'ετε', 'ον'],
    impfM: ['ομην', 'ου', 'ετο', 'ομεθα', 'εσθε', 'οντο'],
    subjA: ['ω', 'ῃς', 'ῃ', 'ωμεν', 'ητε', 'ωσι(ν)'],
    subjM: ['ωμαι', 'ῃ', 'ηται', 'ωμεθα', 'ησθε', 'ωνται'],
    optA: ['οιμι', 'οις', 'οι', 'οιμεν', 'οιτε', 'οιεν'],
    optAc: ['οίην*', 'οίης*', 'οίη*', 'οιμεν', 'οιτε', 'οιεν'],
    optM: ['οιμην', 'οιο', 'οιτο', 'οιμεθα', 'οισθε', 'οιντο'],
    impA: ['ε', 'ετω', 'ετε', 'οντων'],
    impM: ['ου', 'εσθω', 'εσθε', 'εσθων'],
    a1A: ['α', 'ας', 'ε(ν)', 'αμεν', 'ατε', 'αν'],
    a1M: ['αμην', 'ω', 'ατο', 'αμεθα', 'ασθε', 'αντο'],
    a1optA: ['αιμι', 'αις/ειας', 'αι/ειε(ν)', 'αιμεν', 'αιτε', 'αιεν/ειαν'],
    a1optM: ['αιμην', 'αιο', 'αιτο', 'αιμεθα', 'αισθε', 'αιντο'],
    a1impA: ['ον', 'ατω', 'ατε', 'αντων'],
    a1impM: ['αι', 'ασθω', 'ασθε', 'ασθων'],
    a2impM: ['οῦ*', 'εσθω', 'εσθε', 'εσθων'],
    pInd: ['ην', 'ης', 'η', 'ημεν', 'ητε', 'ησαν'],
    pSubj: ['ῶ*', 'ῇς*', 'ῇ*', 'ῶμεν*', 'ῆτε*', 'ῶσι(ν)*'],
    pOpt: ['είην*', 'είης*', 'είη*', 'εῖμεν*/είημεν*', 'εῖτε*/είητε*', 'εῖεν*/είησαν*'],
    pImp: ['ητι', 'ητω', 'ητε', 'εντων'],
    pfA: ['α', 'ας', 'ε(ν)', 'αμεν', 'ατε', 'α_σι(ν)'],
    pfM: ['μαι', 'σαι', 'ται', 'μεθα', 'σθε', 'νται'],
  };
  // conta i nuclei prima di «|» per i limiti d'accento dei composti
  function prefixNuclei(stem) {
    const i = stem.indexOf('|');
    if (i < 0) return null;
    return G.nuclei(G.parse(stem.slice(0, i))).length;
  }
  function vdesc(t, m, v, p) {
    let s = TENSE_IT[t] + ' ' + MOOD_IT[m];
    if (v) s += ' ' + VOICE_IT[v];
    if (p) s += ', ' + PERS_IT[p];
    return s;
  }
  // mode: all | nopart (senza participi) | part (solo participi)
  function verbForms(v, mode = 'all') {
    const out = [];
    const ctype = (stem) => (stem && stem.endsWith('+') ? G.parse(stem.slice(0, -1)).filter((l) => !l.mark).slice(-1)[0].b : null);
    const base = (v.tags || []).slice();
    const dep = v.dep; // 'm' deponente medio, 'p' deponente passivo
    const vo = (act) => (act ? 'act' : 'mp');
    const reqFor = (t, m, voice, extra = []) => {
      const r = new Set(base);
      if (t === 'pres') r.add(voice === 'act' ? 'pres' : 'mp');
      if (t === 'impf') { r.add('impf'); if (voice !== 'act') r.add('mp'); }
      if (t === 'fut') { r.add('fut'); if (voice !== 'act') r.add('mp'); }
      if (t === 'aor') { r.add('aor'); if (voice === 'mid') r.add('mp'); }
      if (t === 'futp') { r.add('aor'); r.add('mp'); }
      if (t === 'pf') { r.add('perf'); if (voice !== 'act') r.add('mp'); }
      if (m === 'subj' || m === 'opt') r.add('cong');
      if (m === 'part') r.add('part');
      if (v.ctype) r.add('contr');
      if (v.mi) r.add('mi');
      extra.forEach((x) => r.add(x));
      return [...r];
    };
    const no = new Set((v.no || '').split(/[\s,]+/).filter(Boolean));
    const skip = (key) => [...no].some((k) => key === k || key.startsWith(k + '.'));
    const emit = (f, key, d, req, extra) => { if (!skip(key)) out.push(form(f, key, d, req, extra)); };

    // applica una lista di desinenze a un tema
    // mode: rec | fix (desinenza accentata, '*') ; aug: forma aumentata
    function run(stem, ends, persons, mk, o = {}) {
      if (!stem || mode === 'part') return;
      const pre = prefixNuclei(stem);
      const min = pre == null ? null : (o.aug ? pre : pre - 1);
      ends.forEach((spec, i) => {
        spec.split('/').forEach((alt) => {
          // nei contratti la ε della 3ª sing. si fonde col tema: niente ν efelcistico (ἐτίμα, ἐποίει)
          const nu = /\(ν\)/.test(alt) && !(stem.endsWith('+') && /^ε\(ν\)$/.test(alt));
          let end = alt.replace('(ν)', '');
          const fixed = end.endsWith('*');
          end = end.replace('*', '');
          let f;
          if (fixed) f = FX(stem, end, o);
          else if (o.fixedEnd) f = G.fixedEnd(stem + end, o.fixedEnd, o);
          else f = R(stem + end, Object.assign({}, o, { min }));
          mk(f, persons[i], nu);
        });
      });
    }
    // participio di tipo III-I-III: desinenze [masc, gen, fem, neut, datpl] ('*' = accentata); anchor dal maschile
    function participle3(stem, spec, t, voice) {
      if (!stem || mode === 'nopart') return;
      const cl = (s) => s.replace('*', '').replace('(ν)', '');
      const [mN, mG, fN, nN, dP] = spec;
      const pre = prefixNuclei(stem);
      let anchor;
      if (mN.endsWith('*')) anchor = G.accentInfo(G.parse(unacc(stem) + cl(mN))).idx;
      else { const L = G.parse(stem + cl(mN)); G.recessive(L, { min: pre == null ? null : pre - 1 }); anchor = G.accentInfo(L).idx; }
      const pp = (s) => P(stem + s, anchor);
      const ms = cl(mG).replace(/ος$/, '');
      const fs = cl(fN).replace(/α$/, '');
      const femPure = /ι$/.test(G.stripAccents(G.strip(fs)));
      const rows = [];
      const add = (f, g, c, n, nu) => rows.push({ f, g, c, n, nu });
      for (const g of ['m', 'n']) {
        const nom = g === 'm' ? pp(cl(mN)) : pp(cl(nN));
        add(nom, g, 'nom', 's'); add(pp(ms + 'ος'), g, 'gen', 's'); add(pp(ms + 'ι'), g, 'dat', 's');
        add(g === 'm' ? pp(ms + 'α') : nom, g, 'acc', 's'); add(nom, g, 'voc', 's');
        const np = g === 'm' ? pp(ms + 'ες') : pp(ms + 'α');
        add(np, g, 'nom', 'p'); add(pp(ms + 'ων'), g, 'gen', 'p'); add(pp(cl(dP)), g, 'dat', 'p', true);
        add(g === 'm' ? pp(ms + 'ας') : np, g, 'acc', 'p'); add(np, g, 'voc', 'p');
      }
      (femPure ? ['α', 'α_ς', 'ᾳ', 'αν', 'α'] : ['α', 'ης', 'ῃ', 'αν', 'α']).forEach((x, i) => add(pp(fs + x), 'f', CASES[i], 's'));
      ['αι', null, 'αις', 'α_ς', 'αι'].forEach((x, i) => add(x ? pp(fs + x) : FX(stem + fs, 'ῶν'), 'f', CASES[i], 'p'));
      const tt = t === 'futp' ? 'fut' : t;
      for (const r of rows) {
        emit(r.f, `${t}.part.${voice}.${r.g}.${r.c}.${r.n}`, `participio ${TENSE_IT[tt]} ${VOICE_IT[voice]}, ${nominalDesc(r.c, r.n, r.g)}`,
          reqFor(t, 'part', voice, ['d3']), { c: r.c, n: r.n, g: r.g, nu: r.nu, t: tt, m: 'part', v: voice });
      }
    }
    // participio in -μενος (aggettivo della prima classe)
    function participleMenos(stem, end, t, voice) {
      if (!stem || mode === 'nopart') return;
      const fixed = end.endsWith('*');
      const e0 = end.replace('*', '');
      const pre = prefixNuclei(stem);
      let anchor;
      if (fixed) anchor = G.accentInfo(G.parse(unacc(stem) + e0)).idx;
      else { const L = G.parse(stem + e0); G.recessive(L, { min: pre == null ? null : pre - 1 }); anchor = G.accentInfo(L).idx; }
      const st = unacc(stem + e0.replace(/ος$/, ''));
      const rows = [];
      const M = themeForms(st, anchor, D1['2']()[0], D1['2']()[1], {});
      const F = themeForms(st, anchor, ['η', 'ης', 'ῃ', 'ην', 'η'], ['αι', 'ων', 'αις', 'α_ς', 'αι'], {});
      const N = themeForms(st, anchor, D1['2n']()[0], D1['2n']()[1], {});
      [['m', M], ['f', F], ['n', N]].forEach(([g, T]) => {
        T.s.forEach((f, i) => rows.push({ f, g, c: CASES[i], n: 's' }));
        T.p.forEach((f, i) => rows.push({ f, g, c: CASES[i], n: 'p' }));
      });
      const tt = t === 'futp' ? 'fut' : t;
      for (const r of rows) {
        emit(r.f, `${t}.part.${voice}.${r.g}.${r.c}.${r.n}`, `participio ${TENSE_IT[tt]} ${VOICE_IT[voice]}, ${nominalDesc(r.c, r.n, r.g)}`,
          reqFor(t, 'part', voice, ['agg1']), { c: r.c, n: r.n, g: r.g, t: tt, m: 'part', v: voice });
      }
    }
    const fin = (t, m, voice, tKey) => (f, p, nu) => {
      const key = `${tKey || t}.${m}.${voice}.${p}`;
      emit(f, key, vdesc(t === 'futp' ? 'fut' : t, m, voice, p), reqFor(tKey || t, m, voice), { t: t === 'futp' ? 'fut' : t, m, v: voice, p, nu, encl: false });
    };
    const inf = (t, voice, tKey) => (f) => emit(f, `${tKey || t}.inf.${voice}`, `infinito ${TENSE_IT[t === 'futp' ? 'fut' : t]} ${VOICE_IT[voice]}`, reqFor(tKey || t, 'inf', voice), { t: t === 'futp' ? 'fut' : t, m: 'inf', v: voice });

    /* --- presente e imperfetto --- */
    const pres = v.pres;
    if (pres) {
      const c = ctype(pres);
      const o = {};
      const actOK = !dep;
      const mpVoice = 'mp';
      if (actOK) {
        run(pres, E.indA, PERS, fin('pres', 'ind', 'act'));
        run(pres, E.subjA, PERS, fin('pres', 'subj', 'act'));
        run(pres, c ? E.optAc : E.optA, PERS, fin('pres', 'opt', 'act'), { optLong: true });
        run(pres, E.impA, IMP_P, fin('pres', 'imp', 'act'));
        run(pres, ['ειν'], ['x'], inf('pres', 'act'), { spurious: !!c });
        participle3(pres, ['ων', 'οντος', 'ουσα', 'ον', 'ουσι(ν)'], 'pres', 'act');
      }
      if (!v.noMP) {
        run(pres, E.indM, PERS, fin('pres', 'ind', mpVoice));
        run(pres, E.subjM, PERS, fin('pres', 'subj', mpVoice));
        run(pres, E.optM, PERS, fin('pres', 'opt', mpVoice), { optLong: true });
        run(pres, E.impM, IMP_P, fin('pres', 'imp', mpVoice));
        run(pres, ['εσθαι'], ['x'], inf('pres', mpVoice));
        participleMenos(pres, 'ομενος', 'pres', mpVoice);
      }
      if (v.impf) {
        if (actOK) run(v.impf, E.impfA, PERS, fin('impf', 'ind', 'act'), { aug: true });
        if (!v.noMP) run(v.impf, E.impfM, PERS, fin('impf', 'ind', mpVoice), { aug: true });
      }
      if (v.impf2) {
        if (actOK) run(v.impf2, E.impfA, PERS, fin('impf', 'ind', 'act'), { aug: true });
        if (!v.noMP) run(v.impf2, E.impfM, PERS, fin('impf', 'ind', mpVoice), { aug: true });
      }
    }
    /* --- futuro --- */
    if (v.fut) {
      const c = ctype(v.fut);
      const actOK = !v.futM;
      if (actOK) {
        run(v.fut, E.indA, PERS, fin('fut', 'ind', 'act'));
        run(v.fut, c ? E.optAc : E.optA, PERS, fin('fut', 'opt', 'act'), { optLong: true });
        run(v.fut, ['ειν'], ['x'], inf('fut', 'act'), { spurious: !!c });
        participle3(v.fut, ['ων', 'οντος', 'ουσα', 'ον', 'ουσι(ν)'], 'fut', 'act');
      }
      if (v.futM || v.futMid) {
        run(v.fut, E.indM, PERS, fin('fut', 'ind', 'mid'));
        run(v.fut, E.optM, PERS, fin('fut', 'opt', 'mid'), { optLong: true });
        run(v.fut, ['εσθαι'], ['x'], inf('fut', 'mid'));
        participleMenos(v.fut, 'ομενος', 'fut', 'mid');
      }
    }
    /* --- aoristo primo --- */
    if (v.aor1) {
      const act = !v.aorM;
      if (act) {
        run(v.aor1a, E.a1A, PERS, fin('aor', 'ind', 'act'), { aug: true });
        run(v.aor1, E.subjA, PERS, fin('aor', 'subj', 'act'));
        run(v.aor1, E.a1optA, PERS, fin('aor', 'opt', 'act'), { optLong: true });
        run(v.aor1, E.a1impA, IMP_P, fin('aor', 'imp', 'act'));
        run(v.aor1, ['αι'], ['x'], inf('aor', 'act'), { fixedEnd: 2 });
        participle3(v.aor1, ['α_ς', 'αντος', 'α_σα', 'αν', 'α_σι(ν)'], 'aor', 'act');
      }
      if (v.aorM || v.aorMid) {
        run(v.aor1a, E.a1M, PERS, fin('aor', 'ind', 'mid'), { aug: true });
        run(v.aor1, E.subjM, PERS, fin('aor', 'subj', 'mid'));
        run(v.aor1, E.a1optM, PERS, fin('aor', 'opt', 'mid'), { optLong: true });
        run(v.aor1, E.a1impM, IMP_P, fin('aor', 'imp', 'mid'));
        run(v.aor1, ['ασθαι'], ['x'], inf('aor', 'mid'));
        participleMenos(v.aor1, 'αμενος', 'aor', 'mid');
      }
    }
    /* --- aoristo secondo --- */
    if (v.aor2) {
      const act = !v.aorM;
      if (act) {
        run(v.aor2a, E.impfA, PERS, fin('aor', 'ind', 'act'), { aug: true });
        run(v.aor2, E.subjA, PERS, fin('aor', 'subj', 'act'));
        run(v.aor2, E.optA, PERS, fin('aor', 'opt', 'act'), { optLong: true });
        run(v.aor2, v.ox ? ['έ*', 'ετω', 'ετε', 'οντων'] : E.impA, IMP_P, fin('aor', 'imp', 'act'));
        run(v.aor2, ['εῖν*'], ['x'], inf('aor', 'act'));
        participle3(v.aor2, ['ών*', 'όντος*', 'οῦσα*', 'όν*', 'οῦσι(ν)*'], 'aor', 'act');
      }
      if (v.aorM || v.aorMid) {
        run(v.aor2a, E.impfM, PERS, fin('aor', 'ind', 'mid'), { aug: true });
        run(v.aor2, E.subjM, PERS, fin('aor', 'subj', 'mid'));
        run(v.aor2, E.optM, PERS, fin('aor', 'opt', 'mid'), { optLong: true });
        run(v.aor2, E.a2impM, IMP_P, fin('aor', 'imp', 'mid'));
        run(v.aor2, ['έσθαι*'], ['x'], inf('aor', 'mid'));
        participleMenos(v.aor2, 'ομενος', 'aor', 'mid');
      }
    }
    /* --- aoristo passivo e futuro passivo --- */
    if (v.aorp) {
      const voice = dep === 'p' ? 'pass' : 'pass';
      const st = v.aorp;
      const theta = /θ$/.test(G.stripAccents(G.strip(st)));
      run(v.aorpa, E.pInd, PERS, fin('aor', 'ind', voice), { aug: true });
      run(st, E.pSubj, PERS, fin('aor', 'subj', voice));
      run(st, E.pOpt, PERS, fin('aor', 'opt', voice));
      run(st, theta ? E.pImp : ['ηθι', 'ητω', 'ητε', 'εντων'], IMP_P, fin('aor', 'imp', voice));
      run(st, ['ῆναι*'], ['x'], inf('aor', voice));
      participle3(st, ['είς*', 'έντος*', 'εῖσα*', 'έν*', 'εῖσι(ν)*'], 'aor', voice);
      if (!v.noFutP) {
        const fs = st + 'ησ';
        run(fs, E.indM, PERS, fin('futp', 'ind', voice));
        run(fs, E.optM, PERS, fin('futp', 'opt', voice), { optLong: true });
        run(fs, ['εσθαι'], ['x'], inf('futp', voice));
        participleMenos(fs, 'ομενος', 'futp', voice);
      }
    }
    /* --- perfetto --- */
    if (v.pf) {
      run(v.pf, E.pfA, PERS, fin('pf', 'ind', 'act'));
      run(v.pf, ['έναι*'], ['x'], inf('pf', 'act'));
      participle3(v.pf, ['ώς*', 'ότος*', 'υῖα*', 'ός*', 'όσι(ν)*'], 'pf', 'act');
    }
    if (v.pfm) {
      run(v.pfm, E.pfM, PERS, fin('pf', 'ind', 'mp'));
      run(v.pfm, ['σθαι'], ['x'], inf('pf', 'mp'), { fixedEnd: 2 });
      participleMenos(v.pfm, 'μένος*', 'pf', 'mp');
    }
    /* --- forme scritte per intero (irregolari) --- */
    if (v.x) explicitVerb(v, emit, reqFor, mode);
    return out;
  }
  // tabelle esplicite: "tempo.modo.diatesi(nota): f1 f2 f3 f4 f5 f6" ; imperativo 4 forme; infinito 1;
  // participio "m|gen|f|n|dpl" oppure il solo nominativo in -μενος; «!» = enclitica
  function explicitVerb(v, emit, reqFor, mode = 'all') {
    v.x.split('\n').map((l) => l.trim()).filter(Boolean).forEach((line) => {
      const i = line.indexOf(':');
      let key = line.slice(0, i).trim();
      const rest = line.slice(i + 1).trim();
      let note = '';
      const nm = key.match(/\(([^)]*)\)$/);
      if (nm) { note = ' (' + nm[1] + ')'; key = key.replace(/\(([^)]*)\)$/, ''); }
      const [t, m, voice] = key.split('.');
      const tt = t === 'futp' ? 'fut' : t;
      const cells = rest.replace(/!/g, '').split(/\s+/);
      if ((m === 'part') !== (mode === 'part') && mode !== 'all') return;
      if (m === 'inf') {
        cell(cells[0]).forEach((y) => emit(y.f, `${t}.inf.${voice}`, `infinito ${TENSE_IT[tt]} ${VOICE_IT[voice]}${note}`, reqFor(t, 'inf', voice), { t: tt, m: 'inf', v: voice }));
        return;
      }
      if (m === 'part') {
        const spec = rest.split('|').map((x) => x.trim());
        if (spec.length === 1) {
          for (const r of menosRows(G.nfc(spec[0]))) {
            emit(r.f, `${t}.part.${voice}.${r.g}.${r.c}.${r.n}`, `participio ${TENSE_IT[tt]} ${VOICE_IT[voice]}${note}, ${nominalDesc(r.c, r.n, r.g)}`, reqFor(t, 'part', voice, ['agg1']), { c: r.c, n: r.n, g: r.g, t: tt, m: 'part', v: voice });
          }
        } else explicitParticiple(v, spec, t, voice, emit, reqFor, note);
        return;
      }
      const persons = m === 'imp' ? IMP_P : PERS;
      const enclSet = new Set();
      rest.split(/\s+/).forEach((c, k) => { if (c.includes('!')) enclSet.add(k); });
      cells.forEach((c, k) => {
        cell(c).forEach((y) => emit(y.f, `${t}.${m}.${voice}.${persons[k]}`, vdesc(tt, m, voice, persons[k]) + note, reqFor(t, m, voice),
          { t: tt, m, v: voice, p: persons[k], nu: y.nu, encl: enclSet.has(k), alt: y.f === 'ἐστί' ? ['ἔστι', 'ἔστιν'] : null }));
      });
    });
  }
  // declinazione di un participio in -μενος dato il nominativo accentato
  function menosRows(masc) {
    const anchor = G.anchorOf(masc);
    const st = unacc(stemOf(masc, 2));
    const rows = [];
    const M = themeForms(st, anchor, D1['2']()[0], D1['2']()[1], {});
    const F = themeForms(st, anchor, ['η', 'ης', 'ῃ', 'ην', 'η'], ['αι', 'ων', 'αις', 'α_ς', 'αι'], {});
    const N = themeForms(st, anchor, D1['2n']()[0], D1['2n']()[1], {});
    [['m', M], ['f', F], ['n', N]].forEach(([g, T]) => {
      T.s.forEach((f, i) => rows.push({ f, g, c: CASES[i], n: 's' }));
      T.p.forEach((f, i) => rows.push({ f, g, c: CASES[i], n: 'p' }));
    });
    return rows;
  }
  function explicitParticiple(v, spec, t, voice, emit, reqFor, note = '') {
    // spec: masc nom (accentato), gen masc, fem nom, neut nom, dat pl
    const [mN, mG, fN, nN, dP] = spec.map((x) => G.nfc(x));
    const anchor = G.anchorOf(mN);
    const mstem = stemOf(mG, 2);
    const fst = stemOf(fN, 1);
    const pp = (s) => P(s, anchor);
    const rows = [];
    const add = (f, g, c, n, nu) => rows.push({ f, g, c, n, nu });
    for (const g of ['m', 'n']) {
      const nom = g === 'm' ? mN : nN;
      add(nom, g, 'nom', 's'); add(mG, g, 'gen', 's'); add(pp(mstem + 'ι'), g, 'dat', 's');
      add(g === 'm' ? pp(mstem + 'α') : nom, g, 'acc', 's'); add(nom, g, 'voc', 's');
      const np = g === 'm' ? pp(mstem + 'ες') : pp(mstem + 'α');
      add(np, g, 'nom', 'p'); add(pp(mstem + 'ων'), g, 'gen', 'p'); add(dP.replace('(ν)', ''), g, 'dat', 'p', true);
      add(g === 'm' ? pp(mstem + 'ας') : np, g, 'acc', 'p'); add(np, g, 'voc', 'p');
    }
    const pure = /ι$/.test(G.stripAccents(G.strip(fst)));
    (pure ? ['α', 'α_ς', 'ᾳ', 'αν', 'α'] : ['α', 'ης', 'ῃ', 'αν', 'α']).forEach((x, i) => add(i === 0 ? fN : pp(fst + x), 'f', CASES[i], 's'));
    ['αι', null, 'αις', 'α_ς', 'αι'].forEach((x, i) => add(x ? pp(fst + x) : FX(fst, 'ῶν'), 'f', CASES[i], 'p'));
    const tt = t === 'futp' ? 'fut' : t;
    for (const r of rows) emit(r.f, `${t}.part.${voice}.${r.g}.${r.c}.${r.n}`, `participio ${TENSE_IT[tt]} ${VOICE_IT[voice]}${note}, ${nominalDesc(r.c, r.n, r.g)}`, reqFor(t, 'part', voice, ['d3']), { c: r.c, n: r.n, g: r.g, nu: r.nu, t: tt, m: 'part', v: voice });
  }
  // paradigma (forme di citazione)
  function principalParts(e) {
    const get = (k) => { const f = e.forms.find((x) => x.key === k); return f ? f.f : null; };
    const pp = [];
    const p1 = get('pres.ind.act.1s') || get('pres.ind.mp.1s');
    if (p1) pp.push(p1);
    const f1 = get('fut.ind.act.1s') || get('fut.ind.mid.1s');
    if (f1) pp.push(f1);
    const a1 = get('aor.ind.act.1s') || get('aor.ind.mid.1s') || (e.v.dep === 'p' ? get('aor.ind.pass.1s') : null);
    if (a1) pp.push(a1);
    const pf = get('pf.ind.act.1s');
    if (pf) pp.push(pf);
    const pfm = get('pf.ind.mp.1s');
    if (pfm) pp.push(pfm);
    const ap = get('aor.ind.pass.1s');
    if (ap && e.v.dep !== 'p') pp.push(ap);
    return pp;
  }
  function addVerb(v) {
    v.ctype = v.pres && v.pres.endsWith('+') ? G.parse(v.pres.slice(0, -1)).filter((l) => !l.mark).slice(-1)[0].b : null;
    const lemma = G.nfc(v.v);
    const e = register({ k: 'v', lemma, m: v.m, v, topic: v.mi ? 'mi' : v.ctype ? 'contr' : (v.dep === 'm' ? 'mp' : 'pres') }, () => verbForms(v));
    let pp = null;
    // paradigma calcolato alla prima richiesta; i contratti si citano nella forma non contratta (τιμάω)
    Object.defineProperty(e, 'pp', { enumerable: true, get() {
      if (!pp) { pp = v.pp ? v.pp.split(',').map((x) => G.nfc(x.trim())) : principalParts(e); if (v.ctype && pp.length) pp[0] = lemma; }
      return pp;
    } });
    Object.defineProperty(e, 'head', { enumerable: true, get() { return e.pp.join(', '); } });
    return e;
  }

  /* ---------- Invariabili ---------- */
  // cat: cong | avv | prep | part | inter | neg ; case per preposizioni
  function addInv(word, m, topic, cat, extra = {}) {
    const forms = cell(word).map((y) => form(y.f, 'i.' + cat, extra.d || INV_IT[cat] || cat, [topic], {
      cat, encl: !!extra.encl, procl: !!extra.procl, nu: y.nu, alt: extra.alt ? extra.alt.split('/').map(G.nfc) : null, noGrave: !!extra.noGrave, post: !!extra.post,
    }));
    return register({ k: 'i', lemma: forms[0].f, head: word.replace(/\(ν\)/g, '(ν)'), m, topic, cat, forms, cases: extra.cases || null, encl: !!extra.encl, procl: !!extra.procl, post: !!extra.post });
  }
  const INV_IT = { cong: 'congiunzione', avv: 'avverbio', prep: 'preposizione', part: 'particella', inter: 'interiezione', neg: 'negazione', int: 'avverbio interrogativo' };

  /* ---------- Caricamento del lessico ---------- */
  // i primi quattro campi sono separati da «|»; il quinto (opzioni) può contenere «|» nelle tabelle
  function splitLine(t) { const p = t.split('|').map((x) => x.trim()); return [...p.slice(0, 4), p.slice(4).join('|')]; }
  function loadLexicon(L) {
    buildArticle();
    for (const line of L.NOUNS.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      addNoun(splitLine(t));
    }
    for (const line of L.ADJS.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      addAdj(splitLine(t));
    }
    for (const p of L.PRONOUNS) addPron(p.id, p.head, p.m, p.topic, p.spec, { encl: p.encl ? (f) => p.encl.split(' ').includes(f) || p.encl === '*' : null, noGrave: p.noGrave });
    for (const v of L.VERBS) addVerb(v);
    for (const i of L.INV) addInv(i[0], i[1], i[2], i[3], i[4] || {});
  }

  /* ---------- Analisi ---------- */
  function analyze(word) {
    if (pending) warm();
    const w = G.nfc(String(word).replace(/[^\p{L}\p{M}’]/gu, ''));
    if (!w) return [];
    let r = STRICT.get(G.strict(w));
    if (r && r.length) return r;
    // doppio accento davanti a enclitica: togli l'acuto sull'ultima
    const L = G.parse(w);
    const N = G.nuclei(L);
    const acc = N.filter((n) => L[n.j].ac || L[n.i].ac);
    if (acc.length === 2) {
      const last = acc[1];
      L[last.j].ac = ''; L[last.i].ac = '';
      r = STRICT.get(G.strict(G.serialize(L)));
      if (r && r.length) return r;
    }
    // forma di citazione non presente fra le flesse (τιμάω, ὁράω)
    const k = G.strict(w);
    const lem = LEX.filter((e) => G.strict(e.lemma) === k);
    if (lem.length) return lem.map((e) => ({ e, f: e.lemma, key: 'lemma', d: 'forma di citazione', req: [e.topic], cit: true }));
    return [];
  }
  function analyzeLoose(word) {
    if (pending) warm();
    return BARE.get(G.bare(word)) || [];
  }
  function reqOK(word, tags) {
    const an = analyze(word);
    if (!an.length) return { known: false, ok: false };
    return { known: true, ok: an.some((a) => a.req.every((t) => tags.has(t))) };
  }
  function entryForms(e, tags) { return e.forms.filter((x) => !tags || x.req.every((t) => tags.has(t))); }
  function find(lemma, k) { const n = G.nfc(lemma); return LEX.find((e) => (e.lemma === n || e.head === n) && (!k || e.k === k)); }
  function formOf(e, key) { const f = e && e.forms.find((x) => x.key === key); return f || null; }

  root.HermEngine = {
    G, LEX, STRICT, BARE, loadLexicon, warm, isReady, analyze, analyzeLoose, reqOK, entryForms, find, formOf,
    CASES, CASE_IT, NUM_IT, GEN_IT, PERS, PERS_IT, TENSE_IT, MOOD_IT, VOICE_IT,
    _internal: { nounType, dpl3, adj1Forms, adjOnForms, stemOf, cut, lettersStr },
  };
  if (typeof module !== 'undefined') module.exports = root.HermEngine;
})(typeof window !== 'undefined' ? window : globalThis);
