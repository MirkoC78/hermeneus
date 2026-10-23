/* HERMENEUS — la frase greca: accenti nel contesto, analisi delle parole, ordine delle parole.
   Le forme del lessico sono «di citazione» (ossitone con l'acuto, enclitiche accentate come nei manuali);
   render() applica le regole della frase: grave, enclitiche e proclitiche, ν efelcistico, οὐ/οὐκ/οὐχ, ἐκ/ἐξ, οὕτω/οὕτως. */
(function (root) {
  'use strict';
  const E = root.HermEngine || require('./morph.js');
  const G = E.G;

  const PUNCT = /^[,.;·:!?]$/;
  // dopo queste parole ἐστί diventa ἔστι (Smyth 187)
  const ESTI_AFTER = new Set(['οὐκ', 'μή', 'εἰ', 'ὡς', 'καί', 'ἀλλά', 'τοῦτο'].map((x) => G.strict(x)));

  function isPunct(t) { return t && t.p; }
  function flagsOf(a) {
    if (!a) return {};
    return { encl: !!a.encl, procl: !!a.procl, nu: !!a.nu, noGrave: !!a.noGrave, lemma: a.e ? a.e.lemma : '', post: !!(a.post || (a.e && a.e.post)) };
  }
  // token: { f: forma di citazione, a: analisi } oppure { p: ',' }
  function tok(a, f) { return Object.assign({ f: f || a.f, a }, flagsOf(a)); }

  /* ---------- Resa della frase ---------- */
  function render(tokens, o = {}) {
    const T = tokens.map((t) => Object.assign({}, t));
    const words = T.map((t) => (t.p ? null : t.f));
    const nextWord = (i) => { const n = T[i + 1]; return n && !n.p ? n : null; };
    // 1. varianti fonetiche che dipendono dall'iniziale della parola seguente
    for (let i = 0; i < T.length; i++) {
      const t = T[i];
      if (t.p) continue;
      const n = nextWord(i);
      const nv = n ? G.startsWithVowel(n.f) : false;
      const lem = t.lemma;
      if (lem === 'οὐ') {
        if (!n) t.out = 'οὔ';
        else if (nv) t.out = G.initialBreathing(n.f) === 'r' ? 'οὐχ' : 'οὐκ';
        else t.out = 'οὐ';
      } else if (lem === 'ἐκ') t.out = nv ? 'ἐξ' : 'ἐκ';
      else if (lem === 'οὕτως') t.out = nv || !n ? 'οὕτως' : 'οὕτω';
      else t.out = t.f + (t.nu && (!n || nv) ? 'ν' : '');
    }
    // 2. enclitiche
    for (let i = 0; i < T.length; i++) {
      const t = T[i];
      if (t.p || !t.encl) continue;
      const prev = i > 0 && !T[i - 1].p ? T[i - 1] : null;
      const isEsti = G.strict(t.f) === G.strict('ἐστί');
      if (isEsti && (!prev || ESTI_AFTER.has(G.strict(prev.out || prev.f)))) {
        t.out = (t.nu && t.out.endsWith('ν') ? 'ἔστιν' : 'ἔστι');
        t.encl = false; // ἔστι accentata si comporta come parola autonoma
        continue;
      }
      if (!prev) continue; // in principio di frase o dopo la punteggiatura conserva l'accento
      const cls = prev.encl && prev.enclDone ? 'enclitica' : G.accentClass(prev.out);
      const syl = G.syllables(t.f);
      let keep = false;
      if (cls === 'atona') prev.out = G.addUltimaAcute(prev.out);
      else if (cls === 'proparossitona' || cls === 'properispomena') prev.out = G.addUltimaAcute(prev.out);
      else if (cls === 'parossitona' && syl === 2) keep = true;
      else if (cls === 'enclitica') prev.out = G.addUltimaAcute(prev.out);
      if (!keep) t.out = G.stripAccents(t.out);
      t.enclDone = true;
    }
    // 3. grave sulle ossitone non seguite da punteggiatura o da enclitica
    for (let i = 0; i < T.length; i++) {
      const t = T[i];
      if (t.p || t.noGrave) continue;
      const n = T[i + 1];
      if (!n || n.p) continue;
      if (n.encl && n.enclDone) continue;
      const L = G.parse(t.out);
      const acc = G.accentInfo(L);
      if (acc.pos === 0 && acc.type === 'a') t.out = G.toGrave(t.out);
    }
    if (o.words) return T.map((t) => (t.p ? t.p : t.out));
    let s = '';
    T.forEach((t, i) => {
      if (t.p) s += t.p;
      else s += (s && !/\s$/.test(s) ? ' ' : '') + t.out;
    });
    s = s.replace(/\s+([,.;·:])/g, '$1');
    if (o.cap !== false) s = capFirst(s);
    return G.nfc(s);
  }
  function capFirst(s) {
    const L = G.parse(s);
    const i = L.findIndex((l) => !l.mark && /[α-ω]/.test(l.b));
    if (i < 0) return s;
    L[i].up = true;
    return G.serialize(L);
  }

  /* ---------- Analisi di una frase scritta ---------- */
  function splitWords(s) {
    return G.nfc(s).replace(/[«»“”"()]/g, ' ').replace(/([,.;·:!?])/g, ' $1 ').split(/\s+/).filter(Boolean);
  }
  // per ogni parola: le analisi possibili (forma di citazione + bandierine)
  function analyzeSentence(s) {
    return splitWords(s).map((w) => {
      if (PUNCT.test(w)) return { p: w };
      let an = E.analyze(w);
      if (!an.length) an = E.analyze(w.toLowerCase());
      if (!an.length && /ν$/.test(w)) an = E.analyze(w.slice(0, -1)).filter((a) => a.nu);
      return { w, an };
    });
  }
  // ricostruisce i token di citazione cercando una combinazione che, resa, riproduca la frase
  function lexicalize(s) {
    const A = analyzeSentence(s);
    // confronto esatto: anche grave e acuto devono coincidere (dieresi e quantità ignorate)
    const exact = (x) => G.nfc(x).normalize('NFD').replace(/[\u0308\u0304\u0306]/g, '').toLowerCase().replace(/ς/g, 'σ');
    const target = exact(G.nfc(s).replace(/\s+/g, ' ').trim());
    const opts = A.map((x) => {
      if (x.p) return [{ p: x.p }];
      const seen = new Map();
      for (const a of x.an) {
        const k = a.f + '|' + !!a.encl + !!a.procl + !!a.nu + (a.e && a.e.lemma);
        if (!seen.has(k)) seen.set(k, tok(a));
      }
      return [...seen.values()];
    });
    const unknown = A.filter((x) => !x.p && !x.an.length).map((x) => x.w);
    if (unknown.length) return { ok: false, unknown, tokens: null };
    let found = null, tries = 0;
    const cur = [];
    (function dfs(i) {
      if (found || tries > 4096) return;
      if (i === opts.length) {
        tries++;
        const r = exact(render(cur, { cap: false }));
        if (r === target) found = cur.slice();
        return;
      }
      for (const c of opts[i]) { cur.push(c); dfs(i + 1); cur.pop(); if (found) return; }
    })(0);
    if (found) return { ok: true, tokens: found };
    // nessuna combinazione riproduce gli accenti: restituisce la resa «corretta» con la prima analisi
    const first = opts.map((o) => o[0]);
    return { ok: false, tokens: first, expected: render(first) };
  }

  /* ---------- Gruppi di parole (ordine libero tra gruppi) ---------- */
  const POST = new Set(['μέν', 'δέ', 'γάρ', 'οὖν', 'γε', 'τε', 'δή'].map((x) => G.strict(x)));
  const FIRST_CATS = new Set(['cong', 'int']);
  const kindOf = (t) => {
    const a = t.a; if (!a) return 'x';
    const e = a.e;
    if (e.k === 'art') return 'art';
    if (e.k === 'i') return e.cat === 'prep' ? 'prep' : e.cat === 'neg' ? 'neg' : e.cat === 'inter' ? 'voc' : 'inv';
    if (e.k === 'n') return 'n';
    if (e.k === 'p') return 'p';
    if (e.k === 'a') return 'adj';
    if (e.k === 'v') return a.m === 'part' ? 'part' : a.m === 'inf' ? 'inf' : 'v';
    return 'x';
  };
  const isHead = (k) => k === 'n' || k === 'p' || k === 'inf' || k === 'part';
  // gruppo che comincia in i: articolo + attributi + testa; preposizione + gruppo; negazione + parola
  function groupEnd(T, i) {
    const k = kindOf(T[i]);
    if (k === 'art') {
      let j = i + 1;
      while (j < T.length) {
        const kj = kindOf(T[j]);
        if (POST.has(G.strict(T[j].f))) { j++; continue; }
        if (kj === 'art' || kj === 'prep') { j = groupEnd(T, j); continue; }
        if (kj === 'adj' || kj === 'part' && !isHeadAfter(T, j)) { j++; if (j < T.length && isHead(kindOf(T[j]))) return j + 1; if (kj === 'part') return j; continue; }
        if (isHead(kj)) return j + 1;
        return j;
      }
      return j;
    }
    if (k === 'prep' || k === 'neg' || k === 'voc') {
      if (i + 1 >= T.length) return i + 1;
      return groupEnd(T, i + 1);
    }
    if (k === 'adj') {
      // aggettivo + nome concordato senza articolo
      if (i + 1 < T.length && kindOf(T[i + 1]) === 'n') return i + 2;
    }
    return i + 1;
  }
  function isHeadAfter(T, j) { return j + 1 < T.length && isHead(kindOf(T[j + 1])); }
  // divide una lista di token (senza punteggiatura) in proposizioni e gruppi
  function structure(tokens) {
    const clauses = [];
    let cur = [];
    for (const t of tokens) {
      if (t.p) { if (cur.length) clauses.push(cur); cur = []; continue; }
      cur.push(t);
    }
    if (cur.length) clauses.push(cur);
    return clauses.map((C) => {
      const posts = [];
      const rest = [];
      C.forEach((t, i) => { if (POST.has(G.strict(t.f))) posts.push({ t, i }); else rest.push(t); });
      const groups = [];
      for (let i = 0; i < rest.length;) { const j = Math.max(i + 1, groupEnd(rest, i)); groups.push(rest.slice(i, j)); i = j; }
      const k0 = rest[0] ? rest[0].a : null;
      const fixedFirst = !!(k0 && ((k0.e.k === 'i' && FIRST_CATS.has(k0.e.cat)) || (k0.e.k === 'p' && (k0.e.pid === 'hos' || k0.e.pid === 'tis'))));
      return { tokens: C, groups, posts, fixedFirst };
    });
  }
  // la risposta (lista di forme) è un ordine accettabile della frase di riferimento?
  // keyFn: chiave di confronto delle parole (stretta o senza accenti)
  function orderOK(refTokens, answer, keyFn = (w) => G.strict(w)) {
    const S = structure(refTokens);
    let pos = 0;
    const A = answer.map(keyFn);
    for (const c of S) {
      const n = c.tokens.length;
      const part = A.slice(pos, pos + n);
      pos += n;
      if (part.length !== n) return false;
      // particelle posposte: in seconda posizione nella proposizione (dopo la prima parola)
      const postKeys = c.posts.map((x) => keyFn(x.t.f));
      for (const pk of postKeys) { const at = part.indexOf(pk); if (at !== 1 && !(at > 1 && postKeys.length > 1 && part[at - 1] && postKeys.includes(part[at - 1]))) return false; }
      const body = part.filter((w, i) => !(postKeys.includes(w) && (i === 1 || postKeys.includes(part[i - 1]))));
      const G0 = c.groups.map((g) => g.map((t) => keyFn(t.f)));
      if (c.fixedFirst && G0.length) {
        const g = G0[0];
        if (g.some((w, i) => body[i] !== w)) return false;
      }
      if (!cover(body, G0)) return false;
      // un'enclitica non apre la proposizione
      const first = c.tokens.find((t) => keyFn(t.f) === part[0]);
      if (first && first.encl) return false;
    }
    return pos === A.length;
  }
  function cover(body, groups) {
    const used = new Array(groups.length).fill(false);
    return (function rec(p) {
      if (p === body.length) return used.every(Boolean);
      for (let k = 0; k < groups.length; k++) {
        if (used[k]) continue;
        const g = groups[k];
        if (g.every((w, i) => body[p + i] === w)) {
          used[k] = true;
          if (rec(p + g.length)) return true;
          used[k] = false;
        }
      }
      return false;
    })(0);
  }

  /* ---------- Confronto di una risposta greca scritta ---------- */
  // ref: token di citazione della soluzione; typed: stringa scritta dallo studente
  // o.lenient: accenti e spiriti facoltativi (l'errore viene segnalato ma non conta)
  function checkGreek(refTokens, typed, o = {}) {
    const refWords = render(refTokens, { words: true }).filter((w) => !PUNCT.test(w));
    const ans = splitWords(typed).filter((w) => !PUNCT.test(w));
    const bareKey = (w) => G.bare(w);
    const okBare = orderOK(refTokens.map((t) => t), ans, bareKey) || sameMultisetOrder(refWords, ans, bareKey);
    if (!okBare) return { ok: false, accent: [] };
    // controllo dei segni: ogni parola scritta deve coincidere con una forma ammessa della stessa parola
    const accent = [];
    for (const w of ans) {
      const cands = refWords.filter((r) => bareKey(r) === bareKey(w));
      if (!cands.length) continue;
      const fine = cands.some((r) => G.strict(r) === G.strict(w) || G.strict(G.stripAccents(r)) === G.strict(G.stripAccents(w)) && accentEquivalent(r, w));
      if (!fine) accent.push({ got: w, want: cands[0] });
    }
    return { ok: accent.length === 0 || !!o.lenient, accent, exact: accent.length === 0 };
  }
  function sameMultisetOrder(a, b, key) { return a.length === b.length && a.every((w, i) => key(w) === key(b[i])); }
  // grave e acuto sono equivalenti; l'accento aggiunto davanti a enclitica non è obbligatorio
  function accentEquivalent(r, w) {
    const strip2 = (s) => { const L = G.parse(s); const N = G.nuclei(L); const acc = N.filter((n) => L[n.j].ac); if (acc.length === 2) L[acc[1].j].ac = ''; return G.strict(G.serialize(L)); };
    return strip2(r) === strip2(w);
  }

  /* ---------- Argomenti richiesti da una frase ---------- */
  const ORDER = ['alf', 'art', 'd1', 'pres', 'd2', 'agg1', 'prep', 'mp', 'impf', 'contr', 'd3', 'agg2', 'pron', 'rel', 'fut', 'aor', 'part', 'inf', 'mi', 'cong', 'sub', 'perf'];
  const RANK = Object.fromEntries(ORDER.map((t, i) => [t, i]));
  const cost = (req) => req.reduce((m, t) => Math.max(m, RANK[t] ?? 99), -1) * 100 + req.length;
  // per ogni parola sceglie l'analisi più elementare; restituisce gli argomenti necessari e le analisi scelte
  function sentenceReqs(tokens, declared = []) {
    const tags = new Set(declared);
    const chosen = tokens.map((tk) => {
      if (tk.p) return null;
      const an = E.analyze(tk.f).filter((a) => a.f === tk.a.f);
      let best = null;
      for (const a of an) if (!best || cost(a.req) < cost(best.req)) best = a;
      (best ? best.req : []).forEach((t) => tags.add(t));
      return best;
    });
    return { tags, chosen };
  }

  root.HermSentence = { ORDER, sentenceReqs, render, analyzeSentence, lexicalize, structure, orderOK, checkGreek, splitWords, tok, capFirst, PUNCT };
  if (typeof module !== 'undefined') module.exports = root.HermSentence;
})(typeof window !== 'undefined' ? window : globalThis);
