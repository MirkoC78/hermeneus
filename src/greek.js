/* HERMENEUS — ortografia greca: Unicode politonico, sillabe, quantità, accenti.
   Notazione dei dati: dopo una vocale «_» = lunga, «^» = breve (solo per α ι υ; η ω sempre lunghe, ε ο brevi).
   «+» separa due vocali che si contraggono; «|» separa il preverbio dal tema. */
(function (root) {
  'use strict';

  const PSILI = '\u0313', DASIA = '\u0314', ACUTE = '\u0301', GRAVE = '\u0300', CIRC = '\u0342';
  const ISUB = '\u0345', DIAER = '\u0308', MACRON = '\u0304', BREVE = '\u0306';
  const VOW = 'αεηιουω';
  const isV = (b) => VOW.includes(b);

  /* ---------- Normalizzazione ---------- */
  // NFC: tonos e oxia diventano lo stesso carattere (U+1F71 → U+03AC); sigma finale; ; e · greci.
  const GR = 'Ͱ-Ͽἀ-῿\u0300-\u036F';
  const RE_FINAL = new RegExp('σ(?![' + GR + 'A-Za-z])', 'g');
  const RE_MID = new RegExp('ς(?=[' + GR + '])', 'g');
  function nfc(s) {
    s = String(s).normalize('NFC');
    if (/[ϲϹ’ʼ᾿᾽]/.test(s)) {
      s = s.replace(/ϲ/g, 'σ').replace(/Ϲ/g, 'Σ').replace(/[’ʼ᾿᾽]/g, '’');
    }
    if (s.indexOf('σ') >= 0) s = s.replace(RE_FINAL, 'ς');
    if (s.indexOf('ς') >= 0) s = s.replace(RE_MID, 'σ');
    return s;
  }
  // chiave di ricerca: niente segni diacritici, minuscolo, sigma unico (le forme in ingresso sono già NFC)
  function bare(s) {
    return String(s).normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase().replace(/ς/g, 'σ').replace(/[^α-ω]/g, '');
  }
  // chiave di confronto stretto (in NFD): grave = acuto, dieresi e quantità ignorate
  function strict(s) {
    return String(s).normalize('NFD').replace(/\u0300/g, ACUTE).replace(/[\u0308\u0304\u0306]/g, '').toLowerCase().replace(/ς/g, 'σ');
  }
  // senza accenti ma con spiriti e iota sottoscritto
  function noAccent(s) {
    return nfc(s).normalize('NFD').replace(/[\u0300\u0301\u0342\u0308\u0304\u0306]/g, '').normalize('NFC');
  }

  /* ---------- Lettere ---------- */
  // ogni lettera: b base minuscola, up maiuscola, br spirito (s|r), ac accento (a|g|c), is iota sottoscritto, di dieresi, q quantità (L|S)
  function parse(word) {
    const out = [];
    const d = String(word).normalize('NFD');
    for (const ch of d) {
      const L = out[out.length - 1];
      switch (ch) {
        case PSILI: if (L) L.br = 's'; continue;
        case DASIA: if (L) L.br = 'r'; continue;
        case ACUTE: if (L) L.ac = 'a'; continue;
        case GRAVE: if (L) L.ac = 'g'; continue;
        case CIRC: if (L) L.ac = 'c'; continue;
        case ISUB: if (L) L.is = true; continue;
        case DIAER: if (L) L.di = true; continue;
        case MACRON: case '_': if (L) L.q = 'L'; continue;
        case BREVE: case '^': if (L) L.q = 'S'; continue;
        default: break;
      }
      if (/[\u0300-\u036F]/.test(ch)) continue;
      if (ch === '+' || ch === '|') { out.push({ b: ch, mark: true }); continue; }
      const lo = ch.toLowerCase();
      out.push({ b: lo === 'ς' ? 'σ' : lo, up: lo !== ch, br: '', ac: '', is: false, di: false, q: '' });
    }
    return out;
  }
  function serialize(L) {
    let s = '';
    const letters = L.filter((l) => !l.mark);
    letters.forEach((l, i) => {
      let b = l.b;
      if (b === 'σ' && (i === letters.length - 1)) b = 'ς';
      if (l.up) b = b.toUpperCase();
      s += b;
      if (l.di) s += DIAER;
      if (l.br) s += l.br === 's' ? PSILI : DASIA;
      if (l.ac) s += l.ac === 'a' ? ACUTE : l.ac === 'g' ? GRAVE : CIRC;
      if (l.is) s += ISUB;
    });
    return s.normalize('NFC');
  }
  const clone = (L) => L.map((l) => ({ ...l }));

  /* ---------- Sillabe (nuclei vocalici) ---------- */
  const DIPH = { ι: 'αεου', υ: 'αεηο' };
  function nuclei(L) {
    const N = [];
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (l.mark || !isV(l.b)) continue;
      const nx = L[i + 1];
      if (nx && !nx.mark && !nx.di && !l.is && !l.ac && !l.br && l.q !== 'L' &&
        ((nx.b === 'ι' && (DIPH.ι.includes(l.b) || l.b === 'υ')) || (nx.b === 'υ' && DIPH.υ.includes(l.b)))) {
        N.push({ i, j: i + 1, diph: true });
        i++;
        continue;
      }
      N.push({ i, j: i, diph: false });
    }
    return N;
  }
  // o.optLong: -αι/-οι finali lunghi (ottativo)
  function isLong(L, n, isLast, o = {}) {
    const a = L[n.i], b = L[n.j];
    if (n.diph) {
      if (isLast && !o.optLong && (a.b === 'α' || a.b === 'ο') && b.b === 'ι') {
        const rest = L.slice(n.j + 1).filter((x) => !x.mark);
        if (!rest.length) return false;
      }
      return true;
    }
    if (a.is || a.b === 'η' || a.b === 'ω') return true;
    if (a.b === 'ε' || a.b === 'ο') return false;
    if (a.ac === 'c') return true;
    return a.q === 'L';
  }
  function clearAccents(L) { L.forEach((l) => { if (!l.mark) l.ac = ''; }); return L; }
  function setAccent(L, n, type) {
    const target = L[n.j];
    if (type === 'c' && !isLongNucleus(L, n)) throw new Error('circonflesso su vocale breve: ' + serialize(L));
    target.ac = type;
  }
  function isLongNucleus(L, n) {
    const a = L[n.i];
    if (n.diph) return true;
    return a.is || a.b === 'η' || a.b === 'ω' || a.q === 'L' || a.ac === 'c';
  }
  function accentInfo(L) {
    const N = nuclei(L);
    for (let k = N.length - 1; k >= 0; k--) {
      const ac = L[N[k].j].ac || L[N[k].i].ac;
      if (ac) return { pos: N.length - 1 - k, type: ac, n: N.length, idx: k };
    }
    return { pos: -1, type: '', n: N.length, idx: -1 };
  }

  /* ---------- Regole d'accento ---------- */
  // accento recessivo (verbi). o.min: indice minimo del nucleo (preverbio, aumento)
  function recessive(L, o = {}) {
    clearAccents(L);
    const N = nuclei(L);
    const n = N.length;
    if (!n) return L;
    const ultLong = isLong(L, N[n - 1], true, o);
    let k, type = 'a';
    if (n === 1) { k = 0; type = ultLong ? 'c' : 'a'; }
    else if (ultLong) k = n - 2;
    else if (n >= 3) k = n - 3;
    else { k = n - 2; type = isLong(L, N[k], false, o) ? 'c' : 'a'; }
    if (o.min != null && k < o.min) k = Math.min(o.min, n - 1);
    if (k === n - 2 && n >= 2) type = isLong(L, N[k], false, o) && !ultLong ? 'c' : 'a';
    if (k === n - 1 && n > 1) type = 'a';
    if (k === n - 3) type = 'a';
    setAccent(L, N[k], type);
    return L;
  }
  // accento persistente: anchor = indice del nucleo accentato nel lemma (da sinistra)
  // o.circUlt: circonflesso se l'accento cade sull'ultima lunga (gen. e dat. degli ossitoni)
  function persistent(L, anchor, o = {}) {
    clearAccents(L);
    const N = nuclei(L);
    const n = N.length;
    if (!n) return L;
    const ultLong = o.ultShort ? false : isLong(L, N[n - 1], true, o);
    const minK = Math.max(0, ultLong ? n - 2 : n - 3);
    let k = Math.min(Math.max(anchor, minK), n - 1);
    let type = 'a';
    if (k === n - 1) type = o.circUlt && ultLong ? 'c' : 'a';
    else if (k === n - 2) type = isLong(L, N[k], false, o) && !ultLong ? 'c' : 'a';
    setAccent(L, N[k], type);
    return L;
  }
  // accento fisso su una sillaba contata dalla fine (1 = ultima), tipo automatico
  function fixedFromEnd(L, pos, o = {}) {
    clearAccents(L);
    const N = nuclei(L);
    const n = N.length;
    const k = n - pos;
    const ultLong = isLong(L, N[n - 1], true, o);
    let type = o.type || 'a';
    if (!o.type) {
      if (pos === 2) type = isLong(L, N[k], false, o) && !ultLong ? 'c' : 'a';
      if (pos === 1) type = 'a';
    }
    setAccent(L, N[k], type);
    return L;
  }

  /* ---------- Contrazione ---------- */
  const CONTR = {
    α: { ε: 'α_', η: 'α_', ει: 'ᾳ', ῃ: 'ᾳ', ο: 'ω', ω: 'ω', ου: 'ω', οι: 'ῳ', ε$: 'α_' },
    ε: { ε: 'ει', η: 'η', ει: 'ει', ῃ: 'ῃ', ο: 'ου', ω: 'ω', ου: 'ου', οι: 'οι', ε$: 'ει' },
    ο: { ε: 'ου', η: 'ω', ει: 'οι', ῃ: 'οι', ο: 'ου', ω: 'ω', ου: 'ου', οι: 'οι', ε$: 'ου' },
  };
  // o.spurious: la vocale dopo «+» è il dittongo improprio -ειν dell'infinito (= ε + ε)
  function contract(L, o = {}) {
    let p;
    while ((p = L.findIndex((l) => l.mark && l.b === '+')) >= 0) {
      const v1 = L[p - 1];
      const after = L.slice(p + 1);
      const N2 = nuclei(after);
      const n2 = N2[0];
      if (!v1 || !n2 || n2.i !== 0) { L.splice(p, 1); continue; }
      let key = after[0].b + (n2.diph ? after[1].b : '');
      if (!n2.diph && after[0].is) key = after[0].b === 'η' ? 'ῃ' : after[0].b + 'ι';
      if (o.spurious && key === 'ει') key = 'ε$';
      const res = CONTR[v1.b] && CONTR[v1.b][key];
      if (!res) throw new Error('contrazione sconosciuta ' + v1.b + '+' + key);
      const acFirst = !!v1.ac;
      const acSecond = !!(after[n2.j].ac || after[0].ac);
      const R = parse(res);
      if (v1.br) R[0].br = v1.br;
      if (v1.up) R[0].up = true;
      const last = R[R.length - 1];
      if (acFirst) last.ac = 'c';
      else if (acSecond) last.ac = 'a';
      const consumed = n2.j + 1;
      L.splice(p - 1, 2 + consumed, ...R);
    }
    return L;
  }

  /* ---------- Funzioni di comodo su stringhe ---------- */
  const strip = (s) => serialize(parse(s)); // toglie quantità e marcatori
  function rec(s, o) { const L = parse(s); recessive(L, o); contract(L, o); return serialize(L); }
  function pers(s, anchor, o) { const L = parse(s); persistent(L, anchor, o); contract(L, o); return serialize(L); }
  function fixedEnd(s, pos, o) { const L = parse(s); fixedFromEnd(L, pos, o); contract(L, o); return serialize(L); }
  // indice del nucleo accentato (da sinistra) di una forma
  function anchorOf(s) { const L = parse(s); const a = accentInfo(L); return a.idx; }
  function syllables(s) { return nuclei(parse(s)).length; }
  // tipo d'accento: ossitona, perispomena, parossitona, properispomena, proparossitona, atona
  function accentClass(s) {
    const a = accentInfo(parse(s));
    if (a.pos < 0) return 'atona';
    if (a.pos === 0) return a.type === 'c' ? 'perispomena' : 'ossitona';
    if (a.pos === 1) return a.type === 'c' ? 'properispomena' : 'parossitona';
    return 'proparossitona';
  }
  // aggiunge l'acuto sull'ultima (davanti a enclitica)
  function addUltimaAcute(s) {
    const L = parse(s);
    const N = nuclei(L);
    if (!N.length) return s;
    L[N[N.length - 1].j].ac = 'a';
    return serialize(L);
  }
  function toGrave(s) {
    const L = parse(s);
    const N = nuclei(L);
    if (!N.length) return s;
    const last = L[N[N.length - 1].j];
    if (last.ac === 'a') last.ac = 'g';
    return serialize(L);
  }
  function stripAccents(s) { const L = parse(s); clearAccents(L); return serialize(L); }
  // ultima vocale con accento acuto o grave come acuto (per confronto)
  function startsWithVowel(s) {
    const L = parse(s).filter((l) => !l.mark);
    // ρ iniziale (anche ῥ) è una consonante: οὐ ῥᾴδιος, ἐκ ῥ…, nessun ν efelcistico
    return !!(L[0] && isV(L[0].b));
  }
  function initialBreathing(s) {
    const L = parse(s).filter((l) => !l.mark);
    if (!L.length || !isV(L[0].b)) return '';
    const N = nuclei(L);
    const n = N[0];
    return L[n.j].br || L[n.i].br || '';
  }

  /* ---------- Traslitterazione e lettura erasmiana (voce italiana) ---------- */
  const TR = { α: 'a', β: 'b', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'ē', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', τ: 't', υ: 'y', φ: 'ph', χ: 'ch', ψ: 'ps', ω: 'ō' };
  function translit(s) {
    const L = parse(nfc(s)).filter((l) => !l.mark);
    let out = '';
    const N = nuclei(L);
    const diphStart = new Set(N.filter((n) => n.diph).map((n) => n.i));
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (!TR[l.b]) { out += l.b; continue; }
      let t = TR[l.b];
      if (l.b === 'γ' && L[i + 1] && 'γκχξ'.includes(L[i + 1].b)) t = 'n';
      if (l.b === 'υ' && i > 0 && diphStart.has(i - 1)) t = 'u';
      if (l.b === 'ρ' && l.br === 'r') t = 'rh';
      const n = N.find((x) => x.i === i);
      if (n && (L[n.j].br === 'r')) t = 'h' + t;
      if (l.up) t = t.charAt(0).toUpperCase() + t.slice(1);
      out += t;
      if (l.is) out += 'i';
    }
    return out;
  }
  // testo per la sintesi italiana: erasmiana scolastica, accento tonico segnato con l'accento grave italiano
  const IT_V = { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù' };
  function erasmianIt(s) {
    return nfc(s).split(/(\s+|[,.;·:!?«»"]+)/).map((w) => {
      if (!/[α-ωἀ-ῼΑ-Ω]/.test(w)) return w;
      const L = parse(w).filter((l) => !l.mark);
      const N = nuclei(L);
      const acc = accentInfo(L);
      let out = '';
      for (let i = 0; i < L.length; i++) {
        const l = L[i];
        const n = N.findIndex((x) => x.i === i);
        if (n >= 0) {
          const nu = N[n];
          let v;
          const a = L[nu.i].b, b = L[nu.j].b;
          if (nu.diph) {
            v = { 'αι': 'ai', 'ει': 'ei', 'οι': 'oi', 'υι': 'ui', 'αυ': 'au', 'ευ': 'eu', 'ηυ': 'eu', 'ου': 'u' }[a + b] || 'ai';
          } else v = { α: 'a', ε: 'e', η: 'e', ι: 'i', ο: 'o', υ: 'u', ω: 'o' }[a];
          if (n === acc.idx) {
            const vi = v.length === 2 && v !== 'ou' ? 0 : v.length - 1;
            v = v.slice(0, vi) + (IT_V[v[vi]] || v[vi]) + v.slice(vi + 1);
          }
          out += v;
          i = nu.j;
          continue;
        }
        const nx = L[i + 1] ? L[i + 1].b : '';
        const front = 'εηι'.includes(nx);
        switch (l.b) {
          case 'γ': out += 'γκχξ'.includes(nx) ? 'n' : (front ? 'gh' : 'g'); break;
          case 'κ': case 'χ': out += front ? 'ch' : 'c'; break;
          case 'ζ': out += 'z'; break;
          case 'θ': case 'τ': out += 't'; break;
          case 'ξ': out += 'cs'; break;
          case 'ψ': out += 'ps'; break;
          case 'φ': out += 'f'; break;
          case 'β': out += 'b'; break;
          case 'δ': out += 'd'; break;
          case 'λ': out += 'l'; break;
          case 'μ': out += 'm'; break;
          case 'ν': out += 'n'; break;
          case 'π': out += 'p'; break;
          case 'ρ': out += 'r'; break;
          case 'σ': out += 's'; break;
          default: out += l.b;
        }
      }
      return out;
    }).join('');
  }

  root.GreekOrtho = {
    nfc, bare, strict, noAccent, parse, serialize, clone, nuclei, isLong, recessive, persistent, fixedFromEnd, contract,
    strip, rec, pers, fixedEnd, anchorOf, syllables, accentClass, addUltimaAcute, toGrave, stripAccents, startsWithVowel,
    initialBreathing, accentInfo, translit, erasmianIt, isV,
  };
  if (typeof module !== 'undefined') module.exports = root.GreekOrtho;
})(typeof window !== 'undefined' ? window : globalThis);
