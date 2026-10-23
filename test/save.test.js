/* Test del codice di salvataggio: andata e ritorno su stati casuali, errori di battitura riconosciuti. */
const H = require('../src/savecode.js');
const LESSONS = Array.from({ length: 91 }, (_, i) => 'l' + i);
const BADGES = Array.from({ length: 18 }, (_, i) => 'b' + i);
let seed = 11;
const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const pick = (a) => a[rnd(a.length)];
const errors = [];
let lens = [], typoCaught = 0, typoTried = 0;
for (let k = 0; k < 2000; k++) {
  const unlocked = rnd(91);
  const stars = {};
  for (let i = 0; i <= unlocked; i++) if (rnd(4)) stars[LESSONS[i]] = 1 + rnd(3);
  if (rnd(4) === 0) stars[LESSONS[90]] = 2; // stelle oltre lo sblocco (unità richiuse)
  const badges = {};
  BADGES.forEach((b) => { if (rnd(3) === 0) badges[b] = '2026-10-01'; });
  const d = new Date(Date.UTC(2025, 0, 1) + rnd(2000) * 864e5);
  const S = {
    name: pick(['', 'Saffo', 'Niccolò', "D'Annunzio", 'Ludovica Maria R.', 'x']), goal: pick([30, 50, 80, 120]), xp: rnd(200000), streak: rnd(900),
    lastDay: rnd(5) ? d.toISOString().slice(0, 10) : null, shields: rnd(3), badges,
    course: { unlocked, stars, times: {} },
    stats: { lessons: rnd(4000), answered: rnd(60000), correct: rnd(60000), translated: rnd(16000) },
    settings: { accents: pick(['lenient', 'strict']), input: pick(['tiles', 'keys']), gen: !rnd(2), sound: !rnd(2), voice: !rnd(2), online: !rnd(2), theme: pick(['auto', 'light', 'dark']) },
    prac: { level: pick(['facile', 'media', 'difficile', 'esperto']), wide: !rnd(2) },
  };
  const code = H.encode(S, LESSONS, BADGES);
  lens.push(code.replace(/-/g, '').length);
  let back;
  try { back = H.decode(code.toLowerCase().replace(/-/g, ' '), LESSONS, BADGES); } catch (e) { errors.push('decodifica: ' + e.message); continue; }
  const same = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) errors.push(`${what}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
  same(back.course.unlocked, unlocked, 'sblocco');
  same(Object.entries(back.course.stars).sort(), Object.entries(stars).sort(), 'stelle');
  same([back.xp, back.streak, back.shields, back.goal], [S.xp, S.streak, S.shields, S.goal], 'punti');
  same(back.lastDay, S.lastDay, 'ultimo giorno');
  same(Object.keys(back.badges).sort(), Object.keys(badges).sort(), 'insegne');
  same(back.stats, S.stats, 'statistiche');
  same(back.settings, S.settings, 'impostazioni');
  same(back.prac, S.prac, 'palestra');
  same(back.name, [...S.name].slice(0, 16).join(''), 'nome'); // il nome si tronca a 16 caratteri
  // un carattere sbagliato deve essere riconosciuto
  const raw = H.clean(code);
  const p = rnd(raw.length);
  const alt = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.replace(raw[p], '');
  const bad = raw.slice(0, p) + alt[rnd(alt.length)] + raw.slice(p + 1);
  typoTried++;
  try { H.decode(bad, LESSONS, BADGES); } catch (e) { typoCaught++; }
}
console.log('\nTest del codice di salvataggio');
console.log(`  Stati codificati e ricostruiti: 2000; lunghezza del codice ${Math.min(...lens)}–${Math.max(...lens)} caratteri`);
console.log(`  Errori di battitura riconosciuti: ${typoCaught}/${typoTried}`);
if (typoCaught < typoTried * 0.99) errors.push('troppi errori di battitura non riconosciuti');
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
[...new Set(errors)].slice(0, 20).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
