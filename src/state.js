/* HERMENEUS — stato salvato: valori iniziali e controllo di ciò che arriva da fuori
   (salvataggio del browser, copia su file, codice di ripristino).
   check() costruisce sempre uno stato nuovo e completo, senza toccare quello in uso:
   - un file da importare con anche un solo dato sbagliato si rifiuta per intero;
   - un salvataggio già guasto si ripara campo per campo (il campo sbagliato torna al valore iniziale)
     e l'app ne conserva a parte la copia originale.
   Gli errori salvati usano la posizione delle parole nel lessico (E.LEX.indexOf): l'ordine del lessico non va cambiato. */
(function (root) {
  'use strict';
  const GOALS = [30, 50, 80, 120];
  const LEVELS = ['facile', 'media', 'difficile', 'esperto'];
  const TYPES = ['misto', 'frasi', 'forme', 'parole'];
  const THEMES = ['auto', 'light', 'dark'];
  const MAX = 1e9;

  function defaults() {
    return {
      v: 2, onboarded: false, name: '', topics: [], goal: 50, xp: 0, days: {}, streak: 0, lastDay: null, shields: 0,
      mastery: {}, mistakes: [], badges: {}, vocab: {}, recent: [], genSaved: [], backupAt: 0, savedAt: 0, coach: {},
      course: { unlocked: 0, stars: {}, times: {} },
      prac: { unit: null, type: 'misto', wide: false, level: 'media' },
      stats: { answered: 0, correct: 0, sessions: 0, perfect: 0, forms: 0, typedOK: 0, translated: 0, genSeen: 0, types: {}, clearedReview: 0, accentOK: 0, lessons: 0 },
      settings: { sound: true, voice: true, input: 'tiles', accents: 'lenient', theme: 'auto', gen: true, online: true },
    };
  }

  const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  const isInt = (x, lo = 0, hi = MAX) => typeof x === 'number' && Number.isInteger(x) && x >= lo && x <= hi;
  const isTime = (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x < 1e14;
  const isBool = (x) => typeof x === 'boolean';
  const isStr = (x) => typeof x === 'string';
  const isDay = (x) => isStr(x) && /^\d{4}-\d{2}-\d{2}$/.test(x);
  const all = (o, test) => Object.values(o).every(test);
  const strings = (x) => Array.isArray(x) && x.every(isStr);
  const copy = (x) => JSON.parse(JSON.stringify(x));

  // un errore da ripassare: frase (s), forma (f), parola del lessico (l) o altro esercizio (x)
  function okMistake(m, lexCount) {
    if (!isObj(m) || !isTime(m.at)) return false;
    const word = (e) => isInt(e, 0, lexCount ? lexCount - 1 : MAX);
    if (m.k === 's') return isStr(m.id) && m.id.length > 0 && (m.dir === 'gr_it' || m.dir === 'it_gr');
    if (m.k === 'f') return word(m.e) && isStr(m.key) && (m.t === 'analizza' || m.t === 'scrivi');
    if (m.k === 'l') return word(m.e);
    // esercizi su lettere, accenti, lettura e concordanza: si conserva l'esercizio stesso
    if (m.k === 'x') {
      const d = m.d;
      if (!isObj(d) || !strings(d.options) || d.options.length < 2) return false;
      if (m.t === 'lettera') return isStr(d.prompt) && isStr(d.right);
      if (m.t === 'accento') return isStr(d.word) && isStr(d.right);
      if (m.t === 'alfabeto') return word(d.e) && isStr(d.word) && isStr(d.right);
      if (m.t === 'accorda') return (d.mode === 'adj' || d.mode === 'art') && word(d.e) && word(d.n) && isStr(d.nk) && isStr(d.nf) && isStr(d.answer) && isStr(d.art);
    }
    return false;
  }
  // una frase generata conservata per il ripasso
  const okGen = (g) => isObj(g) && isStr(g.id) && isStr(g.gr) && strings(g.it) && g.it.length > 0 && Array.isArray(g.tok);

  /* d: dati letti (già passati da JSON.parse); ctx: { lessonIds, lexCount }.
     Restituisce { state, problems, fatal }: problems elenca in italiano i dati scartati;
     fatal indica che il contenuto non è un salvataggio di Hermeneus. */
  function check(d, ctx) {
    const S = defaults();
    const problems = [];
    if (!isObj(d)) return { state: S, problems: ['non contiene dei progressi di Hermeneus'], fatal: true };
    if (d.v !== 1 && d.v !== 2) return { state: S, problems: ['viene da una versione sconosciuta di Hermeneus'], fatal: true };
    const n = ctx.lessonIds.length;
    // copia un campo se il valore è ammesso; se c'è ma è sbagliato lo segnala e lascia il valore iniziale
    const take = (from, into, key, test, what) => {
      if (!(key in from) || from[key] === undefined) return;
      if (test(from[key])) into[key] = copy(from[key]);
      else problems.push(what);
    };
    const part = (key, what, fill) => {
      if (!(key in d)) return;
      if (isObj(d[key])) fill(d[key], S[key]);
      else problems.push(what);
    };
    S.v = d.v;
    take(d, S, 'onboarded', isBool, 'benvenuto completato (vero/falso)');
    take(d, S, 'name', (x) => isStr(x) && x.length <= 200, 'nome');
    S.name = S.name.slice(0, 24);
    take(d, S, 'topics', strings, 'argomenti aperti');
    take(d, S, 'goal', (x) => GOALS.includes(x), 'obiettivo giornaliero (30, 50, 80 o 120)');
    take(d, S, 'xp', (x) => isInt(x), 'punti XP (numero intero non negativo)');
    take(d, S, 'days', (x) => isObj(x) && Object.keys(x).every(isDay) && all(x, (v) => isInt(v)), 'punti dei singoli giorni');
    take(d, S, 'streak', (x) => isInt(x), 'giorni di fila');
    take(d, S, 'lastDay', (x) => x === null || isDay(x), 'ultimo giorno di studio');
    take(d, S, 'shields', (x) => isInt(x, 0, 2), 'scudi (da 0 a 2)');
    take(d, S, 'mastery', (x) => isObj(x) && all(x, (m) => isObj(m) && isInt(m.a) && isInt(m.c, 0, m.a)), 'padronanza degli argomenti');
    take(d, S, 'mistakes', (x) => Array.isArray(x) && x.every((m) => okMistake(m, ctx.lexCount)), 'errori da ripassare');
    take(d, S, 'badges', (x) => isObj(x) && all(x, isStr), 'insegne');
    take(d, S, 'vocab', (x) => isObj(x) && all(x, (v) => isObj(v) && isInt(v.box, 0, 5) && isDay(v.due)), 'ripasso del lessico');
    take(d, S, 'recent', strings, 'frasi recenti');
    take(d, S, 'genSaved', (x) => Array.isArray(x) && x.every(okGen), 'frasi generate da ripassare');
    take(d, S, 'backupAt', isTime, 'data dell’ultima copia');
    take(d, S, 'savedAt', isTime, 'data dell’ultimo salvataggio');
    take(d, S, 'coach', (x) => isObj(x) && all(x, isBool), 'suggerimenti già visti');
    // dalla versione 2 il percorso è obbligatorio (la versione 1 aveva solo gli argomenti scelti)
    if (d.v === 2 && !('course' in d)) problems.push('percorso mancante');
    part('course', 'percorso', (c, into) => {
      take(c, into, 'unlocked', (x) => isInt(x, 0, n - 1), `posizione nel percorso (numero intero da 0 a ${n - 1})`);
      take(c, into, 'stars', (x) => isObj(x) && all(x, (v) => isInt(v, 0, 3)), 'stelle delle lezioni (da 0 a 3)');
      take(c, into, 'times', (x) => isObj(x) && all(x, (v) => isInt(v)), 'lezioni ripetute');
      if (d.v === 2 && !('unlocked' in c)) problems.push('posizione nel percorso mancante');
    });
    part('prac', 'impostazioni della palestra', (p, into) => {
      take(p, into, 'unit', (x) => x === null || isStr(x), 'unità della palestra');
      take(p, into, 'type', (x) => TYPES.includes(x), 'tipo di esercizi della palestra');
      take(p, into, 'wide', isBool, 'esercizi su tutte le unità (vero/falso)');
      take(p, into, 'level', (x) => LEVELS.includes(x), 'difficoltà della palestra');
    });
    part('stats', 'statistiche', (st, into) => {
      for (const k of Object.keys(into)) {
        if (k === 'types') take(st, into, k, (x) => isObj(x) && all(x, (v) => isInt(v)), 'statistiche per tipo di esercizio');
        else take(st, into, k, (x) => isInt(x), `statistica «${k}»`);
      }
    });
    part('settings', 'impostazioni', (se, into) => {
      for (const k of ['sound', 'voice', 'gen', 'online']) take(se, into, k, isBool, `impostazione «${k}» (vero/falso)`);
      take(se, into, 'input', (x) => x === 'tiles' || x === 'keys', 'modo di risposta');
      take(se, into, 'accents', (x) => x === 'lenient' || x === 'strict', 'correzione degli accenti');
      take(se, into, 'theme', (x) => THEMES.includes(x), 'tema');
    });
    return { state: S, problems, fatal: false };
  }

  root.HermState = { defaults, check };
  if (typeof module !== 'undefined') module.exports = root.HermState;
})(typeof window !== 'undefined' ? window : globalThis);
