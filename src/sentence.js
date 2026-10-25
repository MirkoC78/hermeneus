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

  /* ---------- Lettura nel contesto ----------
     Una forma isolata può avere più analisi (θύρας: gen. sing. o acc. plur.; ἐφύλαττον: 1ª sing. o 3ª plur.).
     Nella frase si tiene quella compatibile con il contesto, in quest'ordine:
     1. letture dichiarate per una frase della banca (HERM_BANK.READINGS), per i casi che il contesto non decide;
     2. reggenza della preposizione sul gruppo che la segue;
     3. concordanza di articolo, aggettivi e nome (da destra a sinistra, così i genitivi interposti trovano il loro articolo);
     4. persona e numero del verbo d'accordo con un soggetto al nominativo certo (neutro plurale → verbo singolare);
     5. con un vocativo nella frase, la 2ª persona ambigua è un imperativo.
     Fra le letture rimaste si sceglie la più elementare. Restituisce gli indici delle parole ancora ambigue. */
  const govOf = (e) => { const g = new Set(); for (const x of String(e.m || '').match(/\+[^)]*/g) || []) for (const c of ['gen', 'dat', 'acc']) if (x.includes(c)) g.add(c); return g; };
  const hasCase = (list) => !!(list && list.some((a) => a.c));
  function contextualize(tokens, words) {
    const C = tokens.map((t) => {
      if (!t || t.p || !t.a || !t.a.e) return null;
      const all = E.analyze(t.a.f).filter((a) => a.e === t.a.e && a.f === t.a.f);
      return all.length ? all : [t.a];
    });
    const keep = (i, pred) => { if (!C[i]) return; const f = C[i].filter(pred); if (f.length && f.length < C[i].length) C[i] = f; };
    const agree = (a, b) => a.c === b.c && a.n === b.n && (!a.g || !b.g || a.g === 'x' || b.g === 'x' || a.g === b.g);
    const kind = (i) => tokens[i] && tokens[i].a && tokens[i].a.e && tokens[i].a.e.k;
    // 1. letture dichiarate (parola → chiave dell'analisi)
    const RD = (root.HERM_BANK && root.HERM_BANK.READINGS) || {};
    const declared = words ? RD[words] : null;
    if (declared) { const D = {}; for (const [w, k] of Object.entries(declared)) D[G.strict(G.nfc(w))] = k; tokens.forEach((t, i) => { if (!C[i]) return; const want = D[G.strict(G.nfc(t.a.f))]; if (want) keep(i, (a) => a.key === want); }); }
    // 2. reggenza
    tokens.forEach((t, i) => {
      if (kind(i) !== 'i' || t.a.cat !== 'prep' || t.post) return;
      const gov = govOf(t.a.e);
      if (!gov.size) return;
      for (let j = i + 1; j < tokens.length; j++) {
        if (!tokens[j] || tokens[j].p || !hasCase(C[j])) break;
        keep(j, (a) => gov.has(a.c));
        const k = kind(j);
        if (k === 'n' || k === 'p') break;
      }
    });
    // 3. articolo, aggettivi e nome (si ripete dopo ogni passo che restringe le letture)
    const articles = () => {
      const claimed = new Set();
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (kind(i) !== 'art') continue;
        for (let j = i + 1; j < tokens.length; j++) {
          const u = tokens[j];
          if (!u || u.p) break;
          const k = kind(j);
          if (k === 'v' && u.a.m !== 'part') break;
          if (k === 'art' || claimed.has(j) || !hasCase(C[j])) continue;
          if (!C[j].some((y) => C[i].some((x) => agree(x, y)))) continue;
          const art = C[i].slice();
          keep(j, (y) => art.some((x) => agree(x, y)));
          keep(i, (x) => C[j].some((y) => agree(x, y)));
          claimed.add(j);
          if (k === 'n' || k === 'p' || k === 'v') break;
        }
      }
    };
    articles();
    const finite = (i) => kind(i) === 'v' && C[i].some((x) => x.p);
    const verbs = tokens.map((t, i) => i).filter(finite);
    const lemmaOf = (i) => tokens[i].a.e.lemma;
    const copula = verbs.length === 0 || verbs.some((i) => ['εἰμί', 'γίγνομαι'].includes(lemmaOf(i)));
    const subordinate = tokens.some((t, i) => kind(i) === 'i' && ['ἵνα', 'ἐάν', 'ὅπως', 'ὅταν', 'ἄν', 'μή', 'ἐπειδάν'].includes(t.a.e.lemma));
    // gruppi preposizionali: il loro caso non entra nei ragionamenti sul soggetto
    const inPP = new Set();
    tokens.forEach((t, i) => {
      if (kind(i) !== 'i' || t.a.cat !== 'prep') return;
      for (let j = i + 1; j < tokens.length && tokens[j] && !tokens[j].p && hasCase(C[j]); j++) { inPP.add(j); if (['n', 'p'].includes(kind(j))) break; }
    });
    const nominal = (i) => hasCase(C[i]) && !inPP.has(i);
    // 4. vocativo solo dopo ὦ (fino alla punteggiatura); altrove la lettura al vocativo si scarta
    const vocZone = new Set();
    tokens.forEach((t, i) => { if (kind(i) === 'i' && t.a.e.lemma === 'ὦ') for (let j = i + 1; j < tokens.length && tokens[j] && !tokens[j].p; j++) vocZone.add(j); });
    tokens.forEach((t, i) => { if (!hasCase(C[i])) return; if (vocZone.has(i)) keep(i, (x) => x.c === 'voc'); else keep(i, (x) => x.c !== 'voc'); });
    // 5. nelle principali senza congiunzioni subordinanti il verbo di modo finito è all'indicativo (o all'imperativo)
    if (!subordinate) verbs.forEach((i) => keep(i, (x) => x.m === 'ind' || x.m === 'imp'));
    // 6. con εἰμί o γίγνομαι (o senza verbo) i nomi fuori dai complementi sono al nominativo
    if (copula) tokens.forEach((t, i) => { if (nominal(i)) keep(i, (x) => x.c === 'nom'); });
    articles();
    // 7. soggetto: primo nominativo certo fuori dai complementi
    const certainNom = () => { for (const i of tokens.map((t, k) => k)) if (nominal(i) && ['n', 'p', 'a'].includes(kind(i)) && C[i].every((x) => x.c === 'nom')) return C[i][0]; return null; };
    let subj = certainNom();
    const groupAgrees = (x, y) => x.n === y.n && (!x.g || !y.g || x.g === 'x' || y.g === 'x' || x.g === y.g);
    if (!copula) {
      if (subj) {
        // un nominativo che non concorda con il soggetto non è un secondo soggetto: è l'oggetto
        tokens.forEach((t, i) => { if (nominal(i) && C[i].some((x) => x.c === 'nom') && C[i].some((x) => x.c !== 'nom') && !C[i].some((x) => x.c === 'nom' && groupAgrees(x, subj))) keep(i, (x) => x.c !== 'nom'); });
      } else if (verbs.length && verbs.every((i) => C[i].every((x) => x.p && x.p[0] !== '3'))) {
        // verbo alla 1ª o 2ª persona: il soggetto è sottinteso, i nomi ambigui sono complementi
        tokens.forEach((t, i) => { if (nominal(i) && C[i].some((x) => x.c !== 'nom')) keep(i, (x) => x.c !== 'nom'); });
      } else if (verbs.length) {
        // verbo alla 3ª persona senza soggetto certo: il primo gruppo che può accordarsi è il soggetto
        const v = C[verbs[0]];
        const fits = (x) => x.c === 'nom' && v.some((y) => y.p && y.p[0] === '3' && y.p[1] === (x.g === 'n' && x.n === 'p' ? 's' : x.n));
        const first = tokens.map((t, i) => i).find((i) => nominal(i) && ['n', 'p'].includes(kind(i)) && C[i].some(fits));
        if (first != null) {
          keep(first, fits);
          articles();
          tokens.forEach((t, i) => { if (i !== first && nominal(i) && ['n', 'p'].includes(kind(i)) && C[i].some((x) => x.c !== 'nom')) keep(i, (x) => x.c !== 'nom'); });
        } else {
          // nessun nome può fare da soggetto: è sottinteso nel verbo, i nomi ambigui sono complementi
          tokens.forEach((t, i) => { if (nominal(i) && C[i].some((x) => x.c !== 'nom')) keep(i, (x) => x.c !== 'nom'); });
        }
      }
      articles();
      subj = certainNom();
    }
    // 8. aggettivi e participi: si accordano con un gruppo già certo della frase
    const certain = tokens.map((t, i) => i).filter((i) => ['n', 'p'].includes(kind(i)) && C[i] && new Set(C[i].map((x) => x.c + x.n + x.g)).size === 1).map((i) => C[i][0]);
    tokens.forEach((t, i) => {
      if (!hasCase(C[i]) || !['a', 'v'].includes(kind(i))) return;
      if (C[i].some((x) => certain.some((y) => agree(x, y)))) keep(i, (x) => certain.some((y) => agree(x, y)));
    });
    articles();
    // 9. persona e numero del verbo d'accordo con il soggetto (neutro plurale → verbo singolare)
    const vocative = vocZone.size > 0;
    verbs.forEach((i) => {
      if (subj && new Set(C[i].map((x) => x.p)).size > 1) {
        const lem = subj.e.lemma;
        const per = lem === 'ἐγώ' ? '1' : lem === 'σύ' ? '2' : '3';
        const num = per === '3' && subj.g === 'n' && subj.n === 'p' ? 's' : subj.n;
        keep(i, (x) => x.p === per + num);
      }
      // 10. con un vocativo la 2ª persona è un comando
      if (vocative && C[i].some((x) => x.m === 'imp') && C[i].some((x) => x.m === 'ind')) keep(i, (x) => x.m === 'imp');
    });
    const ambiguous = [];
    tokens.forEach((t, i) => {
      if (!C[i]) return;
      const best = C[i].reduce((m, x) => (cost(x.req || []) < cost(m.req || []) ? x : m), C[i].includes(t.a) ? t.a : C[i][0]);
      t.a = best;
      if (new Set(C[i].map((x) => x.c + '|' + x.n + '|' + (x.p || '') + '|' + (x.m || ''))).size > 1) ambiguous.push(i);
    });
    return ambiguous;
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
    if (found) { const ambiguous = contextualize(found, G.nfc(s).replace(/\s+/g, ' ').trim()); return { ok: true, tokens: found, ambiguous }; }
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
      const best = tk.a && tk.a.req ? tk.a : null;
      (best ? best.req : []).forEach((t) => tags.add(t));
      return best;
    });
    return { tags, chosen };
  }

  root.HermSentence = { ORDER, sentenceReqs, contextualize, render, analyzeSentence, lexicalize, structure, orderOK, checkGreek, splitWords, tok, capFirst, PUNCT };
  if (typeof module !== 'undefined') module.exports = root.HermSentence;
})(typeof window !== 'undefined' ? window : globalThis);
