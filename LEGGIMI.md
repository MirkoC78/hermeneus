# Hermeneus (Ἑρμηνεύς)

Corso guidato e palestra di traduzione greco ↔ italiano per il biennio del liceo classico. Gemella di Verto per
architettura, con contenuti e identità visiva propri. Tutto gira sul dispositivo: nessun account, nessuna IA, nessun dato inviato.

Dalla versione 2 lo studente segue un **percorso**: 22 unità (una per argomento), 91 lezioni brevi con spiegazioni
di Ermes, domande di controllo dopo ogni tabella e una prova a fine unità (70% per passare). Ogni lezione ha un
perimetro preciso: argomenti fino a quell'unità, solo il vocabolario già incontrato, al massimo una parola nuova
per frase (segnalata), nessuna nelle prove. La **palestra** permette di scegliere argomento, tipo di esercizi e se
usare solo le parole già incontrate.

## Consegne

- `dist/hermeneus.html`: file unico autonomo (caratteri incorporati), si apre in qualunque browser, anche offline.
- `dist/sito/`: pacchetto da pubblicare su un hosting statico HTTPS (index.html, manifest, service worker, icone, licenze).
- `tools/pubblica.sh`: invia il progetto su GitHub e copia `dist/sito/` nel ramo `gh-pages`, da cui GitHub Pages serve il sito. Prima ricostruire con `node build.js`, eseguire i test e fare il commit.
- `campione-frasi.md`: 50 frasi generate a campione, con traduzioni accettate.

## Grafica

- `docs/sistema-design.md`: scale di spazi, testo, raggi, altezze e componenti. Ogni misura di `src/app.css` viene da lì.
- `docs/critica-design.md` e `docs/accessibilita.md`: revisioni fatte con il plugin Design (critica e WCAG 2.1 AA).

## Comandi

```
node build.js            # ricostruisce dist/
node test/run-all.js     # tutti i test
```

## Struttura

| File | Contenuto |
|---|---|
| `src/greek.js` | Unicode politonico (NFC, tonos = oxia, sigma finale), sillabe, quantità, accento recessivo e persistente, contrazione, lettura erasmiana |
| `src/morph.js` | motore morfologico: genera le forme dai temi dichiarati e indicizza forma → analisi con gli argomenti richiesti |
| `src/lexicon.js` | lessico (562 lemmi, circa 45.800 forme): 260 nomi, 67 aggettivi, 14 pronomi, 133 verbi con temi, aumenti e raddoppiamenti dichiarati (irregolari scritti per intero), 87 parole invariabili |
| `src/sentence.js` | accenti di frase (grave, enclitiche, proclitiche, ν efelcistico, οὐ/οὐκ/οὐχ, ἐκ/ἐξ), ordine libero delle parole, controllo delle risposte |
| `src/topics.js` | i 22 argomenti con la teoria; le tabelle dei paradigmi le genera il motore |
| `src/bank.js` | 221 frasi verificate, metodo di costruzione, 20 massime, gradi |
| `src/semantic.js`, `src/generator.js` | lessico semantico e generatore offline con traduzione italiana |
| `src/italian.js` | morfologia italiana (ripresa da Verto) |
| `src/course.js` | il percorso: unità, lezioni, perimetri (lemmi, forme ammesse, tempi), schede di spiegazione |
| `src/lessons.js` | motore delle lezioni: costruisce gli esercizi dentro il perimetro di ogni lezione e la pratica libera |
| `src/app.js`, `src/app.css` | interfaccia: percorso, lezioni con Ermes, palestra, teoria, lessico, profilo |
## Ordine del programma

L'elenco richiesto, con tre ritocchi: imperativo presente nei punti 4 e 8, imperativo aoristo al 16;
futuro passivo al 16 (si forma dal tema dell'aoristo passivo); duale escluso. Le particelle μέν, δέ, γάρ, οὖν, ἄν
restano al punto 22 come nell'elenco: prima di allora le frasi usano καί e ἀλλά.

## Notazione dei dati

Nel lessico «_» dopo α ι υ segna la vocale lunga quando decide l'accento (νί_κη → νῖκαι), «+» un tema contratto
(τι_μα+), «|» il confine del preverbio (ἀπο|κτειν, per l'aumento e il limite dell'accento).
