/* HERMENEUS — il percorso: 22 unità (una per argomento), ognuna con lezioni brevi e una prova finale.
   Ogni lezione ha un perimetro preciso: le parole nuove (lemmi), le forme ammesse (keys, espressione regolare
   sulle chiavi del motore) e il tipo di esercizi. Le frasi usano solo il vocabolario già incontrato nel percorso
   (al massimo una parola nuova, segnalata).
   Schede di spiegazione (teach): say (Ermes parla), p (testo), decl/conj/adj/pron/art/forms (tabelle dal motore),
   ex [greco, italiano] (esempio verificato dai test). Dopo ogni tabella la lezione propone una domanda di controllo. */
(function (root) {
const g = (s) => `<span class="gr">${s}</span>`;
const x = (s) => `<span class="gr x">${s}</span>`;
const NOM = ['abbina', 'analizza', 'accorda', 'analizza', 'scrivi', 'frase', 'accorda', 'scrivi', 'frase', 'analizza'];
const VERB = ['abbina', 'analizza', 'scrivi', 'analizza', 'frase', 'frase', 'scrivi', 'analizza', 'frase', 'frase'];
const SYN = ['frase', 'analizza', 'frase', 'frase', 'abbina', 'frase', 'completa', 'frase', 'frase', 'scrivi'];
const TEST = ['analizza', 'frase', 'scrivi', 'frase', 'accorda', 'frase', 'analizza', 'frase', 'scrivi', 'frase', 'completa', 'frase'];

const UNITS = [
{ id: 'alf', title: 'L’alfabeto', say: 'Χαῖρε! Sono Ermes, il messaggero degli dèi. Ti accompagno nel greco, un passo alla volta. Cominciamo dalle lettere.',
  lessons: [
  { id: 'alf1', title: 'Le prime lettere', sub: 'α β γ δ ε ζ η θ', mix: ['lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera'], letters: 'αβγδεζηθ',
    teach: [
      { say: 'Il greco ha 24 lettere. Molte le conosci già dalla matematica: α, β, π, σ…' },
      { tbl: { c: ['Lettera', 'Nome', 'Suono'], r: [['Α α', 'alfa', 'a'], ['Β β', 'beta', 'b'], ['Γ γ', 'gamma', 'g dura'], ['Δ δ', 'delta', 'd'], ['Ε ε', 'epsilon', 'e breve'], ['Ζ ζ', 'zeta', 'z (ds)'], ['Η η', 'eta', 'e lunga e aperta'], ['Θ θ', 'theta', 't aspirata (th)']] } },
      { say: 'Attento a η: sembra una n, ma è una e lunga!' }] },
  { id: 'alf2', title: 'Altre lettere', sub: 'ι κ λ μ ν ξ ο π', mix: ['lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera'], letters: 'ικλμνξοπ',
    teach: [
      { tbl: { c: ['Lettera', 'Nome', 'Suono'], r: [['Ι ι', 'iota', 'i'], ['Κ κ', 'kappa', 'c dura'], ['Λ λ', 'lambda', 'l'], ['Μ μ', 'my', 'm'], ['Ν ν', 'ny', 'n'], ['Ξ ξ', 'xi', 'cs'], ['Ο ο', 'omicron', 'o breve'], ['Π π', 'pi', 'p']] } },
      { say: 'ν (ny) somiglia a una v, ma suona n. Non farti ingannare!' }] },
  { id: 'alf3', title: 'Le ultime lettere', sub: 'ρ σ ς τ υ φ χ ψ ω', mix: ['lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'lettera', 'alfabeto', 'alfabeto'], letters: 'ρσςτυφχψω',
    teach: [
      { tbl: { c: ['Lettera', 'Nome', 'Suono'], r: [['Ρ ρ', 'rho', 'r'], ['Σ σ ς', 'sigma', 's (ς in fine di parola)'], ['Τ τ', 'tau', 't'], ['Υ υ', 'ypsilon', 'ü francese'], ['Φ φ', 'phi', 'f'], ['Χ χ', 'chi', 'k aspirata'], ['Ψ ψ', 'psi', 'ps'], ['Ω ω', 'omega', 'o lunga e aperta']] } },
      { say: 'Il sigma ha due forme: σ dentro la parola, ς alla fine. Come in λόγος.' }] },
  { id: 'alf4', title: 'Spiriti e accenti', sub: 'ἀ ἁ · ά ὰ ᾶ', mix: ['accento', 'alfabeto', 'accento', 'alfabeto', 'accento', 'alfabeto', 'accento', 'alfabeto'],
    teach: [
      { say: 'Ogni parola che comincia per vocale ha uno spirito: dolce (ἀ) o aspro (ἁ), che si legge come una h.' },
      { p: `Gli accenti sono tre: acuto (${x('ά')}), grave (${x('ὰ')}) e circonflesso (${x('ᾶ')}). L’accento cade su una delle ultime tre sillabe.` },
      { p: `Le parole si chiamano <b>ossitone</b> (accento acuto sull’ultima: ${g('ποταμός')}), <b>parossitone</b> (penultima: ${g('λόγος')}), <b>proparossitone</b> (terzultima: ${g('ἄνθρωπος')}), <b>perispomene</b> (circonflesso sull’ultima: ${g('θεοῦ')}), <b>properispomene</b> (circonflesso sulla penultima: ${g('δῶρον')}).` },
      { say: 'Prova a classificare qualche parola: guarda dove cade l’accento e che segno è.' }] },
  { id: 'alf5', title: 'Leggere le parole', sub: 'traslitterare e ascoltare', mix: ['alfabeto', 'alfabeto', 'alfabeto', 'accento', 'alfabeto', 'alfabeto', 'accento', 'alfabeto', 'alfabeto', 'alfabeto'], test: true },
  ] },
{ id: 'art', title: 'L’articolo', say: 'Il greco ha solo l’articolo determinativo, «il, lo, la». È la tua bussola: dice caso, numero e genere.',
  lessons: [
  { id: 'art1', title: 'Maschile e femminile', sub: 'ὁ, ἡ, τοῦ, τῆς…', keys: '^art\\.[mf]\\.', mix: ['analizza', 'analizza', 'scrivi', 'analizza', 'analizza', 'scrivi', 'analizza', 'analizza'],
    teach: [
      { say: 'Ecco l’articolo maschile e femminile. ὁ, ἡ, οἱ, αἱ non hanno accento: si appoggiano alla parola dopo.' },
      { art: true },
      { p: `Il genitivo plurale ${g('τῶν')} è uguale per tutti i generi: decide il nome.` }] },
  { id: 'art2', title: 'Il neutro', sub: 'τό, τοῦ, τῷ, τά', keys: '^art\\.', mix: ['analizza', 'scrivi', 'analizza', 'analizza', 'scrivi', 'analizza', 'analizza', 'scrivi'],
    teach: [
      { say: 'Il neutro ha nominativo e accusativo uguali: τό al singolare, τά al plurale.' },
      { p: `${g('τοῦ')} e ${g('τῷ')} valgono sia per il maschile sia per il neutro.` }] },
  { id: 'art3', title: 'Prova d’unità', sub: 'tutto l’articolo', keys: '^art\\.', mix: ['analizza', 'scrivi', 'analizza', 'scrivi', 'analizza', 'analizza', 'scrivi', 'analizza', 'scrivi', 'analizza'], test: true },
  ] },
{ id: 'd1', title: 'Prima declinazione', say: 'Ora i nomi! La prima declinazione ha soprattutto femminili in -α e in -η, e qualche maschile.',
  lessons: [
  { id: 'd1a', title: 'Alfa puro', sub: 'χώρα, οἰκία, θεά', lemmas: ['χώρα', 'οἰκία', 'θεά', 'ἀγορά', 'σοφία', 'ἡμέρα'], keys: '^n\\.\\w+\\.s$', mix: ['abbina', 'analizza', 'accorda', 'analizza', 'scrivi', 'accorda', 'analizza', 'scrivi', 'frase', 'analizza'],
    teach: [
      { say: 'Se prima della desinenza c’è ε, ι o ρ, l’α resta α in tutto il singolare: si chiama «α puro».' },
      { decl: ['χώρα'], num: 's' },
      { p: `Guarda le desinenze: ${x('-α -ας -ᾳ -αν -α')}. Il dativo ha lo iota sottoscritto: ${g('χώρᾳ')}.` },
      { say: 'Gli ossitoni come θεά e ἀγορά prendono il circonflesso al genitivo e al dativo: θεᾶς, θεᾷ.' }] },
  { id: 'd1b', title: 'Alfa impuro ed eta', sub: 'θάλαττα, τιμή', lemmas: ['θάλαττα', 'δόξα', 'μοῦσα', 'τιμή', 'ψυχή', 'νίκη', 'εἰρήνη', 'ἀρετή', 'ἐπιστολή'], keys: '^n\\.\\w+\\.s$', mix: NOM,
    teach: [
      { say: 'Dopo le altre consonanti l’α è «impuro»: al genitivo e al dativo diventa η.' },
      { decl: ['θάλαττα', 'τιμή'], num: 's' },
      { p: `I nomi in ${x('-η')} tengono la η in tutto il singolare: ${g('τιμή')}, ${g('τιμῆς')}, ${g('τιμῇ')}, ${g('τιμήν')}.` }] },
  { id: 'd1c', title: 'Il plurale', sub: 'uguale per tutti', lemmas: ['κώμη', 'θύρα', 'γνώμη'], keys: '^n\\.\\w+\\.[sp]$', mix: NOM,
    teach: [
      { say: 'Buona notizia: il plurale è uguale per tutti i nomi della prima declinazione!' },
      { decl: ['χώρα', 'τιμή'], num: 'p' },
      { p: `Il genitivo plurale ha sempre il circonflesso: ${g('χωρῶν')}, ${g('τιμῶν')}. L’accusativo plurale ${x('-ας')} è uguale al genitivo singolare dell’α puro: guarda l’articolo!` }] },
  { id: 'd1d', title: 'I maschili', sub: 'πολίτης, νεανίας', lemmas: ['πολίτης', 'ναύτης', 'νεανίας', 'στρατιώτης', 'ποιητής', 'δεσπότης'], mix: NOM,
    teach: [
      { say: 'Ci sono anche maschili in -ας e in -ης: al genitivo singolare fanno -ου.' },
      { decl: ['πολίτης', 'νεανίας'] },
      { p: `I nomi in ${x('-της')} hanno il vocativo in ${x('-α')} breve: ${g('ὦ πολῖτα')}, «o cittadino».` }] },
  { id: 'd1t', title: 'Prova d’unità', sub: 'prima declinazione', mix: TEST, test: true },
  ] },
{ id: 'pres', title: 'Il presente', say: 'Arriva il verbo! Con il presente puoi già costruire le prime frasi vere.',
  lessons: [
  { id: 'pres1', title: 'Il presente di λύω', sub: 'λύω, λύεις, λύει…', lemmas: ['λύω', 'γράφω', 'παιδεύω', 'φεύγω', 'μένω', 'θαυμάζω'], keys: '^pres\\.ind\\.act\\.', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'Il verbo si cita alla prima persona: λύω, «io sciolgo». La desinenza dice chi agisce.' },
      { conj: [['λύω', 'pres.ind.act']] },
      { p: `Il soggetto spesso non c’è: ${g('λύομεν')} vuol dire già «noi sciogliamo».` },
      { ex: ['Γράφω καὶ λέγω.', 'Scrivo e parlo.'] }] },
  { id: 'pres2', title: 'Il verbo essere', sub: 'εἰμί, εἶ, ἐστί…', lemmas: ['εἰμί'], keys: '^pres\\.ind\\.act\\.', mix: ['analizza', 'scrivi', 'frase', 'analizza', 'frase', 'scrivi', 'frase', 'frase', 'analizza', 'frase'], tenses: ['pres'],
    teach: [
      { say: 'εἰμί, «sono», è irregolare. Quasi tutte le sue forme sono enclitiche: si appoggiano alla parola prima.' },
      { conj: [['εἰμί', 'pres.ind.act']] },
      { ex: ['Πολῖταί ἐσμεν.', 'Siamo cittadini.'] },
      { say: 'Vedi? ἐσμέν cede il suo accento a πολῖται, che ne prende uno in più: πολῖταί ἐσμεν.' }] },
  { id: 'pres3', title: 'Soggetto e oggetto', sub: 'nominativo e accusativo', lemmas: ['σῴζω', 'φυλάττω', 'πέμπω', 'ἄγω', 'λέγω', 'ἀκούω', 'ἔχω'], keys: '^pres\\.ind\\.act\\.', mix: SYN, tenses: ['pres'],
    teach: [
      { say: 'Il soggetto è al nominativo, l’oggetto all’accusativo. L’ordine delle parole è libero: guarda le desinenze!' },
      { ex: ['Ὁ ποιητὴς τὴν θεὰν θαυμάζει.', 'Il poeta ammira la dea.'] },
      { p: `Negazione: ${g('οὐ')} davanti a consonante, ${g('οὐκ')} davanti a spirito dolce, ${g('οὐχ')} davanti a spirito aspro.` }] },
  { id: 'pres4', title: 'Infinito e imperativo', sub: 'λύειν, λῦε', keys: '^pres\\.(inf|imp)\\.act', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'L’infinito presente esce in -ειν: λύειν, «sciogliere». L’imperativo dà un ordine.' },
      { conj: [['λύω', 'pres.imp.act']] },
      { ex: ['Λέγε τὴν ἀλήθειαν.', 'Di’ la verità.'] }] },
  { id: 'prest', title: 'Prova d’unità', sub: 'il presente', mix: TEST, test: true, tenses: ['pres'] },
  ] },
{ id: 'd2', title: 'Seconda declinazione', say: 'La seconda declinazione è la più regolare: λόγος, ἄνθρωπος, δῶρον.',
  lessons: [
  { id: 'd2a', title: 'I maschili in -ος', sub: 'λόγος, ἄνθρωπος', lemmas: ['λόγος', 'ἄνθρωπος', 'ἵππος', 'δοῦλος', 'θεός', 'ἀγρός', 'ποταμός', 'στρατηγός'], mix: NOM,
    teach: [
      { say: 'Desinenze in -ος, -ου, -ῳ, -ον, -ε: facili da ricordare.' },
      { decl: ['λόγος', 'ἄνθρωπος'] },
      { p: `L’accento resta dov’è finché può: ${g('ἄνθρωπος')}, ma ${g('ἀνθρώπου')}, perché l’ultima è lunga.` }] },
  { id: 'd2b', title: 'I femminili in -ος', sub: 'ἡ ὁδός, ἡ νῆσος', lemmas: ['ὁδός', 'νῆσος', 'νόσος', 'ἀδελφός'], mix: NOM,
    teach: [
      { say: 'Sorpresa: alcuni nomi in -ος sono femminili! L’articolo te lo dice.' },
      { decl: ['ὁδός'] },
      { ex: ['Ἡ ὁδὸς μακρά ἐστιν.', 'La strada è lunga.'] }] },
  { id: 'd2c', title: 'I neutri in -ον', sub: 'δῶρον, ἔργον', lemmas: ['δῶρον', 'ἔργον', 'τέκνον', 'ζῷον', 'ὅπλον', 'βιβλίον'], mix: NOM,
    teach: [
      { say: 'Nei neutri nominativo, accusativo e vocativo sono uguali. Al plurale escono in -α.' },
      { decl: ['δῶρον'] },
      { say: 'Regola d’oro: un soggetto neutro plurale vuole il verbo al singolare!' },
      { ex: ['Τὰ ζῷα τρέχει.', 'Gli animali corrono.'] }] },
  { id: 'd2d', title: 'Frasi', sub: 'soggetto, oggetto, termine', mix: SYN },
  { id: 'd2t', title: 'Prova d’unità', sub: 'seconda declinazione', mix: TEST, test: true },
  ] },
{ id: 'agg1', title: 'Aggettivi I classe', say: 'Gli aggettivi concordano con il nome. La loro posizione cambia il senso della frase!',
  lessons: [
  { id: 'agg1a', title: 'In -ος, -η, -ον', sub: 'ἀγαθός, καλός', lemmas: ['ἀγαθός', 'καλός', 'σοφός', 'κακός', 'χαλεπός'], keys: '^a\\.pos\\.', mix: NOM,
    teach: [
      { say: 'Maschile e neutro come la seconda declinazione, femminile come la prima.' },
      { adj: 'ἀγαθός' }] },
  { id: 'agg1b', title: 'In -ος, -α, -ον', sub: 'δίκαιος, μικρός', lemmas: ['δίκαιος', 'μικρός', 'ἄξιος', 'ἐλεύθερος', 'ἀνδρεῖος', 'μακρός'], keys: '^a\\.pos\\.', mix: NOM,
    teach: [
      { say: 'Dopo ε, ι, ρ il femminile ha α invece di η: δικαία, μικρά.' },
      { adj: 'δίκαιος' }] },
  { id: 'agg1c', title: 'Attributivo o predicativo?', sub: 'ὁ ἀγαθὸς ἀνήρ · ἀγαθὸς ὁ ἀνήρ', lemmas: ['ἄδικος', 'μέγας', 'πολύς'], keys: '^a\\.pos\\.', mix: SYN,
    teach: [
      { say: 'Se l’aggettivo sta fra articolo e nome è attributivo: «il buon comandante».' },
      { ex: ['Ὁ ἀγαθὸς στρατηγὸς τοὺς στρατιώτας σῴζει.', 'Il buon comandante salva i soldati.'] },
      { say: 'Se sta fuori, è predicativo: fa da predicato, anche senza verbo!' },
      { ex: ['Καλὴ ἡ νίκη.', 'La vittoria è bella.'] }] },
  { id: 'agg1t', title: 'Prova d’unità', sub: 'aggettivi della prima classe', mix: TEST, test: true },
  ] },
{ id: 'prep', title: 'Preposizioni', say: 'Le preposizioni reggono un caso preciso, e il caso cambia il significato.',
  lessons: [
  { id: 'prep1', title: 'Luoghi', sub: 'ἐν, εἰς, ἐκ, ἀπό', lemmas: ['ἐν', 'εἰς', 'ἐκ', 'ἀπό', 'πρός'], mix: SYN,
    teach: [
      { say: 'Stato in luogo: ἐν + dativo. Moto a luogo: εἰς + accusativo. Moto da luogo: ἐκ o ἀπό + genitivo.' },
      { ex: ['Οἱ ναῦται ἐν τῇ θαλάττῃ μένουσιν.', 'I marinai rimangono in mare.'] },
      { ex: ['Οἱ πολῖται ἐκ τῆς ἀγορᾶς φεύγουσιν.', 'I cittadini fuggono dalla piazza.'] }] },
  { id: 'prep2', title: 'Compagnia, causa, argomento', sub: 'μετά, σύν, διά, περί', lemmas: ['μετά', 'σύν', 'διά', 'περί'], mix: SYN,
    teach: [
      { say: 'μετά + genitivo e σύν + dativo: compagnia. διά + accusativo: causa. περί + genitivo: argomento.' },
      { ex: ['Διὰ τὸν πόλεμον οἱ ἄνθρωποι φεύγουσιν.', 'A causa della guerra gli uomini fuggono.'] }] },
  { id: 'prep3', title: 'Mezzo e tempo', sub: 'il dativo e il genitivo', lemmas: ['κώμη', 'ἀγρός'], mix: SYN,
    teach: [
      { say: 'Il mezzo è un dativo semplice, senza preposizione. Il tempo «di notte» è un genitivo.' },
      { ex: ['Τοῖς ὅπλοις τὴν χώραν φυλάττομεν.', 'Con le armi custodiamo la regione.'] }] },
  { id: 'prept', title: 'Prova d’unità', sub: 'preposizioni', mix: TEST, test: true },
  ] },
{ id: 'mp', title: 'Medio-passivo', say: 'Una sola serie di forme per due diatesi: il medio e il passivo.',
  lessons: [
  { id: 'mp1', title: 'Le forme', sub: 'λύομαι, λύῃ…', keys: '^pres\\.(ind|imp|inf)\\.mp', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'Desinenze nuove: -ομαι, -ῃ, -εται, -ομεθα, -εσθε, -ονται.' },
      { conj: [['λύω', 'pres.ind.mp']] }] },
  { id: 'mp2', title: 'Il passivo e l’agente', sub: 'ὑπό + genitivo', lemmas: ['ὑπό'], mix: SYN, tenses: ['pres'],
    teach: [
      { say: 'Chi compie l’azione in una frase passiva va con ὑπό + genitivo: è il complemento d’agente.' },
      { ex: ['Ὁ ἵππος ὑπὸ τοῦ δούλου λύεται.', 'Il cavallo è slegato dallo schiavo.'] }] },
  { id: 'mp3', title: 'I deponenti', sub: 'βούλομαι, γίγνομαι', lemmas: ['βούλομαι', 'γίγνομαι', 'μάχομαι', 'ἔρχομαι'], keys: '^pres\\.(ind|inf)\\.mp', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'Alcuni verbi hanno solo forme medio-passive ma significato attivo: βούλομαι, «voglio».' },
      { ex: ['Μάχονται οἱ στρατιῶται.', 'I soldati combattono.'] }] },
  { id: 'mpt', title: 'Prova d’unità', sub: 'medio-passivo', mix: TEST, test: true, tenses: ['pres'] },
  ] },
{ id: 'impf', title: 'L’imperfetto', say: 'Andiamo nel passato! L’imperfetto ha l’aumento, un segno all’inizio del verbo.',
  lessons: [
  { id: 'impf1', title: 'L’aumento sillabico', sub: 'ἔλυον', keys: '^impf\\.ind\\.act\\.', mix: VERB, tenses: ['impf'],
    teach: [
      { say: 'Davanti a consonante si aggiunge ἐ-: λύω → ἔλυον, «scioglievo».' },
      { conj: [['λύω', 'impf.ind.act']] },
      { say: 'Attento: ἔλυον è sia «io scioglievo» sia «essi scioglievano».' }] },
  { id: 'impf2', title: 'L’aumento temporale', sub: 'ἄγω → ἦγον', lemmas: ['ἐθέλω', 'ἀγγέλλω'], keys: '^impf\\.ind\\.act\\.', mix: VERB, tenses: ['impf'],
    teach: [
      { say: 'Davanti a vocale, la vocale si allunga: α ed ε diventano η, ο diventa ω.' },
      { conj: [['ἄγω', 'impf.ind.act'], ['ἔχω', 'impf.ind.act']] },
      { say: 'ἔχω fa εἶχον: un aumento irregolare da ricordare.' }] },
  { id: 'impf3', title: 'Medio-passivo ed essere', sub: 'ἐλυόμην, ἦν', keys: '^impf\\.ind\\.', mix: VERB, tenses: ['impf'],
    teach: [
      { conj: [['λύω', 'impf.ind.mp'], ['εἰμί', 'impf.ind.act']] },
      { ex: ['Ἦν ποτε ἐν τῇ νήσῳ ποιητής.', 'C’era una volta un poeta nell’isola.'] }] },
  { id: 'impft', title: 'Prova d’unità', sub: 'imperfetto', mix: TEST, test: true, tenses: ['pres', 'impf'] },
  ] },
{ id: 'contr', title: 'Verbi contratti', say: 'Nei verbi in -άω, -έω, -όω due vocali si fondono in una sola. Ti insegno il trucco.',
  lessons: [
  { id: 'contr1', title: 'I verbi in -έω', sub: 'ποιῶ, ποιεῖς', lemmas: ['ποιέω', 'φιλέω', 'οἰκέω', 'ζητέω'], keys: '^pres\\.ind\\.act\\.', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'ε + ε = ει, ε + ο = ου. Il resto si assorbe: ποιέ-ω → ποιῶ.' },
      { conj: [['ποιέω', 'pres.ind.act']] },
      { say: 'Se l’accento era sulla prima vocale, la contratta ha il circonflesso.' }] },
  { id: 'contr2', title: 'I verbi in -άω', sub: 'τιμῶ, τιμᾷς', lemmas: ['τιμάω', 'νικάω', 'ὁράω'], keys: '^pres\\.ind\\.act\\.', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'α + ε = ᾱ, α + ο = ω, α + ει = ᾳ.' },
      { conj: [['τιμάω', 'pres.ind.act']] }] },
  { id: 'contr3', title: 'I verbi in -όω', sub: 'δηλῶ, δηλοῖς', lemmas: ['δηλόω', 'ἐλευθερόω'], keys: '^pres\\.ind\\.act\\.', mix: VERB, tenses: ['pres'],
    teach: [
      { say: 'ο + ε = ου, ο + ει = οι, ο + η = ω.' },
      { conj: [['δηλόω', 'pres.ind.act']] }] },
  { id: 'contr4', title: 'Infinito e imperfetto', sub: 'τιμᾶν, ἐτίμων', keys: '^(pres\\.inf|impf\\.ind)', mix: VERB, tenses: ['pres', 'impf'],
    teach: [
      { forms: [['τιμάω', 'pres.inf.act', 'τιμάω'], ['ποιέω', 'pres.inf.act', 'ποιέω'], ['δηλόω', 'pres.inf.act', 'δηλόω']] },
      { conj: [['τιμάω', 'impf.ind.act'], ['ποιέω', 'impf.ind.act']] }] },
  { id: 'contrt', title: 'Prova d’unità', sub: 'verbi contratti', mix: TEST, test: true, tenses: ['pres', 'impf'] },
  ] },
{ id: 'd3', title: 'Terza declinazione', say: 'La terza declinazione è la più varia. La chiave è una sola: il tema si trova nel genitivo!',
  lessons: [
  { id: 'd3a', title: 'Temi in occlusiva', sub: 'φύλαξ, ἐλπίς, σῶμα', lemmas: ['φύλαξ', 'κῆρυξ', 'ἐλπίς', 'σῶμα', 'ὄνομα'], mix: NOM,
    teach: [
      { say: 'φύλαξ, φύλακος: togli -ος dal genitivo e hai il tema φυλακ-.' },
      { decl: ['φύλαξ', 'σῶμα'] },
      { say: 'Al dativo plurale la consonante si fonde con σ: φύλαξι, σώμασι.' }] },
  { id: 'd3b', title: 'Temi in -ντ e in nasale', sub: 'γέρων, ποιμήν', lemmas: ['γέρων', 'ἄρχων', 'λέων', 'ποιμήν', 'δαίμων', 'Ἕλλην'], mix: NOM,
    teach: [
      { decl: ['γέρων', 'ποιμήν'] },
      { say: 'γέρων fa γέρουσι al dativo plurale: ντ cade e la vocale si allunga.' }] },
  { id: 'd3c', title: 'Liquide e parole di famiglia', sub: 'πατήρ, ἀνήρ, γυνή', lemmas: ['ῥήτωρ', 'πατήρ', 'μήτηρ', 'θυγάτηρ', 'ἀνήρ', 'γυνή', 'παῖς'], mix: NOM,
    teach: [
      { decl: ['πατήρ', 'ἀνήρ'] },
      { say: 'Queste sono parole che userai ogni giorno: conviene impararle a memoria.' }] },
  { id: 'd3d', title: 'Temi in sigma e in vocale', sub: 'γένος, πόλις', lemmas: ['γένος', 'τεῖχος', 'ὄρος', 'πόλις', 'δύναμις'], mix: NOM,
    teach: [
      { say: 'Nei neutri in -ος il σ cade fra vocali e le vocali si contraggono: γένους.' },
      { decl: ['γένος', 'πόλις'] }] },
  { id: 'd3e', title: 'Temi in dittongo', sub: 'βασιλεύς, βοῦς, ναῦς', lemmas: ['βασιλεύς', 'ἱερεύς', 'βοῦς', 'ναῦς', 'ὕδωρ'], mix: NOM,
    teach: [{ decl: ['βασιλεύς'] }, { say: 'ναῦς e βοῦς sono irregolari: guarda la loro tabella nel Paradigma.' }] },
  { id: 'd3t', title: 'Prova d’unità', sub: 'terza declinazione', mix: TEST, test: true },
  ] },
{ id: 'agg2', title: 'Aggettivi II classe e gradi', say: 'Nuovi aggettivi dalla terza declinazione, e poi: più grande, il più grande!',
  lessons: [
  { id: 'agg2a', title: 'In -ης e in -ων', sub: 'ἀληθής, εὐδαίμων', lemmas: ['ἀληθής', 'σαφής', 'εὐδαίμων', 'σώφρων'], keys: '^a\\.pos\\.', mix: NOM,
    teach: [{ adj: 'ἀληθής' }, { say: 'Hanno due uscite: una per maschile e femminile, una per il neutro.' }] },
  { id: 'agg2b', title: 'In -υς e πᾶς', sub: 'ἡδύς, πᾶς', lemmas: ['ἡδύς', 'ταχύς', 'πᾶς'], keys: '^a\\.pos\\.', mix: NOM,
    teach: [{ adj: 'ἡδύς' }, { say: 'πᾶς vuol dire «tutto»: πάντες οἱ πολῖται, «tutti i cittadini».' }] },
  { id: 'agg2c', title: 'Comparativo e superlativo', sub: 'σοφώτερος, ἄριστος', keys: '^a\\.(cmp|sup)\\.', mix: ['analizza', 'frase', 'analizza', 'frase', 'scrivi', 'frase', 'analizza', 'frase', 'frase', 'scrivi'],
    teach: [
      { say: 'Comparativo -τερος, superlativo -τατος: σοφός, σοφώτερος, σοφώτατος.' },
      { p: `Irregolari: ${g('ἀγαθός')} → ${g('ἀμείνων')}, ${g('ἄριστος')}; ${g('μέγας')} → ${g('μείζων')}, ${g('μέγιστος')}.` },
      { ex: ['Ὁ ἥλιος μείζων ἐστὶ τῆς γῆς.', 'Il sole è più grande della terra.'] },
      { say: 'Il secondo termine di paragone va in genitivo, oppure con ἤ nello stesso caso.' }] },
  { id: 'agg2t', title: 'Prova d’unità', sub: 'seconda classe e gradi', mix: TEST, test: true },
  ] },
{ id: 'pron', title: 'Pronomi', say: 'Io, tu, egli, questo, quello: i pronomi fanno parlare le frasi.',
  lessons: [
  { id: 'pron1', title: 'Io e tu', sub: 'ἐγώ, σύ', lemmas: ['ἐγώ', 'σύ'], keys: '^p\\.', mix: VERB,
    teach: [{ pron: 'ἐγώ' }, { say: 'μου, μοι, με sono le forme enclitiche, non enfatiche.' }] },
  { id: 'pron2', title: 'αὐτός', sub: 'egli, stesso, il medesimo', lemmas: ['αὐτός'], keys: '^p\\.', mix: SYN,
    teach: [{ pron: 'αὐτός' }, { say: 'Nei casi obliqui è «lui, lei». Fuori dall’articolo è «stesso», dentro è «il medesimo».' }, { ex: ['Αὐτὸς ὁ βασιλεὺς ἐμάχετο.', 'Il re stesso combatteva.'] }] },
  { id: 'pron3', title: 'Questo e quello', sub: 'οὗτος, ἐκεῖνος', lemmas: ['οὗτος', 'ὅδε', 'ἐκεῖνος'], keys: '^p\\.', mix: SYN,
    teach: [{ pron: 'οὗτος' }, { say: 'Si mettono fuori dal gruppo articolo-nome: οὗτος ὁ ἀνήρ, «quest’uomo».' }, { ex: ['Οὗτος ὁ ἀνὴρ σοφός ἐστιν.', 'Quest’uomo è sapiente.'] }] },
  { id: 'pront', title: 'Prova d’unità', sub: 'pronomi', mix: TEST, test: true },
  ] },
{ id: 'rel', title: 'Relativo e interrogativo', say: 'Chi? Che cosa? Il quale… Con questi pronomi le frasi si allungano.',
  lessons: [
  { id: 'rel1', title: 'Il relativo', sub: 'ὅς, ἥ, ὅ', lemmas: ['ὅς'], keys: '^p\\.', mix: SYN,
    teach: [{ pron: 'ὅς' }, { say: 'Concorda con l’antecedente in genere e numero; il caso dipende dalla sua funzione.' }, { ex: ['Ὁ ἀνὴρ ὃν βλέπεις σοφός ἐστιν.', 'L’uomo che vedi è sapiente.'] }] },
  { id: 'rel2', title: 'τίς e τις', sub: 'chi? · qualcuno', lemmas: ['τίς', 'τις', 'οὐδείς'], keys: '^p\\.', mix: SYN,
    teach: [{ say: 'Con l’accento è una domanda: τίς; «chi?». Senza accento è un indefinito: τις, «qualcuno».' }, { ex: ['Τί λέγεις;', 'Che cosa dici?'] }, { ex: ['Λέγει τις τὴν ἀλήθειαν.', 'Qualcuno dice la verità.'] }] },
  { id: 'relt', title: 'Prova d’unità', sub: 'relativo e interrogativo', mix: TEST, test: true },
  ] },
{ id: 'fut', title: 'Il futuro', say: 'Guardiamo avanti: il futuro ha un σ prima della desinenza.',
  lessons: [
  { id: 'fut1', title: 'Il futuro sigmatico', sub: 'λύσω, γράψω', keys: '^fut\\.(ind|inf)\\.act', mix: VERB, tenses: ['fut'],
    teach: [{ conj: [['λύω', 'fut.ind.act']] }, { say: 'Con le consonanti: π + σ = ψ (γράψω), κ + σ = ξ (ἄξω), dentale + σ = σ (πείσω).' }] },
  { id: 'fut2', title: 'Futuro contratto e medio', sub: 'μενῶ, λήψομαι', lemmas: ['λαμβάνω', 'μανθάνω'], keys: '^fut\\.', mix: VERB, tenses: ['fut'],
    teach: [{ say: 'I verbi in λ, μ, ν, ρ hanno il futuro contratto: μενῶ, μενεῖς. Molti verbi hanno solo il futuro medio: λήψομαι, «prenderò».' }, { conj: [['μένω', 'fut.ind.act']] }] },
  { id: 'futt', title: 'Prova d’unità', sub: 'futuro', mix: TEST, test: true, tenses: ['pres', 'impf', 'fut'] },
  ] },
{ id: 'aor', title: 'L’aoristo', say: 'L’aoristo è il tempo del racconto: un’azione vista nel suo insieme.',
  lessons: [
  { id: 'aor1', title: 'Aoristo primo', sub: 'ἔλυσα', keys: '^aor\\.ind\\.(act|mid)\\.', mix: VERB, tenses: ['aor'],
    teach: [{ conj: [['λύω', 'aor.ind.act']] }, { say: 'Aumento + tema + σα: ἔλυσα, «sciolsi».' }] },
  { id: 'aor2', title: 'Aoristo secondo', sub: 'ἔλαβον, εἶπον', lemmas: ['βάλλω', 'ὁράω'], keys: '^aor\\.ind\\.act\\.', mix: VERB, tenses: ['aor'],
    teach: [{ say: 'Un tema diverso con le desinenze dell’imperfetto: λαμβάνω → ἔλαβον, λέγω → εἶπον, ὁράω → εἶδον.' }, { conj: [['λαμβάνω', 'aor.ind.act']] }] },
  { id: 'aor3', title: 'Aoristo passivo', sub: 'ἐλύθην', keys: '^(aor\\.ind\\.pass|futp\\.ind)', mix: VERB, tenses: ['aor'],
    teach: [{ conj: [['λύω', 'aor.ind.pass']] }, { say: 'Dal tema dell’aoristo passivo nasce anche il futuro passivo: λυθήσομαι.' }] },
  { id: 'aor4', title: 'Fuori dall’indicativo', sub: 'λῦσαι, λαβεῖν', keys: '^aor\\.(inf|imp)\\.', mix: VERB, tenses: ['aor'],
    teach: [{ forms: [['λύω', 'aor.inf.act', 'λύω'], ['λαμβάνω', 'aor.inf.act', 'λαμβάνω'], ['λύω', 'aor.inf.pass', 'λύω (passivo)']] }, { say: 'Fuori dall’indicativo l’aoristo non ha aumento e non indica il passato.' }] },
  { id: 'aort', title: 'Prova d’unità', sub: 'aoristo', mix: TEST, test: true },
  ] },
{ id: 'part', title: 'Il participio', say: 'Il participio è un aggettivo che viene da un verbo: è ovunque nei testi greci!',
  lessons: [
  { id: 'part1', title: 'Le forme', sub: 'λύων, λύσας, λυθείς', keys: '\\.part\\.', mix: VERB,
    teach: [{ tbl: { c: ['Tempo', 'Attivo', 'Medio-passivo'], r: [['presente', 'λύων, λύουσα, λῦον', 'λυόμενος'], ['aoristo', 'λύσας, λύσασα, λῦσαν', 'λυθείς (passivo)']] } }, { say: 'Si declinano come aggettivi: concordano con un nome.' }] },
  { id: 'part2', title: 'Attributivo e sostantivato', sub: 'οἱ φεύγοντες', mix: SYN,
    teach: [{ say: 'Con l’articolo si traduce con una relativa: οἱ φεύγοντες, «quelli che fuggono».' }, { ex: ['Οἱ φεύγοντες οὐ σῴζονται.', 'Quelli che fuggono non si salvano.'] }] },
  { id: 'part3', title: 'Congiunto e genitivo assoluto', sub: 'τῶν πολεμίων φευγόντων', mix: SYN,
    teach: [{ say: 'Nome e participio al genitivo, staccati dal resto: è il genitivo assoluto. Si traduce con «mentre» o «poiché».' }, { ex: ['Τῶν πολεμίων φευγόντων οἱ Ἕλληνες τὴν πόλιν ἔλαβον.', 'Mentre i nemici fuggivano, i Greci presero la città.'] }] },
  { id: 'partt', title: 'Prova d’unità', sub: 'participio', mix: TEST, test: true },
  ] },
{ id: 'inf', title: 'Infinito e infinitiva', say: '«Dico che…»: in greco si dice con l’accusativo e l’infinito.',
  lessons: [
  { id: 'inf1', title: 'Le forme dell’infinito', sub: 'λύειν, λύσειν, λῦσαι', keys: '\\.inf\\.', mix: VERB,
    teach: [{ forms: [['λύω', 'pres.inf.act', 'presente'], ['λύω', 'fut.inf.act', 'futuro'], ['λύω', 'aor.inf.act', 'aoristo'], ['λύω', 'pf.inf.act', 'perfetto']] }] },
  { id: 'inf2', title: 'Servili e impersonali', sub: 'δεῖ, βούλομαι + infinito', lemmas: ['δεῖ', 'κελεύω', 'νομίζω'], mix: SYN,
    teach: [{ ex: ['Δεῖ τοὺς πολίτας τοῖς νόμοις πείθεσθαι.', 'Bisogna che i cittadini obbediscano alle leggi.'] }] },
  { id: 'inf3', title: 'La proposizione infinitiva', sub: 'λέγει τοὺς πολεμίους φεύγειν', mix: SYN,
    teach: [{ say: 'Dopo «dire, credere»: soggetto in accusativo, verbo all’infinito. Traduci con «che».' }, { ex: ['Ὁ ἄγγελος λέγει τοὺς πολεμίους φεύγειν.', 'Il messaggero dice che i nemici fuggono.'] }] },
  { id: 'inft', title: 'Prova d’unità', sub: 'infinito', mix: TEST, test: true },
  ] },
{ id: 'mi', title: 'Verbi in -μι', say: 'Gli ultimi verbi speciali: niente vocale tematica, e un raddoppiamento con ι.',
  lessons: [
  { id: 'mi1', title: 'δίδωμι', sub: 'dare', lemmas: ['δίδωμι'], keys: '^(pres|aor)\\.ind\\.act\\.', mix: VERB,
    teach: [{ conj: [['δίδωμι', 'pres.ind.act'], ['δίδωμι', 'aor.ind.act']] }, { say: 'ἔδωκα al singolare, ma ἔδομεν al plurale.' }] },
  { id: 'mi2', title: 'τίθημι e ἵστημι', sub: 'porre, collocare', lemmas: ['τίθημι', 'ἵστημι'], keys: '^(pres|aor)\\.ind\\.act\\.', mix: VERB,
    teach: [{ conj: [['τίθημι', 'pres.ind.act'], ['ἵστημι', 'pres.ind.act']] }, { say: 'ἔστησα vuol dire «collocai», ἔστην «mi fermai».' }] },
  { id: 'mi3', title: 'δείκνυμι e δύναμαι', sub: 'mostrare, potere', lemmas: ['δείκνυμι', 'δύναμαι'], keys: '^pres\\.(ind|inf)\\.', mix: VERB,
    teach: [{ conj: [['δείκνυμι', 'pres.ind.act'], ['δύναμαι', 'pres.ind.mp']] }] },
  { id: 'mit', title: 'Prova d’unità', sub: 'verbi in -μι', mix: TEST, test: true },
  ] },
{ id: 'cong', title: 'Congiuntivo e ottativo', say: 'I modi della possibilità, del desiderio e dello scopo.',
  lessons: [
  { id: 'cong1', title: 'Le forme', sub: 'λύω, λύοιμι', keys: '\\.(subj|opt)\\.', mix: VERB,
    teach: [{ conj: [['λύω', 'pres.subj.act'], ['λύω', 'pres.opt.act']] }, { say: 'Congiuntivo: vocale lunga (ω, η). Ottativo: un ι (οι, αι).' }] },
  { id: 'cong2', title: 'Esortare, vietare, desiderare', sub: 'μένωμεν · μὴ φύγητε · εἴθε', lemmas: ['εἴθε'], mix: SYN,
    teach: [{ ex: ['Μένωμεν ἐν τῇ πόλει.', 'Rimaniamo nella città.'] }, { ex: ['Μὴ φύγητε, ὦ στρατιῶται.', 'Non fuggite, soldati.'] }] },
  { id: 'cong3', title: 'Finali e completive', sub: 'ἵνα, ὅπως, ὅτι', lemmas: ['ἵνα', 'ὅπως', 'ὅτι'], mix: SYN,
    teach: [{ say: 'ἵνα o ὅπως + congiuntivo: «affinché». Dopo un tempo storico può arrivare l’ottativo.' }, { ex: ['Ὁ διδάσκαλος λέγει ἵνα οἱ μαθηταὶ μανθάνωσιν.', 'Il maestro parla affinché gli allievi imparino.'] }] },
  { id: 'congt', title: 'Prova d’unità', sub: 'congiuntivo e ottativo', mix: TEST, test: true },
  ] },
{ id: 'sub', title: 'Subordinate', say: 'Quando, poiché, cosicché: le congiunzioni legano le frasi in un periodo.',
  lessons: [
  { id: 'sub1', title: 'Temporali', sub: 'ὅτε, ἐπεί, ὅταν', lemmas: ['ὅτε', 'ἐπεί', 'ὅταν', 'ἐάν'], mix: SYN,
    teach: [{ ex: ['Ὅτε ὁ βασιλεὺς ἀπέθανεν, οἱ Πέρσαι ἐφοβήθησαν.', 'Quando il re morì, i Persiani ebbero paura.'] }, { say: 'ὅταν ed ἐάν contengono ἄν e vogliono il congiuntivo.' }] },
  { id: 'sub2', title: 'Causali e consecutive', sub: 'διότι, ὥστε', lemmas: ['διότι', 'ὥστε'], mix: SYN,
    teach: [{ say: 'ὥστε + infinito: «cosicché, tanto da».' }, { ex: ['Ὁ στρατὸς οὕτως ἐμάχετο ὥστε τοὺς πολεμίους νικῆσαι.', 'L’esercito combatté in modo da vincere i nemici.'] }] },
  { id: 'subt', title: 'Prova d’unità', sub: 'subordinate', mix: TEST, test: true },
  ] },
{ id: 'perf', title: 'Perfetto e particelle', say: 'L’ultimo tratto di strada: il perfetto e le particelle che danno colore al greco.',
  lessons: [
  { id: 'perf1', title: 'Il perfetto', sub: 'λέλυκα, οἶδα', lemmas: ['οἶδα'], keys: '^pf\\.ind\\.', mix: VERB, tenses: ['pf'],
    teach: [{ conj: [['λύω', 'pf.ind.act'], ['οἶδα', 'pf.ind.act']] }, { say: 'Raddoppiamento + κα: λέλυκα, «ho sciolto». οἶδα è un perfetto, ma vuol dire «so».' }] },
  { id: 'perf2', title: 'μέν… δέ e le altre particelle', sub: 'μέν, δέ, γάρ, οὖν, ἄν', lemmas: ['μέν', 'δέ', 'γάρ', 'οὖν', 'ἄν'], mix: SYN,
    teach: [{ say: 'Sono posposte: stanno dopo la prima parola. μέν… δέ mettono in contrasto due membri.' }, { ex: ['Ὁ μὲν στρατηγὸς φεύγει, οἱ δὲ στρατιῶται μένουσιν.', 'Lo stratego fugge, i soldati invece rimangono.'] }] },
  { id: 'perft', title: 'Prova finale', sub: 'tutto il percorso', mix: TEST, test: true },
  ] },
];

/* frasi d'incoraggiamento di Ermes */
const CHEERS = ['Εὖ γε! Continua così.', 'Ottimo! Stai diventando un vero ἑρμηνεύς.', 'Bravo! Anche Socrate sarebbe d’accordo.', 'Perfetto! Gli dèi ti sono favorevoli.', 'Splendido lavoro!'];
const COMFORT = ['Nessun problema: gli errori sono maestri.', 'Quasi! Guarda bene le desinenze.', 'Coraggio: πάθει μάθος, si impara sbagliando.', 'Ripassiamolo insieme: tocca «Teoria».'];

root.HERM_COURSE = { UNITS, CHEERS, COMFORT };
if (typeof module !== 'undefined') module.exports = root.HERM_COURSE;
})(typeof window !== 'undefined' ? window : globalThis);
