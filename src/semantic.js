/* HERMENEUS — lessico semantico del generatore.
   Ogni voce rimanda a un lemma del lessico: le forme greche vengono sempre dal motore.
   NOMI      greco|classi|italiano|opzioni
             classi: H persona (mil soldato, rul capo, civ cittadino, wrk lavoratore, srv servo, kid giovane, fam famiglia,
                     tch maestro, msg messaggero, god divinità, eth popolo, wise sapiente, sac sacerdote, old anziano),
                     A animale, P luogo (city, reg, house, field, sea, river, road, wood, isle, camp, temple, mount, plain, port),
                     T cosa (port portabile, gift dono, weap arma, food cibo, bld edificio, val valore, ship nave, bookish scritto),
                     X astratto (virt, ev evento, speech parola, feel sentimento)
             italiano: singolare/plurale:genere[:genere del plurale]; varianti separate da virgola; «-» = solo singolare
             opzioni:  artpl=gli (articolo plurale irregolare: gli dei), noart (nome proprio), in=su (stato in luogo con «su»)
   AGGETTIVI greco|italiano (buono, forte, oppure antico;antichi;antiche)|classi ammesse|+ = prima del nome
   VERBI     vedi VERBS */
(function (root) {
const NOUNS = `
στρατιώτης|H mil|soldato/soldati:m
στρατηγός|H mil rul|comandante/comandanti:m,stratego/strateghi:m
πολίτης|H civ|cittadino/cittadini:m
ναύτης|H sea|marinaio/marinai:m
ποιητής|H art wise|poeta/poeti:m
νεανίας|H kid|giovane/giovani:m,ragazzo/ragazzi:m
δεσπότης|H rul own|padrone/padroni:m
οἰκέτης|H srv|servo/servi:m
δοῦλος|H srv|schiavo/schiavi:m,servo/servi:m
ἄνθρωπος|H gen|uomo/uomini:m
ἀνήρ|H gen|uomo/uomini:m
γυνή|H gen|donna/donne:f
παῖς|H kid fam|fanciullo/fanciulli:m,ragazzo/ragazzi:m
πατήρ|H fam old|padre/padri:m
μήτηρ|H fam|madre/madri:f
θυγάτηρ|H fam kid|figlia/figlie:f
ἀδελφός|H fam|fratello/fratelli:m
διδάσκαλος|H tch wise|maestro/maestri:m
μαθητής|H kid|allievo/allievi:m,discepolo/discepoli:m
ἰατρός|H wrk wise|medico/medici:m
γεωργός|H wrk|contadino/contadini:m
ποιμήν|H wrk|pastore/pastori:m
φύλαξ|H mil|guardiano/guardiani:m
ῥήτωρ|H civ wise|oratore/oratori:m
γέρων|H old wise|vecchio/vecchi:m
βασιλεύς|H rul|re/re:m
τύραννος|H rul|tiranno/tiranni:m
ἄγγελος|H msg|messaggero/messaggeri:m
κῆρυξ|H msg|araldo/araldi:m
σύμμαχος|H mil|alleato/alleati:m
ἱερεύς|H sac|sacerdote/sacerdoti:m
θεός|H god|dio/dei:m|artpl=gli
θεά|H god|dea/dee:f
Ἕλλην|H eth mil|Greco/Greci:m
Πέρσης|H eth mil|Persiano/Persiani:m
Σωκράτης|H wise|Socrate/-:m|noart
Κῦρος|H rul|Ciro/-:m|noart
ἵππος|A|cavallo/cavalli:m
λύκος|A wild|lupo/lupi:m
λέων|A wild|leone/leoni:m
βοῦς|A farm|bue/buoi:m
ταῦρος|A farm|toro/tori:m
ζῷον|A|animale/animali:m
ὄρνις|A|uccello/uccelli:m
πόλις|P city|città/città:f
κώμη|P city|villaggio/villaggi:m
χώρα|P reg|regione/regioni:f,paese/paesi:m
οἰκία|P house|casa/case:f
ἀγρός|P field|campo/campi:m
ἀγορά|P square|piazza/piazze:f,mercato/mercati:m
θάλαττα|P sea|mare/mari:m
ποταμός|P river|fiume/fiumi:m
ὕλη|P wood|bosco/-:m
ὁδός|P road|strada/strade:f,via/vie:f
νῆσος|P isle|isola/isole:f
ἱερόν|P temple|tempio/templi:m
στρατόπεδον|P camp|accampamento/accampamenti:m
πεδίον|P plain|pianura/pianure:f
ὄρος|P mount|monte/monti:m
λιμήν|P port|porto/porti:m
δῶρον|T port gift|dono/doni:m
ὅπλον|T port weap|arma/armi:f
βιβλίον|T port bookish|libro/libri:m
ἐπιστολή|T port bookish|lettera/lettere:f
σῖτος|T port food|grano/-:m,cibo/-:m
οἶνος|T port drink|vino/-:m
μῆλον|T port food|mela/mele:f
ὕδωρ|T drink|acqua/-:f
ἱμάτιον|T port gift|mantello/mantelli:m
ξίφος|T port weap|spada/spade:f
πλοῖον|T ship|nave/navi:f
θύρα|T bld|porta/porte:f
τεῖχος|T bld|muro/mura:m:f
ἀργύριον|T port val|denaro/-:m
θησαυρός|T port val|tesoro/tesori:m
δένδρον|T plant|albero/alberi:m
ἀλήθεια|X speech|verità/-:f
εἰρήνη|X good|pace/-:f
ἐλευθερία|X good|libertà/-:f
ἀρετή|X virt good|virtù/-:f
σοφία|X virt good|sapienza/-:f
δόξα|X good|fama/-:f
νίκη|X ev good|vittoria/vittorie:f
τιμή|X good|onore/onori:m
πόλεμος|X ev bad|guerra/guerre:f
μάχη|X ev bad|battaglia/battaglie:f
κίνδυνος|X bad|pericolo/pericoli:m
θάνατος|X bad|morte/-:f
νόμος|X law|legge/leggi:f
λόγος|X speech|parola/parole:f,discorso/discorsi:m
`;

const ADJS = `
ἀγαθός|buono|H law|+
καλός|bello|H A P gift weap ship|+
κακός|cattivo|H A|
σοφός|sapiente|H|
δίκαιος|giusto|H law|
ἄδικος|ingiusto|H law|
ἀνδρεῖος|coraggioso|mil|
μικρός|piccolo|city house isle A gift bookish|
μακρός|lungo;lunghi;lunghe|road river bld|
νέος|giovane|H|
ἀρχαῖος|antico;antichi;antiche|city temple law bookish bld|
ἐλεύθερος|libero|H|
πλούσιος|ricco;ricchi;ricche|H|
χαλεπός|difficile|road ev|
δεινός|terribile|wild ev|
ἱερός|sacro|temple gift val|
ἰσχυρός|forte|H A|
ταχύς|veloce|A ship|
ἡδύς|dolce|=οἶνος =μῆλον =λόγος|
ἀληθής|vero|=λόγος|
εὐδαίμων|felice|H city|
σώφρων|saggio|H|
`;

/* VERBI: la: lemma; it: infiniti italiani; s: classi del soggetto; o: classi dell'oggetto (=lemma = solo quel nome);
   oc: caso dell'oggetto (acc|gen|dat); oit: preposizione italiana dell'oggetto (a, di); d: classi del dativo di termine;
   pp: complementi ammessi { loc, to, from } con le classi; req: complemento obbligatorio; pass: ammette il passivo;
   inf: verbo servile con infinito; say: verbo dichiarativo (proposizione infinitiva);
   op: verbo di opinione, che in italiano vuole il congiuntivo nella completiva («ritengono che la figlia ascolti») */
const VERBS = [
  { la: 'λύω', it: ['liberare', 'slegare'], s: 'H', o: 'H A !god', pass: 1 },
  { la: 'παιδεύω', it: ['educare'], s: 'tch rul fam wise', o: 'kid mil', pass: 1 },
  { la: 'γράφω', it: ['scrivere'], s: 'H', o: '=ἐπιστολή =βιβλίον =νόμος =λόγος', d: 'H', pass: 1 },
  { la: 'πέμπω', it: ['mandare'], s: 'rul fam civ', o: 'msg mil srv gift', d: 'H', pass: 1 },
  { la: 'φυλάττω', it: ['custodire', 'sorvegliare'], s: 'mil srv civ', o: 'city house bld val', pass: 1 },
  { la: 'σῴζω', it: ['salvare'], s: 'god mil rul', o: 'H city', pass: 1 },
  { la: 'θαυμάζω', it: ['ammirare'], s: 'H', o: 'H good', pass: 1 },
  { la: 'ἄγω', it: ['condurre', 'guidare'], s: 'mil rul wrk', o: 'mil A', pp: { to: 'city field camp plain' }, pass: 1 },
  { la: 'φέρω', it: ['portare'], s: 'H', o: 'port', d: 'H', pp: { to: 'city house camp temple' } },
  { la: 'λέγω', it: ['dire'], s: 'H', o: '=ἀλήθεια =λόγος', d: 'H', say: 1 },
  { la: 'ἀκούω', it: ['ascoltare', 'udire'], s: 'H', o: '=λόγος =ἀλήθεια' },
  { la: 'φεύγω', it: ['fuggire'], s: 'H A', pp: { from: 'city square field house wood isle camp', to: 'city house wood isle mount' } },
  { la: 'μένω', it: ['rimanere', 'restare'], s: 'H', pp: { loc: 'city square house field isle camp temple' } },
  { la: 'τρέχω', it: ['correre'], s: 'H A', pp: { to: 'city square house field', from: 'city square house field wood' } },
  { la: 'πιστεύω', it: ['credere'], s: 'H', o: 'H', oc: 'dat', oit: 'a' },
  { la: 'τιμάω', it: ['onorare'], s: 'H', o: 'god good wise rul', pass: 1 },
  { la: 'φιλέω', it: ['amare'], s: 'H', o: 'H good', pass: 1 },
  { la: 'ζητέω', it: ['cercare'], s: 'H A', o: 'H A port good', pass: 1 },
  { la: 'νικάω', it: ['vincere', 'sconfiggere'], s: 'mil eth rul !srv', o: 'mil eth', pass: 1 },
  { la: 'ὁράω', it: ['vedere'], s: 'H', o: 'H A P T' },
  { la: 'οἰκέω', it: ['abitare'], s: 'H', pp: { loc: 'city house isle' }, req: 'loc' },
  { la: 'λαμβάνω', it: ['prendere'], s: 'H', o: 'port city', pass: 1 },
  { la: 'μανθάνω', it: ['imparare'], s: 'kid wise', o: '=ἀλήθεια =λόγος' },
  { la: 'διώκω', it: ['inseguire'], s: 'H A', o: 'H A !god', pass: 1 },
  { la: 'μάχομαι', it: ['combattere'], s: 'mil eth', pp: { loc: 'plain field city sea square' } },
  { la: 'ἀποθνῄσκω', it: ['morire'], s: 'H A', pp: { loc: 'city plain sea field' } },
  { la: 'ἔρχομαι', it: ['andare', 'venire'], s: 'H', pp: { to: 'city square house field camp temple' }, req: 'to' },
  { la: 'ἀγγέλλω', it: ['annunciare'], s: 'msg', o: '=νίκη =ἀλήθεια', d: 'H', pass: 1 },
  { la: 'ἐπαινέω', it: ['lodare'], s: 'H', o: 'H good', pass: 1 },
  { la: 'βοηθέω', it: ['soccorrere', 'aiutare'], s: 'H', o: 'H', oc: 'dat' },
  { la: 'θύω', it: ['sacrificare'], s: 'sac civ rul', d: 'god', req: 'd' },
  { la: 'ἀποκτείνω', it: ['uccidere'], s: 'H wild', o: 'H A !god' },
  { la: 'ἐλευθερόω', it: ['liberare'], s: 'god rul mil', o: 'H city reg', pass: 1 },
  { la: 'ἐσθίω', it: ['mangiare'], s: 'H A', o: 'food' },
  { la: 'πίνω', it: ['bere'], s: 'H', o: 'drink' },
  { la: 'εὑρίσκω', it: ['trovare'], s: 'H', o: 'port H A', pass: 1 },
  { la: 'κρύπτω', it: ['nascondere'], s: 'H', o: 'port val', pass: 1 },
  { la: 'δίδωμι', it: ['dare'], s: 'H', o: 'gift port val', d: 'H', req: 'd' },
  { la: 'δείκνυμι', it: ['mostrare'], s: 'H', o: '=ὁδός =ἀλήθεια', d: 'H' },
  // servili e dichiarativi (infinito)
  { la: 'βούλομαι', it: ['volere'], s: 'H', inf: 1 },
  { la: 'ἐθέλω', it: ['volere'], s: 'H', inf: 1 },
  { la: 'δύναμαι', it: ['potere'], s: 'H', inf: 1 },
  { la: 'νομίζω', it: ['ritenere', 'credere'], s: 'H', say: 1, op: 1 },
];

root.HERM_SEM = { NOUNS, ADJS, VERBS };
if (typeof module !== 'undefined') module.exports = root.HERM_SEM;
})(typeof window !== 'undefined' ? window : globalThis);
