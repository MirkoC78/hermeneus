/* HERMENEUS — motore delle lezioni: costruisce gli esercizi di ogni lezione dentro il suo perimetro
   (argomenti sbloccati, vocabolario già incontrato, forme ammesse). Nessun accesso al DOM: si usa anche nei test. */
(function (root) {
  'use strict';
  const E = root.HermEngine || require('./morph.js');
  const SN = root.HermSentence || require('./sentence.js');
  const GN = root.HermGen || require('./generator.js');
  const C = root.HERM_COURSE || require('./course.js');
  const G = E.G;
  const ORDER = SN.ORDER;

  let rand = Math.random;
  const rnd = (n) => Math.floor(rand() * n);
  const pick = (a) => a[rnd(a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = (a) => [...new Set(a)];

  /* ---------- Struttura del percorso ---------- */
  const FLAT = [];
  C.UNITS.forEach((u, ui) => u.lessons.forEach((l, li) => FLAT.push({ unit: u, lesson: l, ui, li, idx: FLAT.length })));
  const BY_ID = Object.fromEntries(FLAT.map((x) => [x.lesson.id, x]));
  const UNIT_BY_ID = Object.fromEntries(C.UNITS.map((u, i) => [u.id, Object.assign({ i }, u)]));
  const entryOf = (lemma) => { const n = G.nfc(lemma); return E.LEX.find((e) => e.lemma === n && e.k !== 'art') || null; };

  // argomenti fino all'unità della lezione (compresa)
  function topicsUpTo(lessonId) {
    const x = BY_ID[lessonId];
    return new Set(C.UNITS.slice(0, x.ui + 1).map((u) => u.id));
  }
  // vocabolario incontrato fino alla lezione (compresa)
  function vocabUpTo(lessonId) {
    const x = BY_ID[lessonId];
    const v = new Set();
    for (const f of FLAT.slice(0, x.idx + 1)) for (const l of f.lesson.lemmas || []) v.add(G.nfc(l));
    return v;
  }
  // vocabolario dei soli argomenti scelti (pratica libera)
  function vocabForTopics(T) {
    const v = new Set();
    for (const f of FLAT) if (T.has(f.unit.id)) for (const l of f.lesson.lemmas || []) v.add(G.nfc(l));
    return v;
  }
  // parole «di servizio» sempre note se il loro argomento è sbloccato
  function known(e, T, vocab) {
    if (!e) return false;
    if (e.k === 'art' || e.k === 'i' || e.k === 'p') return T.has(e.topic);
    if (e.lemma === 'εἰμί') return T.has('pres');
    return !vocab || vocab.has(e.lemma);
  }

  /* ---------- Frasi ---------- */
  let BANK = [], tokensOf = (s) => s.tokens;
  function init(o) { BANK = o.bank || BANK; if (o.tokensOf) tokensOf = o.tokensOf; if (o.rand) { rand = o.rand; GN.seed(o.rand); } }
  // la frase rientra nel perimetro? restituisce le parole nuove
  function sentenceFits(s, T, vocab, maxNew = 1) {
    if (!s.tags.every((t) => T.has(t))) return null;
    const toks = tokensOf(s);
    const unknown = uniq(toks.filter((t) => t && t.a && !known(t.a.e, T, vocab)).map((t) => t.a.e.lemma));
    if (unknown.length > maxNew) return null;
    return { unknown };
  }
  function pickSentence(sc, avoid) {
    const { T, vocab, focus } = sc;
    const cands = [];
    for (const s of BANK) {
      if (avoid.has(s.id)) continue;
      const fit = sentenceFits(s, T, vocab, sc.maxNew ?? 1);
      if (fit) cands.push({ s, w: (s.tags.includes(focus) ? 4 : 1) + (fit.unknown.length ? 0 : 1), unknown: fit.unknown });
    }
    const useGen = sc.gen !== false && (!cands.length || rand() < (sc.genShare ?? 0.5));
    if (useGen) {
      for (let k = 0; k < 3; k++) {
        const g = GN.generate([...T], focus, { lex: vocab || null, tenses: sc.tenses, simple: sc.simple, phrase: !T.has('pres') });
        if (g && !avoid.has(g.id)) { g.tokens = g.tokens.filter(Boolean); return { s: g, unknown: [] }; }
      }
    }
    if (!cands.length) return null;
    const tot = cands.reduce((a, c) => a + c.w, 0);
    let r = rand() * tot;
    for (const c of cands) { r -= c.w; if (r <= 0) return c; }
    return cands[cands.length - 1];
  }

  /* ---------- Esercizi sulle forme ---------- */
  function scopeEntries(sc, kinds) {
    let ents = (sc.lemmas || []).map(entryOf).filter((e) => e && kinds.includes(e.k));
    if (!ents.length && sc.keys) {
      // forme senza lemmi nuovi (es. «il presente medio-passivo»): parole note di quel tipo
      ents = E.LEX.filter((e) => kinds.includes(e.k) && sc.T.has(e.topic) && (!sc.vocab || known(e, sc.T, sc.vocab)) && e.k !== 'i');
    }
    if (!ents.length) ents = E.LEX.filter((e) => kinds.includes(e.k) && e.topic === sc.focus);
    return ents;
  }
  function formsIn(e, sc, noVoc) {
    return e.forms.filter((f) => f.key !== 'lemma' && f.req.every((q) => sc.T.has(q)) && (!sc.keys || sc.keys.test(f.key)) && !(noVoc && f.c === 'voc'));
  }
  // fra più analisi della stessa forma si propone la più naturale (il nominativo prima del vocativo)
  const PREF = ['nominativo', 'accusativo', 'genitivo', 'dativo', 'vocativo'];
  const prefRank = (d) => { const i = PREF.findIndex((p) => d.includes(p)); return i < 0 ? 0 : i; };
  // tipo di parole adatto alle forme ammesse dalla lezione (articolo, aggettivi, pronomi, nomi, verbi)
  function KIND_FOR_FOCUS(sc) {
    const s = sc.keys ? sc.keys.source.replace(/^\^/, '').replace(/\\/g, '') : '';
    if (s.startsWith('art')) return ['art'];
    if (s.startsWith('a.')) return ['a'];
    if (s.startsWith('p.')) return ['p'];
    if (s.startsWith('n.')) return ['n'];
    if (/^(\(?pres|impf|fut|aor|pf|\(aor|\(pres|\.part|\.inf|\.\()/.test(s)) return ['v'];
    return ['n', 'a', 'v', 'p'];
  }
  function buildAnalizza(sc) {
    const ents = scopeEntries(sc, KIND_FOR_FOCUS(sc)).filter((e) => e.k !== 'i');
    for (let k = 0; k < 30; k++) {
      const e = pick(ents);
      if (!e) return null;
      const forms = formsIn(e, sc);
      if (forms.length < 2) continue;
      const f = pick(forms.filter((x) => x.c !== 'voc').length ? forms.filter((x) => x.c !== 'voc') : forms);
      const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));
      // risposta proposta: la lettura più naturale fra quelle dentro il perimetro della lezione
      const best = uniq(forms.filter((x) => x.f === f.f).map((x) => x.d)).sort((a, b) => prefRank(a) - prefRank(b))[0] || f.d;
      let pool = uniq(forms.map((x) => x.d).filter((d) => !valid.includes(d)));
      if (pool.length < 3) pool = uniq(pool.concat(e.forms.filter((x) => x.req.every((q) => sc.T.has(q))).map((x) => x.d).filter((d) => !valid.includes(d))));
      const dis = shuffle(pool).slice(0, 3);
      if (dis.length < 2) continue;
      return { type: 'analizza', e, form: f.f, correct: best, valid, options: shuffle([best, ...dis]), topic: focusOfReq(f.req), key: f.key };
    }
    return null;
  }
  function buildScrivi(sc) {
    const ents = scopeEntries(sc, KIND_FOR_FOCUS(sc)).filter((e) => e.k !== 'i');
    for (let k = 0; k < 30; k++) {
      const e = pick(ents);
      if (!e) return null;
      const forms = formsIn(e, sc, true).filter((f) => f.f !== e.lemma);
      if (!forms.length) continue;
      const f = pick(forms);
      return { type: 'scrivi', e, desc: f.d, answers: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.f)), nu: f.nu, topic: focusOfReq(f.req), key: f.key };
    }
    return null;
  }
  // concordanza: articolo + nome (o articolo + aggettivo + nome)
  function buildAccorda(sc) {
    const art = E.LEX.find((e) => e.k === 'art');
    const adjs = scopeEntries(sc, ['a']).filter((e) => (sc.lemmas || []).map(G.nfc).includes(e.lemma));
    const own = (sc.lemmas || []).map(entryOf).filter((e) => e && e.k === 'n');
    const nouns = own.length ? own : E.LEX.filter((e) => e.k === 'n' && sc.T.has(e.topic) && known(e, sc.T, sc.vocab) && !(e.fl && e.fl.prop));
    for (let k = 0; k < 30; k++) {
      const n = pick(nouns.filter((e) => !(e.fl && e.fl.prop)));
      if (!n) return null;
      const nf = pick(formsIn(n, Object.assign({}, sc, { keys: adjs.length ? null : sc.keys })).filter((f) => f.c !== 'voc'));
      if (!nf) continue;
      const g = nf.g || n.g.split('/')[0];
      if (adjs.length) {
        const a = pick(adjs);
        const right = a.forms.find((f) => f.key === `a.pos.${g}.${nf.c}.${nf.n}`);
        if (!right) continue;
        const dis = shuffle(uniq(a.forms.filter((f) => f.key.startsWith('a.pos.') && f.c !== 'voc' && f.f !== right.f).map((f) => f.f))).slice(0, 3);
        const af = art.forms.find((f) => f.key === `art.${g}.${nf.c}.${nf.n}`);
        if (dis.length < 3 || !af) continue;
        return { type: 'accorda', mode: 'adj', noun: nf, art: af.f, e: a, answer: right.f, options: shuffle([right.f, ...dis]), topic: 'agg1' };
      }
      const af = art.forms.find((f) => f.key === `art.${g}.${nf.c}.${nf.n}`);
      if (!af) continue;
      const dis = shuffle(uniq(art.forms.filter((f) => f.f !== af.f).map((f) => f.f))).slice(0, 3);
      return { type: 'accorda', mode: 'art', noun: nf, e: n, answer: af.f, options: shuffle([af.f, ...dis]), topic: n.topic };
    }
    return null;
  }
  const shortM = (m) => m.split(/[,;(]/)[0].trim();
  function buildAbbina(sc) {
    let pool = (sc.lemmas || []).map(entryOf).filter((e) => e && ['n', 'a', 'v', 'p', 'i'].includes(e.k));
    const extra = sc.vocab ? [...sc.vocab].map(entryOf).filter((e) => e && ['n', 'a', 'v'].includes(e.k)) : [];
    pool = uniq(pool.concat(shuffle(extra))).filter((e) => !(e.fl && e.fl.prop));
    const chosen = [];
    const seenM = new Set();
    for (const e of pool) { const m = shortM(e.m); if (seenM.has(m)) continue; seenM.add(m); chosen.push(e); if (chosen.length >= 5) break; }
    if (chosen.length < 3) return null;
    return { type: 'abbina', pairs: chosen.map((e) => ({ e, gr: e.k === 'v' ? e.lemma : (e.head ? e.head.split(',')[0] : e.lemma), it: shortM(e.m) })), topic: sc.focus };
  }
  function buildLessico(sc, reverse) {
    const pool = uniq(((sc.lemmas || []).map(entryOf).filter(Boolean)).concat(sc.vocab ? [...sc.vocab].map(entryOf).filter(Boolean) : [])).filter((e) => ['n', 'v', 'a'].includes(e.k));
    if (pool.length < 4) return null;
    const e = pick(pool.slice(0, Math.max(4, (sc.lemmas || []).length)));
    const others = shuffle(pool.filter((x) => x !== e && shortM(x.m) !== shortM(e.m))).slice(0, 3);
    if (others.length < 3) return null;
    return { type: 'lessico', e, reverse: !!reverse, options: shuffle([e, ...others]), topic: e.topic };
  }
  function buildCompleta(s, sc) {
    const toks = tokensOf(s);
    const cand = toks.map((t, i) => ({ t, i })).filter(({ t }) => t && t.a && ['n', 'v', 'a', 'p'].includes(t.a.e.k) && t.a.key !== 'lemma');
    for (const { t, i } of shuffle(cand)) {
      const others = shuffle(uniq(t.a.e.forms.filter((x) => x.req.every((q) => sc.T.has(q)) && x.key !== 'lemma').map((x) => x.f).filter((f) => G.strict(f) !== G.strict(t.a.f)))).slice(0, 3);
      if (others.length < 3) continue;
      return { type: 'completa', s, idx: i, answer: t.a.f, options: shuffle([t.a.f, ...others]), topic: s.focus };
    }
    return null;
  }

  /* ---------- Alfabeto e accenti ---------- */
  const LETTERS = [['α', 'alfa', 'a'], ['β', 'beta', 'b'], ['γ', 'gamma', 'g'], ['δ', 'delta', 'd'], ['ε', 'epsilon', 'e'], ['ζ', 'zeta', 'z'], ['η', 'eta', 'ē'], ['θ', 'theta', 'th'], ['ι', 'iota', 'i'], ['κ', 'kappa', 'k'], ['λ', 'lambda', 'l'], ['μ', 'my', 'm'], ['ν', 'ny', 'n'], ['ξ', 'xi', 'x'], ['ο', 'omicron', 'o'], ['π', 'pi', 'p'], ['ρ', 'rho', 'r'], ['σ', 'sigma', 's'], ['ς', 'sigma finale', 's'], ['τ', 'tau', 't'], ['υ', 'ypsilon', 'y'], ['φ', 'phi', 'ph'], ['χ', 'chi', 'ch'], ['ψ', 'psi', 'ps'], ['ω', 'omega', 'ō']];
  function buildLettera(sc) {
    const set = LETTERS.filter((l) => !sc.letters || sc.letters.includes(l[0]));
    const all = LETTERS.filter((l) => !sc.lettersSeen || sc.lettersSeen.includes(l[0]));
    const L = pick(set);
    const reverse = rand() < 0.4;
    const others = shuffle(all.filter((x) => x[1] !== L[1] && x[0] !== L[0])).slice(0, 3);
    if (reverse) return { type: 'lettera', reverse: true, prompt: L[1], right: L[0], options: shuffle([L[0], ...others.map((o) => o[0])]), topic: 'alf' };
    const up = L[0] === 'ς' ? 'ς' : L[0].toUpperCase() + ' ' + L[0];
    return { type: 'lettera', prompt: up, right: L[1], options: shuffle([L[1], ...others.map((o) => o[1])]), topic: 'alf' };
  }
  const CLASSES = ['ossitona', 'parossitona', 'proparossitona', 'perispomena', 'properispomena'];
  function buildAccento(sc) {
    const pool = E.LEX.filter((e) => ['n', 'a', 'v'].includes(e.k) && (sc.T.has(e.topic) || sc.T.size < 3) && !(e.fl && e.fl.prop));
    const e = pick(pool);
    const f = pick(e.forms.filter((x) => x.req.every((q) => sc.T.has(q) || sc.T.size < 3)).concat([{ f: e.lemma }]));
    const w = f.f;
    const cls = G.accentClass(w);
    if (!CLASSES.includes(cls)) return null;
    return { type: 'accento', word: w, right: cls, options: shuffle([cls, ...shuffle(CLASSES.filter((c) => c !== cls)).slice(0, 3)]), topic: 'alf' };
  }
  function buildAlfabeto(sc) {
    const pool = E.LEX.filter((e) => ['n', 'v', 'a'].includes(e.k) && G.syllables(e.lemma) <= 4 && (!sc.vocab || sc.vocab.size < 6 || sc.vocab.has(e.lemma) || rand() < 0.3));
    const e = pick(pool);
    const word = e.lemma;
    const right = G.translit(word);
    const swaps = [['ē', 'e'], ['ō', 'o'], ['ph', 'p'], ['ch', 'k'], ['th', 't'], ['y', 'u'], ['h', ''], ['x', 'ks'], ['ps', 'p']];
    const dis = new Set();
    for (const [a, b] of shuffle(swaps)) { if (right.includes(a)) dis.add(right.replace(a, b)); if (dis.size >= 2) break; }
    while (dis.size < 3) dis.add(G.translit(pick(pool).lemma));
    dis.delete(right);
    return { type: 'alfabeto', e, word, right, options: shuffle([right, ...[...dis].slice(0, 3)]), topic: 'alf' };
  }
  function focusOfReq(req) { return req.slice().sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0]; }

  /* ---------- Schede di spiegazione con domanda di controllo ---------- */
  function quizFor(card, sc) {
    let e = null, keys = null;
    if (card.decl) { e = entryOf(pick(card.decl)); keys = card.num ? new RegExp('^n\\.\\w+\\.' + card.num + '$') : /^n\./; }
    else if (card.conj) { const [l, k] = pick(card.conj); e = entryOf(l); keys = new RegExp('^' + k.replace(/\./g, '\\.') + '\\.'); }
    else if (card.adj) { e = entryOf(card.adj); keys = /^a\.pos\./; }
    else if (card.pron) { e = E.LEX.find((x) => x.k === 'p' && x.lemma === G.nfc(card.pron)); keys = /^p\./; }
    else if (card.art) { e = E.LEX.find((x) => x.k === 'art'); keys = /^art\./; }
    if (!e) return null;
    const forms = e.forms.filter((f) => keys.test(f.key) && f.key !== 'lemma');
    if (forms.length < 3) return null;
    const f = pick(forms);
    const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));
    const dis = shuffle(uniq(forms.map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 2);
    if (dis.length < 2) return null;
    return { type: 'analizza', quiz: true, e, form: f.f, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: sc.focus, key: f.key };
  }

  /* ---------- Costruzione della lezione ---------- */
  function scopeOf(lessonId) {
    const x = BY_ID[lessonId];
    const l = x.lesson;
    const T = topicsUpTo(lessonId);
    const vocab = vocabUpTo(lessonId);
    const lettersSeen = FLAT.slice(0, x.idx + 1).map((f) => f.lesson.letters || '').join('');
    return {
      T, vocab, focus: x.unit.id, lemmas: l.lemmas || null, keys: l.keys ? new RegExp(l.keys) : null, tenses: l.tenses || null,
      letters: l.letters || null, lettersSeen: lettersSeen || null, simple: x.li < 2, genShare: l.test ? 0.5 : 0.55, maxNew: l.test ? 0 : 1,
    };
  }
  function makeItem(type, sc, used) {
    switch (type) {
      case 'analizza': return buildAnalizza(sc);
      case 'scrivi': return buildScrivi(sc);
      case 'accorda': return buildAccorda(sc);
      case 'abbina': return buildAbbina(sc);
      case 'lessico': return buildLessico(sc, rand() < 0.4);
      case 'lettera': return buildLettera(sc);
      case 'accento': return buildAccento(sc);
      case 'alfabeto': return buildAlfabeto(sc);
      case 'frase': case 'gr_it': case 'it_gr': case 'completa': {
        const p = pickSentence(sc, used);
        if (!p) return null;
        used.add(p.s.id);
        const t = type === 'frase' ? (rand() < 0.55 ? 'gr_it' : rand() < 0.75 ? 'it_gr' : 'completa') : type;
        if (t === 'completa') return buildCompleta(p.s, sc) || { type: 'gr_it', s: p.s, topic: p.s.focus, newWords: p.unknown };
        return { type: t, s: p.s, topic: p.s.focus, newWords: p.unknown };
      }
      default: return null;
    }
  }
  function fallbackItem(sc, used) {
    for (const t of ['analizza', 'abbina', 'lessico', 'frase', 'alfabeto']) { const it = makeItem(t, sc, used); if (it) return it; }
    return null;
  }
  // items della lezione; o.teach = includi le schede di spiegazione
  function buildLesson(lessonId, o = {}) {
    const x = BY_ID[lessonId];
    const l = x.lesson;
    const sc = Object.assign(scopeOf(lessonId), o.scope || {});
    const items = [];
    const used = new Set(o.avoid || []);
    if (o.teach !== false && l.teach) {
      for (const card of l.teach) {
        items.push({ type: 'teach', card, topic: x.unit.id });
        if (card.decl || card.conj || card.adj || card.pron || card.art) { const q = quizFor(card, sc); if (q) items.push(q); }
      }
    }
    const mix = (l.mix || ['analizza', 'frase']).slice(0, o.teach !== false && l.teach ? 8 : 12);
    for (const t of mix) {
      const it = makeItem(t, sc, used) || fallbackItem(sc, used);
      if (it) { it.lesson = lessonId; items.push(it); }
    }
    return items;
  }
  // pratica libera selettiva: argomenti, vocabolario e tipo di esercizi
  function buildPractice(o) {
    const T = o.T;
    const vocab = o.wide ? null : vocabForTopics(T);
    const focus = o.focus || [...T].sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0];
    const unit = UNIT_BY_ID[focus];
    const sc = { T, vocab, focus, lemmas: null, keys: null, genShare: o.genShare ?? 0.5, maxNew: o.wide ? 3 : 1, gen: o.gen !== false };
    const mix = o.mix || ['frase', 'analizza', 'frase', 'abbina', 'frase', 'scrivi', 'frase', 'completa', 'frase', 'analizza'];
    const used = new Set(o.avoid || []);
    const items = [];
    for (const t of mix) {
      // per le forme si sceglie una lezione a caso dell'unità di focus, così il perimetro resta preciso
      let s2 = sc;
      if (unit && ['analizza', 'scrivi', 'accorda', 'abbina'].includes(t)) {
        const ls = unit.lessons.filter((l) => !l.test && (l.lemmas || l.keys));
        const L = ls.length ? pick(ls) : null;
        if (L) s2 = Object.assign({}, sc, { lemmas: L.lemmas || null, keys: L.keys ? new RegExp(L.keys) : null });
      }
      const it = makeItem(t, s2, used) || fallbackItem(sc, used);
      if (it) items.push(it);
    }
    return items;
  }

  root.HermLessons = { FLAT, BY_ID, UNIT_BY_ID, init, topicsUpTo, vocabUpTo, vocabForTopics, sentenceFits, buildLesson, buildPractice, scopeOf, entryOf, LETTERS, known };
  if (typeof module !== 'undefined') module.exports = root.HermLessons;
})(typeof window !== 'undefined' ? window : globalThis);
