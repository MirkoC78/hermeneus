/* Test del motore morfologico su forme note (accenti e spiriti compresi).
   Ogni riga: lemma | chiave | forme attese (più forme accettate separate da /). Le forme attese
   sono scritte a mano dalle tavole dei manuali, indipendentemente dalle regole del motore. */
require('../src/greek.js');
const E = require('../src/morph.js');
E.loadLexicon(require('../src/lexicon.js'));
const G = E.G;

const CASES = `
# Articolo
ὁ, ἡ, τό | art.m.nom.s | ὁ
ὁ, ἡ, τό | art.m.gen.s | τοῦ
ὁ, ἡ, τό | art.f.dat.s | τῇ
ὁ, ἡ, τό | art.f.acc.p | τάς
ὁ, ἡ, τό | art.m.dat.p | τοῖς
ὁ, ἡ, τό | art.n.nom.p | τά
# Prima declinazione
χώρα | n.gen.s | χώρας
χώρα | n.nom.p | χῶραι
χώρα | n.gen.p | χωρῶν
θάλαττα | n.gen.s | θαλάττης
θάλαττα | n.acc.s | θάλατταν
τιμή | n.gen.s | τιμῆς
τιμή | n.dat.p | τιμαῖς
τιμή | n.acc.p | τιμάς
νίκη | n.nom.p | νῖκαι
μοῦσα | n.gen.p | μουσῶν
μοῦσα | n.acc.s | μοῦσαν
ἀλήθεια | n.gen.s | ἀληθείας
ἀλήθεια | n.acc.s | ἀλήθειαν
ἀγορά | n.dat.s | ἀγορᾷ
πολίτης | n.voc.s | πολῖτα
πολίτης | n.nom.p | πολῖται
πολίτης | n.gen.p | πολιτῶν
νεανίας | n.gen.s | νεανίου
νεανίας | n.voc.s | νεανία
δεσπότης | n.voc.s | δέσποτα
κριτής | n.gen.s | κριτοῦ
# Seconda declinazione
λόγος | n.voc.s | λόγε
ἄνθρωπος | n.gen.s | ἀνθρώπου
ἄνθρωπος | n.nom.p | ἄνθρωποι
ἄνθρωπος | n.acc.p | ἀνθρώπους
δῶρον | n.nom.p | δῶρα
δῶρον | n.gen.s | δώρου
θεός | n.gen.s | θεοῦ
θεός | n.dat.p | θεοῖς
ὁδός | n.dat.p | ὁδοῖς
ἀδελφός | n.voc.s | ἄδελφε
νῆσος | n.acc.p | νήσους
ἱερόν | n.gen.p | ἱερῶν
ζῷον | n.nom.p | ζῷα
# Terza declinazione
φύλαξ | n.dat.p | φύλαξι
φύλαξ | n.gen.p | φυλάκων
φύλαξ | n.acc.p | φύλακας
σῶμα | n.gen.s | σώματος
σῶμα | n.dat.p | σώμασι
σῶμα | n.gen.p | σωμάτων
ὄνομα | n.gen.s | ὀνόματος
γέρων | n.dat.p | γέρουσι
γέρων | n.voc.s | γέρον
γίγας | n.dat.p | γίγασι
ἐλπίς | n.gen.s | ἐλπίδος
ἐλπίς | n.dat.p | ἐλπίσι
χάρις | n.acc.s | χάριν
νύξ | n.gen.s | νυκτός
νύξ | n.gen.p | νυκτῶν
νύξ | n.dat.p | νυξί
παῖς | n.gen.p | παίδων
παῖς | n.voc.s | παῖ
ποιμήν | n.dat.p | ποιμέσι
δαίμων | n.voc.s | δαῖμον
ἀγών | n.gen.s | ἀγῶνος
ῥήτωρ | n.dat.p | ῥήτορσι
σωτήρ | n.voc.s | σῶτερ
πατήρ | n.dat.p | πατράσι
ἀνήρ | n.acc.s | ἄνδρα
γυνή | n.voc.s | γύναι
γένος | n.gen.s | γένους
γένος | n.gen.p | γενῶν
τεῖχος | n.nom.p | τείχη
πόλις | n.gen.s | πόλεως
πόλις | n.acc.s | πόλιν
πόλις | n.nom.p | πόλεις
πόλις | n.gen.p | πόλεων
πρᾶξις | n.acc.s | πρᾶξιν
βασιλεύς | n.gen.s | βασιλέως
βασιλεύς | n.voc.s | βασιλεῦ
βασιλεύς | n.dat.p | βασιλεῦσι
Σωκράτης | n.voc.s | Σώκρατες
Σωκράτης | n.gen.s | Σωκράτους
ναῦς | n.gen.s | νεώς
ἰχθύς | n.acc.p | ἰχθῦς
# Aggettivi
ἀγαθός | a.pos.f.gen.s | ἀγαθῆς
ἀγαθός | a.pos.m.gen.p | ἀγαθῶν
δίκαιος | a.pos.f.nom.s | δικαία
δίκαιος | a.pos.f.gen.p | δικαίων
ἄξιος | a.pos.f.nom.p | ἄξιαι
ἄξιος | a.pos.f.nom.s | ἀξία
ἀληθής | a.pos.m.acc.s | ἀληθῆ
ἀληθής | a.pos.n.nom.p | ἀληθῆ
ἀληθής | a.pos.m.gen.s | ἀληθοῦς
εὐδαίμων | a.pos.n.nom.s | εὔδαιμον
εὐδαίμων | a.pos.m.gen.p | εὐδαιμόνων
σώφρων | a.pos.n.nom.s | σῶφρον
ἡδύς | a.pos.f.nom.s | ἡδεῖα
ἡδύς | a.pos.m.gen.s | ἡδέος
ἡδύς | a.pos.f.gen.p | ἡδειῶν
πᾶς | a.pos.m.dat.p | πᾶσι
πᾶς | a.pos.f.gen.p | πασῶν
μέγας | a.pos.n.nom.s | μέγα
πολύς | a.pos.m.acc.s | πολύν
σοφός | a.cmp.m.nom.s | σοφώτερος
σοφός | a.sup.f.nom.s | σοφωτάτη
ἀγαθός | a.sup.m.nom.s | ἄριστος/βέλτιστος/κράτιστος
μέγας | a.cmp.n.nom.s | μεῖζον
μέγας | a.cmp.m.acc.s | μείζονα/μείζω
ταχύς | a.cmp.m.nom.s | θάττων
# Pronomi
οὗτος | p.f.nom.s | αὕτη
οὗτος | p.n.nom.p | ταῦτα
οὗτος | p.f.gen.p | τούτων
ἐκεῖνος | p.n.nom.s | ἐκεῖνο
αὐτός | p.f.dat.s | αὐτῇ
ὅδε | p.m.acc.p | τούσδε
ὅς | p.f.gen.s | ἧς
ὅς | p.n.nom.p | ἅ
τίς | p.x.gen.s | τίνος
τις | p.x.gen.s | τινός
ἐγώ | p.x.dat.s | ἐμοί/μοι
σύ | p.x.acc.p | ὑμᾶς
οὐδείς | p.f.nom.s | οὐδεμία
# εἰμί
εἰμί | pres.ind.act.3p | εἰσί
εἰμί | pres.ind.act.2s | εἶ
εἰμί | impf.ind.act.1s | ἦ/ἦν
εἰμί | pres.subj.act.3s | ᾖ
εἰμί | pres.opt.act.1s | εἴην
εἰμί | pres.imp.act.2s | ἴσθι
εἰμί | pres.inf.act | εἶναι
εἰμί | pres.part.act.f.nom.s | οὖσα
εἰμί | pres.part.act.m.gen.p | ὄντων
εἰμί | fut.ind.mid.3s | ἔσται
# Verbi in -ω (λύω)
λύω | pres.ind.act.3p | λύουσι
λύω | pres.imp.act.2s | λῦε
λύω | pres.imp.act.3s | λυέτω
λύω | impf.ind.act.1p | ἐλύομεν
λύω | pres.ind.mp.1p | λυόμεθα
λύω | pres.ind.mp.2s | λύῃ/λύει
λύω | impf.ind.mp.3s | ἐλύετο
λύω | pres.subj.act.2s | λύῃς
λύω | pres.opt.act.3s | λύοι
λύω | pres.opt.mp.1s | λυοίμην
λύω | pres.inf.mp | λύεσθαι
λύω | pres.part.act.n.nom.s | λῦον
λύω | pres.part.act.f.gen.p | λυουσῶν
λύω | pres.part.mp.f.gen.s | λυομένης
λύω | fut.ind.act.1s | λύσω
λύω | fut.inf.act | λύσειν
λύω | aor.ind.act.3s | ἔλυσε
λύω | aor.ind.act.1p | ἐλύσαμεν
λύω | aor.inf.act | λῦσαι
λύω | aor.opt.act.3s | λύσαι/λύσειε
λύω | aor.imp.mid.2s | λῦσαι
λύω | aor.imp.act.2s | λῦσον
λύω | aor.imp.act.3s | λυσάτω
λύω | aor.part.act.m.nom.s | λύσας
λύω | aor.part.act.n.nom.s | λῦσαν
λύω | aor.part.act.f.gen.s | λυσάσης
λύω | aor.ind.mid.1s | ἐλυσάμην
λύω | aor.ind.mid.2s | ἐλύσω
λύω | aor.inf.mid | λύσασθαι
λύω | aor.ind.pass.1s | ἐλύθην
λύω | aor.ind.pass.3p | ἐλύθησαν
λύω | aor.subj.pass.1s | λυθῶ
λύω | aor.subj.pass.2s | λυθῇς
λύω | aor.opt.pass.1s | λυθείην
λύω | aor.imp.pass.2s | λύθητι
λύω | aor.inf.pass | λυθῆναι
λύω | aor.part.pass.m.nom.s | λυθείς
λύω | aor.part.pass.f.nom.s | λυθεῖσα
λύω | aor.part.pass.m.gen.s | λυθέντος
λύω | futp.ind.pass.1s | λυθήσομαι
λύω | pf.ind.act.1s | λέλυκα
λύω | pf.ind.act.3p | λελύκασι
λύω | pf.inf.act | λελυκέναι
λύω | pf.part.act.m.nom.s | λελυκώς
λύω | pf.part.act.f.nom.s | λελυκυῖα
λύω | pf.part.act.f.gen.s | λελυκυίας
λύω | pf.ind.mp.1s | λέλυμαι
λύω | pf.inf.mp | λελύσθαι
λύω | pf.part.mp.m.nom.s | λελυμένος
παιδεύω | aor.inf.act | παιδεῦσαι
παιδεύω | aor.ind.act.1s | ἐπαίδευσα
παιδεύω | pf.ind.mp.1s | πεπαίδευμαι
# Verbi contratti
τιμάω | pres.ind.act.3s | τιμᾷ
τιμάω | pres.ind.act.2p | τιμᾶτε
τιμάω | pres.inf.act | τιμᾶν
τιμάω | impf.ind.act.3s | ἐτίμα
τιμάω | impf.ind.act.1s | ἐτίμων
τιμάω | pres.part.act.m.nom.s | τιμῶν
τιμάω | pres.part.act.m.gen.s | τιμῶντος
τιμάω | pres.opt.act.1s | τιμῴην
τιμάω | pres.ind.mp.1p | τιμώμεθα
τιμάω | pres.imp.act.2s | τίμα
τιμάω | fut.ind.act.1s | τιμήσω
τιμάω | aor.ind.act.1s | ἐτίμησα
ποιέω | pres.ind.act.3p | ποιοῦσι
ποιέω | pres.inf.act | ποιεῖν
ποιέω | impf.ind.act.1s | ἐποίουν
ποιέω | impf.ind.act.3s | ἐποίει
ποιέω | pres.imp.act.2s | ποίει
ποιέω | pres.ind.mp.3s | ποιεῖται
ποιέω | pres.part.act.f.nom.s | ποιοῦσα
ποιέω | pres.opt.act.1s | ποιοίην
δηλόω | pres.ind.act.2s | δηλοῖς
δηλόω | pres.inf.act | δηλοῦν
δηλόω | impf.ind.act.3s | ἐδήλου
δηλόω | pres.ind.mp.1s | δηλοῦμαι
δηλόω | pres.subj.act.2p | δηλῶτε
ὁράω | impf.ind.act.1s | ἑώρων
οἰκέω | impf.ind.act.1s | ᾤκουν
# Aoristi, futuri e temi irregolari
λαμβάνω | aor.ind.act.1s | ἔλαβον
λαμβάνω | aor.inf.act | λαβεῖν
λαμβάνω | aor.imp.act.2s | λαβέ
λαμβάνω | aor.part.act.m.nom.s | λαβών
λαμβάνω | aor.part.act.f.nom.s | λαβοῦσα
λαμβάνω | fut.ind.mid.1s | λήψομαι
λαμβάνω | pf.ind.act.1s | εἴληφα
λέγω | aor.ind.act.1s | εἶπον
λέγω | aor.imp.act.2s | εἰπέ
λέγω | fut.ind.act.1s | ἐρῶ
λέγω | fut.ind.act.2s | ἐρεῖς
ἄγω | aor.ind.act.1s | ἤγαγον
ἄγω | impf.ind.act.1s | ἦγον
ἄγω | aor.inf.act | ἀγαγεῖν
ἄγω | aor.ind.pass.1s | ἤχθην
ἔχω | impf.ind.act.1s | εἶχον
ἔχω | fut.ind.act.1s | ἕξω
ἔχω | aor.ind.act.1s | ἔσχον
γίγνομαι | aor.ind.mid.1s | ἐγενόμην
γίγνομαι | aor.inf.mid | γενέσθαι
γίγνομαι | aor.imp.mid.2s | γενοῦ
γίγνομαι | pf.ind.act.1s | γέγονα
γιγνώσκω | aor.ind.act.1s | ἔγνων
γιγνώσκω | aor.inf.act | γνῶναι
γιγνώσκω | aor.imp.act.2s | γνῶθι
ὁράω | aor.ind.act.1s | εἶδον
ὁράω | aor.inf.act | ἰδεῖν
ὁράω | fut.ind.mid.1s | ὄψομαι
ὁράω | aor.ind.pass.1s | ὤφθην
φεύγω | fut.ind.mid.1s | φεύξομαι
φεύγω | aor.ind.act.1s | ἔφυγον
μένω | fut.ind.act.1s | μενῶ
μένω | fut.ind.act.3s | μενεῖ
μένω | aor.ind.act.1s | ἔμεινα
μένω | aor.inf.act | μεῖναι
νομίζω | fut.ind.act.1s | νομιῶ
ἀγγέλλω | aor.ind.act.1s | ἤγγειλα
ἀποθνῄσκω | aor.ind.act.1s | ἀπέθανον
ἀποθνῄσκω | fut.ind.mid.1s | ἀποθανοῦμαι
ἀποκτείνω | aor.ind.act.1s | ἀπέκτεινα
φαίνω | aor.ind.pass.1s | ἐφάνην
γράφω | aor.ind.pass.1s | ἐγράφην
γράφω | aor.imp.pass.2s | γράφηθι
θύω | aor.ind.pass.1s | ἐτύθην
πράττω | pres.imp.act.2s | πρᾶττε
πράττω | aor.inf.act | πρᾶξαι
κρίνω | pres.imp.act.2s | κρῖνε
εὑρίσκω | aor.ind.act.1s | ηὗρον
ἀφικνέομαι | aor.ind.mid.1s | ἀφικόμην
ἀφικνέομαι | pres.ind.mp.1s | ἀφικνοῦμαι
ἐπαινέω | impf.ind.act.1s | ἐπῄνουν
ἔρχομαι | aor.ind.act.1s | ἦλθον
ἔρχομαι | aor.imp.act.2s | ἐλθέ
ἔρχομαι | pf.ind.act.1s | ἐλήλυθα
μάχομαι | aor.ind.mid.1s | ἐμαχεσάμην
φέρω | aor.ind.act.1s | ἤνεγκα
φέρω | fut.ind.act.1s | οἴσω
# Verbi in -μι
δίδωμι | pres.ind.act.3p | διδόασι
δίδωμι | pres.inf.act | διδόναι
δίδωμι | pres.part.act.m.nom.s | διδούς
δίδωμι | aor.ind.act.1s | ἔδωκα
δίδωμι | aor.ind.act.1p | ἔδομεν
δίδωμι | aor.inf.act | δοῦναι
δίδωμι | aor.imp.act.2s | δός
δίδωμι | pres.imp.act.2s | δίδου
τίθημι | pres.ind.act.3p | τιθέασι
τίθημι | aor.ind.act.1s | ἔθηκα
τίθημι | aor.inf.act | θεῖναι
τίθημι | aor.ind.pass.1s | ἐτέθην
ἵστημι | pres.ind.act.3p | ἱστᾶσι
ἵστημι | aor.ind.act.1s | ἔστην/ἔστησα
ἵστημι | aor.inf.act | στῆναι/στῆσαι
ἵστημι | pf.ind.act.1s | ἕστηκα
δείκνυμι | pres.ind.act.3s | δείκνυσι
δείκνυμι | pres.inf.act | δεικνύναι
δείκνυμι | aor.ind.act.1s | ἔδειξα
φημί | pres.ind.act.3s | φησί
οἶδα | pf.ind.act.1p | ἴσμεν
οἶδα | pf.inf.act | εἰδέναι
δύναμαι | pres.ind.mp.2s | δύνασαι
`;

let pass = 0, fail = 0;
const failures = [];
const byCat = {};
let cat = '';
for (const line of CASES.split('\n')) {
  const t = line.trim();
  if (!t) continue;
  if (t.startsWith('#')) { cat = t.slice(1).trim(); continue; }
  const [lemma, key, exp] = t.split('|').map((x) => x.trim());
  const want = exp.split('/').map((x) => G.nfc(x));
  const e = E.LEX.find((x) => x.lemma === G.nfc(lemma) || (x.head && x.head.split(',')[0].trim() === G.nfc(lemma)));
  byCat[cat] = byCat[cat] || { pass: 0, fail: 0 };
  if (!e) { fail++; byCat[cat].fail++; failures.push(`${lemma}: lemma non trovato`); continue; }
  const got = [...new Set(e.forms.filter((f) => f.key === key).map((f) => f.f))];
  // ogni forma attesa deve essere generata, e ogni forma generata per quella chiave deve essere tra le attese
  const ok = want.every((w) => got.includes(w)) && got.every((g) => want.includes(g));
  // l'indice deve riconoscere la forma attesa e ricondurla al lemma
  const idxOK = want.every((w) => E.analyze(w).some((a) => a.e === e && a.key === key));
  if (ok && idxOK) { pass++; byCat[cat].pass++; }
  else { fail++; byCat[cat].fail++; failures.push(`${lemma} ${key}: attese ${want.join('/')} — generate ${got.join('/') || '∅'}${idxOK ? '' : ' (indice)'}`); }
}

/* Regole d'accento e ortografia (funzioni del motore) */
const R = [
  ['recessivo, ultima breve', G.rec('ἀνθρωπος'), 'ἄνθρωπος'],
  ['recessivo, ultima lunga', G.rec('ἀνθρωπου'), 'ἀνθρώπου'],
  ['properispomeno', G.rec('δωρον'), 'δῶρον'],
  ['-αι finale breve', G.rec('λυ_σαι'), 'λῦσαι'],
  ['-οι finale lungo nell’ottativo', G.rec('λυ_σαι', { optLong: true }), 'λύσαι'],
  ['contrazione α+ει', G.rec('τι_μα+ει'), 'τιμᾷ'],
  ['contrazione ε+ο accentata sulla seconda', G.rec('ποιε+ομεθα'), 'ποιούμεθα'],
  ['infinito -ειν improprio', G.rec('δηλο+ειν', { spurious: true }), 'δηλοῦν'],
  ['tonos = oxia (U+1F71)', G.strict('λόγος'.replace('ό', 'ό')), G.strict('λόγος')],
  ['sigma finale', G.nfc('λογοσ'), 'λογος'],
  ['erasmiana', G.erasmianIt('ἄνθρωπος'), 'àntropos'],
];
let rp = 0;
for (const [name, got, want] of R) {
  if (got === want) rp++; else failures.push(`regola «${name}»: ${got} ≠ ${want}`);
}

console.log('\nTest del motore morfologico');
for (const [c, v] of Object.entries(byCat)) console.log(`  ${c.padEnd(42)} ${v.pass}/${v.pass + v.fail}`);
console.log(`  ${'Regole d’accento e ortografia'.padEnd(42)} ${rp}/${R.length}`);
console.log(`Forme verificate: ${pass}/${pass + fail} — regole: ${rp}/${R.length}`);
if (failures.length) { console.log('\nErrori:'); failures.forEach((f) => console.log('  ✗ ' + f)); process.exitCode = 1; }
