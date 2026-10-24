# Sistema di design di Hermeneus

Fatto con la skill *design-system* del plugin Design. Tutte le misure di `src/app.css` derivano da questi gettoni:
un valore scritto a mano è un errore.

## Verifica di partenza

**Componenti esaminati:** 24 · **Problemi:** 6 categorie · **Punteggio:** 38/100

| Categoria | Gettoni definiti | Valori scritti a mano trovati |
|---|---|---|
| Colori | 40 (palette pastello, temi chiaro e scuro) | 14 colori fissi nei componenti |
| Spazi | 0 | margini e spaziature da 2 a 26 px senza scala |
| Testo | 0 | 40 dimensioni diverse |
| Raggi | 2 | 16 raggi diversi |
| Altezze dei controlli | 0 | 13 altezze diverse |
| Stili nel codice JS | — | 60 attributi `style` |

## Gettoni

### Spazi (base 4 px)
`--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 20 · `--sp-6` 24 · `--sp-7` 32 · `--sp-8` 40 · `--sp-9` 48

Regola: dentro un componente 8–16, tra componenti 16–24, tra sezioni 32–40.

### Testo
| Gettone | Misura | Uso |
|---|---|---|
| `--fs-xs` | 12 px | etichette maiuscole, note sotto i grafici |
| `--fs-sm` | 14 px | testo secondario, descrizioni |
| `--fs-md` | 16 px | testo normale, pulsanti |
| `--fs-lg` | 18 px | titoli di scheda, opzioni |
| `--fs-xl` | 22 px | titoli di esercizio, titoli di sezione |
| `--fs-2xl` | 28 px | titoli di pagina, frase greca |
| `--fs-3xl` | 40 px | forma greca isolata, titolo di fine lezione |

Pesi: 400 testo, 500 etichette, 600 titoli di scheda, 700 titoli e pulsanti. Interlinea 1,5 (testo) e 1,2 (titoli).
Il greco usa sempre Gentium Plus (frasi) o GFS Didot (titoli e lettere isolate), mai in grassetto.

### Raggi
`--r-sm` 10 (tasti, piccoli contrassegni) · `--r-md` 16 (pulsanti, schede, opzioni, tessere) · `--r-lg` 24 (schede in evidenza, fogli, finestre) · `--r-pill` (chip, barre)

### Altezze dei controlli
`--h-sm` 40 (pulsanti secondari, chip) · `--h-md` 48 (pulsanti, opzioni) · `--h-lg` 56 (azione principale di una schermata)
Area minima da toccare: 44 × 44 px.

### Rilievo
Pulsanti, opzioni e tessere hanno un bordo inferiore di `--depth` 4 px; i nodi del percorso 6 px. Premendo, il rilievo sparisce.
Ombre: `--sh-1` (schede in evidenza) e `--sh-2` (finestre e popup).

### Larghezze
Colonna principale 600 px; lezione 640 px; pannello laterale 340 px; menu laterale 240 px.

## Componenti

| Componente | Varianti | Stati | Note |
|---|---|---|---|
| Pulsante `.btn` | principale, `.ok`, `.err`, `.ghost` (contorno), `.on-color` (su fondo colorato) · misure `.small`, normale, `.big` | normale, premuto, disattivato | testo maiuscolo 14–16 px, icona 20 px |
| Pulsante icona `.iconbtn` / `.tool` | — | normale, attivo (`aria-pressed`) | 44 px, etichetta per i lettori di schermo |
| Scheda `.card` | normale, `.hero` (in evidenza) | — | bordo 2 px, raggio 16 (hero 24) |
| Chip `.chips button` | — | normale, selezionato | 40 px, pillola |
| Segmenti `.seg`, `.levels` | — | normale, selezionato | stessa famiglia visiva |
| Opzione `.opt` | testo, greco | normale, scelta, giusta, sbagliata | 56 px, numero da tastiera |
| Tessera `.tile` | italiano, greco | normale, usata (sagoma), premuta | 48 px |
| Nodo del percorso `.node` | lezione, prova | bloccato, aperto, attuale, completato | 72 px, rilievo 6 |
| Barra della risposta `.ov-foot` | neutra, giusta, sbagliata | — | Ermes a busto, pulsante a tutta larghezza |
| Riga di elenco `.rowbtn` | — | — | 64 px, icona tonda 40 |
| Riquadro statistico `.stat` | — | — | numero centrato 22 px, etichetta 12 px |

## Da fare e da non fare

| Fare | Non fare |
|---|---|
| Un solo blocco a tinta piena per schermata, oltre al fregio dell'unità | Più schede viola piene una accanto all'altra |
| Allineare a sinistra testo e titoli; centrare solo schermate «evento» (fine lezione, benvenuto) | Centrare paragrafi lunghi |
| Usare i gettoni anche negli attributi del JS, tramite classi | Scrivere `style="margin-top:…"` nel markup |
