# Hermeneus (Ἑρμηνεύς)

Palestra di traduzione greco ↔ italiano per il biennio del liceo classico. Gemella di Verto per architettura,
con contenuti e identità visiva propri. Tutto gira sul dispositivo: nessun account, nessuna IA, nessun dato inviato.

## Consegne

- `dist/hermeneus.html`: file unico autonomo (caratteri incorporati), si apre in qualunque browser, anche offline.
- `dist/sito/`: pacchetto da pubblicare su un hosting statico HTTPS (index.html, manifest, service worker, icone, licenze).
- `campione-frasi.md`: 50 frasi generate a campione, con traduzioni accettate.

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
| `src/app.js`, `src/app.css` | interfaccia |

## Ordine del programma

L'elenco richiesto, con tre ritocchi: imperativo presente nei punti 4 e 8, imperativo aoristo al 16;
futuro passivo al 16 (si forma dal tema dell'aoristo passivo); duale escluso. Le particelle μέν, δέ, γάρ, οὖν, ἄν
restano al punto 22 come nell'elenco: prima di allora le frasi usano καί e ἀλλά.

## Notazione dei dati

Nel lessico «_» dopo α ι υ segna la vocale lunga quando decide l'accento (νί_κη → νῖκαι), «+» un tema contratto
(τι_μα+), «|» il confine del preverbio (ἀπο|κτειν, per l'aumento e il limite dell'accento).
