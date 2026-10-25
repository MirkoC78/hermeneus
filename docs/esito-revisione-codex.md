# Hermeneus: esito degli interventi sul rapporto di revisione

Data: 25 ottobre 2026. Commit: `3f42c3f` (HERM-001, 002, 005) e `34604c6` (HERM-003, 004, 006–012).
Il pacchetto da pubblicare è `dist/sito/`; la versione in un solo file è `dist/hermeneus.html`.

Vincoli rispettati: tutto funziona sul dispositivo, senza account, IA o servizi a pagamento. Non viene inviato nessun dato degli studenti; il Wikizionario resta l’unico collegamento esterno ed è facoltativo. L’ordine del lessico non è cambiato (gli errori salvati usano `E.LEX.indexOf`), così come il formato dei salvataggi (v2), il codice di ripristino (versione 1), la tastiera politonica e la grafica.

## Test

`node test/run-all.js`: tutti superati.

| Gruppo | Contenuto | Esito |
|---|---|---|
| motore, banca, teoria, generatore, percorso, codice | test già presenti | invariati, tutti superati (10.000 frasi generate, 91 lezioni, 2000 codici) |
| `check.test.js` (nuovo) | correzione delle risposte: italiano, iota, οὐ/ἐκ | 54 verifiche |
| `context.test.js` (nuovo) | analisi nel contesto delle 221 frasi della banca | 0 errori, 0 casi da rivedere |
| `state.test.js` (nuovo) | file, codice e salvataggio: valori non validi, riparazione, andata e ritorno | 673 verifiche |
| `sw.test.js` (nuovo) | cache del service worker su CacheStorage simulata | 14 verifiche; sul vecchio `sw.js` ne falliscono 9 |
| `revision.test.js` (nuovo) | congiuntivo, palestra sulle lezioni raggiunte, testi corretti | 330 verifiche |

Verifiche nel browser (Chromium del pannello di Claude, server locale): importazione, salvataggio guasto, cache, avvio senza rete, focus con Tab ed Escape, larghezze 320/360/390 px con testo al 100% e al 200%, benvenuto, guida alla tastiera.

## Interventi

### HERM-001 — Versione italiana accettata in modo troppo largo
- **Prima:** «La donna ama l’uomo» per *Ὁ ἀνὴρ τὴν γυναῖκα φιλεῖ* veniva accettata da sola, perché le parole erano le stesse.
- **Dopo:** si accetta da sola solo una soluzione prevista: uguale a meno di maiuscole, apostrofi e punteggiatura; se mancano solo gli accenti italiani, viene accettata con un avviso. Tutto il resto va al confronto guidato, con tre domande (chi agisce, verbo, complementi e negazione) e i pulsanti «Ho sbagliato» / «Era giusta». Il bonus per la risposta scritta non vale quando decide lo studente. Il nuovo modulo è `src/check.js`.
- **Limite:** il confronto guidato resta un’autovalutazione e non controlla il significato.

### HERM-002 — Analisi grammaticale fuori contesto
- **Prima:** in b17 θύρας risultava genitivo singolare e φυλάττετε indicativo, accanto alla traduzione imperativa; in b96 βοῦς nominativo singolare, accanto a τούς.
- **Dopo:** `contextualize` in `src/sentence.js` sceglie l’analisi in base al contesto: reggenza, concordanza con l’articolo, vocativo solo dopo ὦ, modo, soggetto, accordo, persona del verbo. Per sette frasi che le regole non sanno decidere ci sono letture dichiarate (`READINGS` in `bank.js`). La scheda mostra «Analisi nella frase» e, a parte, «Da sola può essere anche».
- **Test:** b17 è acc. plurale con imperativo, b96 acc. plurale; i 14 verbi con 1ª singolare uguale alla 3ª plurale vanno d’accordo con il soggetto.
- **Limite:** le regole sono tarate sulle frasi attuali. Se se ne aggiungono, il test elenca quelle da ricontrollare.

### HERM-003 — Importazione non valida
- **Prima:** importando `{"v":2,"onboarded":true,"xp":999,"course":{"unlocked":-1}}` compariva «File non valido.», ma memoria e salvataggio avevano già 999 XP e al ricaricamento la pagina restava vuota.
- **Dopo:** `src/state.js` usa lo stesso controllo per file, codice di ripristino e salvataggio del browser. Verifica struttura, tipi, valori ammessi, interi finiti e intervalli, e costruisce sempre uno stato nuovo.
  - Un file con un solo dato sbagliato viene rifiutato per intero: una finestra elenca i dati non accettati e precisa che i progressi non sono cambiati.
  - Un file valido chiede conferma prima di sostituire i progressi.
  - Un salvataggio già guasto si ripara campo per campo e il resto si conserva. L’originale resta in `hermeneus.v1.originali` (ultime tre copie): dal Profilo si può scaricare o eliminare. All’avvio compare un avviso.
- **Browser:**
  - con il file del rapporto, XP (123) e salvataggio restano identici e il ricaricamento funziona;
  - una copia valida torna con XP, stelle ed errori;
  - un salvataggio guasto si apre, conserva i 999 XP e il nome, riporta la posizione a 0 e mostra la copia originale nel Profilo.
- **Test:** valori negativi, oltre l’ultima lezione, decimali, stringhe, null, NaN, infinito, oggetti incompleti, versioni sconosciute, 30 campi sbagliati, riparazione, nessuna modifica ai dati letti, 300 andate e ritorni del file e 300 del codice.

### HERM-004 — Il service worker cancellava cache di altre app
- **Prima:** all’attivazione si cancellava ogni cache diversa da quella corrente, compresa `unrelated-offline-probe`.
- **Dopo:** il nome è `hermeneus@<cartella>@<versione>`. Si cancellano solo le versioni precedenti di questa cartella e le vecchie `hermeneus-xxxxxxxxxx` che contengono la pagina di questa cartella. Le risposte si leggono solo dalla cache di questa installazione.
- **Browser:** restano `unrelated-offline-probe`, `verto-v7` e la vecchia cache di un’altra cartella; sparisce solo quella di questa. Con il server spento la pagina si apre dalla cache.
- **Limite:** l’avvio offline è stato provato dopo una prima visita. Mancano prove su telefono e su un hosting reale in sottocartella.

### HERM-005 — Iota sottoscritto e forme contestuali
- Lo iota sottoscritto conta sempre, in entrambe le modalità.
- οὐ/οὐκ/οὐχ e ἐκ/ἐξ si controllano sulla parola che segue: in modalità rigorosa sono errori, in graduale vengono segnalati.
- ρ iniziale conta come consonante (niente οὐκ ῥ…). Gli avvisi distinguono iota, forma, accenti e spiriti.

### HERM-006 — Focus fuori dalla lezione
- **Dopo:**
  - Gli strati sotto lezione, pannelli e finestre diventano inerti, compreso «Vai al contenuto».
  - Alla chiusura il focus torna al comando che li aveva aperti, anche se la pagina è stata ridisegnata.
  - A ogni nuovo esercizio il focus va alla consegna, oppure al campo di scrittura con mouse e tastiera.
  - Escape chiude, nell’ordine, finestrella della parola, finestra e pannello; dentro la lezione chiede se uscire.
  - Nelle conferme distruttive il focus parte da «Annulla».
- **Browser:**
  - Tab ×12 e Maiusc+Tab ×6 restano dentro la lezione;
  - nella finestra di uscita Tab resta nella finestra;
  - Escape la chiude e riporta il focus alla consegna;
  - uscendo, il focus torna su «Continua».
- **Limite:** nessuna prova con lettori di schermo (VoiceOver, TalkBack, NVDA). Non è un audit WCAG.

### HERM-007 — Spiegazioni e soluzioni modello
- **Alfabeto:** ὅρος/ὄρος differiscono per lo spirito; ὁ/ὅ hanno lo stesso spirito e si distinguono per l’accento.
- **Preposizioni:** la tabella è presentata come «usi trattati nel corso», con una nota su περί con il dativo.
- **Metodo:** il numero dei passi si ricava dal metodo (8). «Tanti verbi, tante proposizioni» diventa un primo orientamento che rimanda a infiniti e participi.
- **Imperativo aoristo:** «azione vista nel suo insieme, senza valore di passato».
- **Teoria:** le tabelle sono «generate dal motore morfologico a partire dal lessico del corso». Il benvenuto dice «per cominciare, punta a dieci minuti al giorno».
- **Generatore:** dopo νομίζω (ritenere, credere) l’italiano usa il congiuntivo («ritengono che la figlia ascolti»); dopo λέγω (dire) resta l’indicativo.
- **Test:** 41 completive con verbo di opinione tutte al congiuntivo, 20 con «dire» all’indicativo.
- **Limite:** le altre reggenze italiane non sono state riviste una per una. Le soluzioni modello meritano una lettura da parte di un docente.

### HERM-008 — Voce sintetica
- La lettura ad alta voce è ora descritta come approssimata (impostazioni, informazioni, scheda dell’alfabeto). Si dice anche cosa non distingue: spirito aspro, θ/τ, χ/κ, υ/ου, vocali lunghe e brevi.
- La sintesi vera e propria non è cambiata. Nessun ascolto su dispositivi reali.

### HERM-009 — Ripasso, ricompense, parole incontrate
1. In modalità graduale i segni sbagliati «non contano come errore, ma valgono qualche punto in meno». Lo dicono impostazioni, benvenuto e avvisi.
2. Nel ripasso entrano anche gli errori su lettere, accenti, lettura e concordanza. Gli errori di soli segni in modalità graduale non vi entrano, perché sono segnalazioni e non errori.
3. Lessico e palestra usano le parole delle lezioni raggiunte (fino a quella attuale, più quelle già svolte), non più tutte le lezioni delle unità aperte. È stato corretto anche un ripiego che proponeva forme di parole non ancora viste: per esempio πορεύομαι nella palestra a metà dell’unità del medio-passivo.
4. Gli intervalli di ripetizione non sono cambiati.

### HERM-010 — Barra inferiore a 320 px
- **Prima:** il primo pulsante partiva da x = −10 e l’ultimo arrivava a 330.
- **Dopo:**
  - Le cinque celle si restringono con lo schermo e le etichette si possono troncare (a 320 px misurano almeno 62 px).
  - Pulsanti, controlli a segmenti, titoli delle unità, statistiche e insegne vanno a capo invece di uscire dallo schermo.
- **Browser:** su tutte e cinque le pagine, a 320, 360 e 390 px, con testo al 100% e al 200%, niente scorrimento orizzontale e barra tutta visibile.
- **Limite:** le aree sicure sono gestite solo via CSS (`env()`); manca una prova su iPhone.

### HERM-011 — Benvenuto e tastiera
- **Benvenuto:** «Avanti» resta sempre visibile in fondo ed è già pronto per «comincio da zero», con una frase che lo spiega. Nella prova a 390 × 844 il pulsante si trova a 712 px dall’alto, prima era a circa 2359 px.
- **Tastiera:** una guida compare una sola volta (lettera, poi segni, poi cancellazione) e ricorda che va bene anche una tastiera greca già installata. Che sia stata vista resta nei progressi. Nel browser la sequenza α + ᾿ + ´ produce proprio ἄ, e ⌫ cancella ῳ per intero.
- **Limite:** nessuna prova con principianti né prova tattile su telefono. La dimensione dei tasti non è cambiata.

### HERM-012 — Uscita dalla lezione
- Il testo ora dice cosa resta e cosa si perde: le risposte contano per le statistiche e gli errori restano da ripassare; punti e stelle arrivano solo a fine lezione, che poi ricomincia da capo.
- Non c’è una ripresa a metà lezione: si è scelto di descrivere il comportamento.

### HERM-013 — Proposte didattiche
- Fatta la griglia di controllo nel confronto guidato.
- Non affrontati: microletture, progressione degli accenti in alf4, segnalazione delle anteprime (art1, inf1), contrasti diagnostici accanto alla soluzione.

## Compatibilità
- I salvataggi validi delle versioni precedenti si caricano senza avvisi: il test di andata e ritorno lo verifica.
- I campi nuovi sono facoltativi: `coach` e gli errori di tipo `x`.
- Il codice di ripristino non è cambiato.
- Al primo aggiornamento il service worker sostituisce la vecchia cache di questa cartella con quella nuova.

## Non verificato
- iPhone e Safari reali, Android, installazione come app su telefono.
- Lettori di schermo; conformità WCAG completa, che non viene dichiarata.
- Ascolto della voce sintetica su dispositivi.
- Efficacia didattica: richiede una prova con studenti. XP, serie e completamento non la misurano.
