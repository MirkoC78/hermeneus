/* HERMENEUS — controllo delle risposte, senza DOM (si usa anche nei test).
   Italiano: si accetta da solo soltanto ciò che coincide parola per parola con una soluzione prevista, a meno di
   maiuscole, apostrofi, punteggiatura e accenti italiani. Tutto il resto va al confronto guidato: una somiglianza
   di lettere non dice nulla sul significato («La donna ama l'uomo» ≠ «L'uomo ama la donna»).
   Greco: tre categorie distinte.
   - lettere e iota sottoscritto: contano sempre (lo iota è morfologia: τῇ dativo, τῆ non esiste);
   - accenti e spiriti: in modalità graduale sono segnalati ma tollerati;
   - forma di οὐ/οὐκ/οὐχ e di ἐκ/ἐξ, che dipende dalla parola seguente: tollerata solo in modalità graduale,
     e mai presentata come esatta. */
(function (root) {
  'use strict';
  const G = root.GreekOrtho || require('./greek.js');
  const SN = root.HermSentence || require('./sentence.js');

  /* ---------- italiano ---------- */
  // tolleranza sicura: minuscole, apostrofi e punteggiatura; gli accenti si confrontano a parte
  function normIt(s, keepAccents) {
    let t = String(s).toLowerCase().replace(/[’`´]/g, "'").normalize('NFD');
    if (!keepAccents) t = t.replace(/[\u0300-\u036F]/g, '');
    return t.normalize('NFC').replace(/'/g, ' ').replace(/[^a-z0-9àèéìíòóùú\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }
  const sim = (a, b) => (!a && !b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));
  // esito: 'exact' (uguale), 'accents' (uguale salvo accenti italiani: accettata, si mostra la grafia giusta),
  // 'review' (diversa: confronto guidato con la soluzione più vicina)
  function matchItalian(refs, ans) {
    const a1 = normIt(ans, true), a0 = normIt(ans, false);
    for (const r of refs) if (normIt(r, true) === a1) return { status: 'exact', ref: r };
    for (const r of refs) if (normIt(r, false) === a0) return { status: 'accents', ref: r };
    let ref = refs[0], best = -1;
    for (const r of refs) { const v = sim(a0, normIt(r, false)); if (v > best) { best = v; ref = r; } }
    return { status: 'review', ref, sim: best };
  }
  // per le tessere: la frase composta deve coincidere con una soluzione prevista
  function tilesItalian(refs, built) {
    const b = normIt(built, false);
    return refs.some((r) => normIt(r, false) === b);
  }

  /* ---------- greco ---------- */
  // lettere e iota sottoscritto, senza accenti, spiriti e dieresi
  function letters(s) {
    return G.nfc(s).normalize('NFD').replace(/[\u0300-\u0344\u0346-\u036F]/g, '').toLowerCase().replace(/ς/g, 'σ').replace(/[^α-ω\u0345]/g, '');
  }
  const NEG = new Set(['ου', 'ουκ', 'ουχ', 'ουχι']);
  const EK = new Set(['εκ', 'εξ']);
  // chiave per riconoscere la parola: per οὐ ed ἐκ tutte le forme valgono la stessa parola
  function wordKey(w, lemma) {
    const l = letters(w);
    if (lemma === 'οὐ' && NEG.has(l)) return '#ου';
    if (lemma === 'ἐκ' && EK.has(l)) return '#εκ';
    return l;
  }
  // due accenti ammessi (parola seguita da enclitica): si confronta togliendo il secondo
  function twoAcc(s) { const L = G.parse(s); const N = G.nuclei(L); const acc = N.filter((n) => L[n.j].ac); if (acc.length === 2) L[acc[1].j].ac = ''; return G.strict(G.serialize(L)); }
  function exactVariants(x) {
    const v = new Set([x.w, x.t.f]);
    if (x.t.nu) { v.add(x.w.replace(/ν$/, '')); v.add(x.t.f + 'ν'); }
    if (x.t.encl) v.add(G.stripAccents(x.w));
    return [...v];
  }
  // confronto di una frase scritta in greco con i token di riferimento (ordine libero, come per le tessere)
  function checkGreek(refTokens, typed, o = {}) {
    const lenient = !!o.lenient;
    const words = SN.render(refTokens, { words: true });
    const ref = refTokens.map((t, i) => ({ t, w: words[i] })).filter((x) => x.t && !x.t.p);
    const ans = SN.splitWords(typed).filter((w) => !SN.PUNCT.test(w)).map((w) => G.nfc(w));
    if (ans.length !== ref.length) return { ok: false, exact: false, issues: [], wrongCount: true };
    const assign = (keyOf) => {
      const refKeys = ref.map((x) => new Set(exactVariants(x).concat([x.w]).map((v) => keyOf(v, x.t.lemma))));
      const cand = ans.map((w) => ref.map((_, i) => i).filter((i) => refKeys[i].has(keyOf(w, ref[i].t.lemma))));
      const used = new Array(ref.length).fill(false), cur = [];
      let found = null;
      (function dfs(k) {
        if (found) return;
        if (k === ans.length) { if (SN.orderOK(refTokens, cur.map((i) => ref[i].t.f))) found = cur.slice(); return; }
        for (const i of cand[k]) { if (used[i]) continue; used[i] = true; cur.push(i); dfs(k + 1); cur.pop(); used[i] = false; if (found) return; }
      })(0);
      return found;
    };
    const found = assign(wordKey);
    if (!found) {
      // stesse parole salvo lo iota sottoscritto? lo diciamo in modo preciso
      const noIota = (w, lemma) => wordKey(w, lemma).replace(/\u0345/g, '');
      const f2 = assign(noIota);
      if (f2) {
        const issues = [];
        ans.forEach((w, k) => { const x = ref[f2[k]]; if (wordKey(w, x.t.lemma) !== wordKey(x.w, x.t.lemma)) issues.push({ kind: 'iota', got: w, want: x.w }); });
        return { ok: false, exact: false, issues };
      }
      return { ok: false, exact: false, issues: [] };
    }
    const issues = [];
    ans.forEach((w, k) => {
      const x = ref[found[k]];
      const ex = exactVariants(x);
      if (ex.some((v) => G.strict(v) === G.strict(w) || twoAcc(v) === twoAcc(w))) return;
      // la parola è giusta come lettere: è sbagliata la forma contestuale (οὐκ/ἐξ…) oppure accenti e spiriti
      if ((x.t.lemma === 'οὐ' || x.t.lemma === 'ἐκ') && letters(w) !== letters(x.w)) issues.push({ kind: 'form', got: w, want: x.w });
      else issues.push({ kind: 'accent', got: w, want: x.w });
    });
    return { ok: issues.length === 0 || lenient, exact: issues.length === 0, issues };
  }
  // una forma isolata (esercizio «scrivi la forma»)
  function checkForm(answers, typed, o = {}) {
    const raw = G.nfc(String(typed).trim());
    const alts = answers.concat(o.nu ? answers.map((a) => a + 'ν') : []);
    if (alts.some((a) => G.strict(a) === G.strict(raw))) return { ok: true, exact: true, issues: [] };
    const sameLetters = alts.find((a) => letters(a) === letters(raw));
    if (sameLetters) return { ok: !!o.lenient, exact: false, issues: [{ kind: 'accent', got: raw, want: sameLetters }] };
    const noIota = (s) => letters(s).replace(/\u0345/g, '');
    const iota = alts.find((a) => noIota(a) === noIota(raw));
    if (iota) return { ok: false, exact: false, issues: [{ kind: 'iota', got: raw, want: iota }] };
    return { ok: false, exact: false, issues: [] };
  }

  root.HermCheck = { normIt, lev, sim, matchItalian, tilesItalian, letters, checkGreek, checkForm };
  if (typeof module !== 'undefined') module.exports = root.HermCheck;
})(typeof window !== 'undefined' ? window : globalThis);
