# Critica di design: Hermeneus (24 ottobre 2026)

Revisione fatta con la skill *design-critique* del plugin Design, su schermate a 360 px e 1280 px, tema chiaro.

## Impressione generale

L'impianto c'è (percorso, lezioni brevi, mascotte, colori per famiglia di argomenti), ma l'esecuzione è da prototipo:
misure inventate caso per caso, troppi blocchi saturi che si contendono l'attenzione, e alcuni componenti rotti.
La correzione più importante è un sistema di misure unico (spazi, testo, raggi, altezze) applicato ovunque.

## Usabilità

| Problema | Gravità | Correzione |
|---|---|---|
| La scheda «Continua» in cima al percorso non ha stile: testo attaccato, Ermes sopra il testo, pulsanti di larghezza diversa | 🔴 Critico | Scheda vera: Ermes a sinistra, titolo e unità a destra, barra delle lezioni, pulsante a tutta larghezza |
| «Retroversione» va a capo a metà parola nelle schede della traduzione | 🔴 Critico | Schede a riga intera (icona, titolo, descrizione, freccia): i titoli non vanno mai a capo |
| Le tessere già usate lasciano buchi invisibili: il banco «salta» e una parola resta isolata | 🟡 Medio | Lasciare al loro posto una sagoma grigia della stessa misura, come segnaposto |
| Strumenti della lezione (Ascolta, Metodo, Aiuto, Scrivi) su due righe, sopra la risposta | 🟡 Medio | Pulsanti icona rotondi da 44 px su una riga, con etichetta per i lettori di schermo |
| La zona della risposta sono due righe sottili senza indicazioni | 🟡 Medio | Righe da quaderno ben visibili, almeno due, altezza fissa: la pagina non salta mentre si compone |
| Nella barra della risposta Ermes a figura intera da 48 px è illeggibile | 🟡 Medio | Sotto i 72 px mostrare solo il busto (inquadratura sul volto) |
| Palestra: sei gruppi di controlli diversi uno sotto l'altro, un fumetto di Ermes in più, chip orfani su una riga | 🟡 Medio | Tre blocchi chiari: Traduzione, Allenamento su misura (in una scheda), Altro; niente fumetto |
| Profilo: pulsanti del salvataggio di larghezze diverse, collegamento su due righe | 🟡 Medio | Due pulsanti affiancati della stessa larghezza, collegamento breve |
| Computer: la colonna centrale non è centrata nello spazio tra menu e pannello | 🟡 Medio | Colonna centrata con larghezza massima di 600 px |
| Percorso: stelline e puntini della strada si sovrappongono sotto i nodi | 🟢 Lieve | Strada come linea continua tenue dietro ai nodi, stelle in una pillola sotto il nodo |

## Gerarchia visiva

- **Cosa si nota per primo:** il pulsante viola «Continua», ed è giusto; ma subito dopo competono due schede viola piene
  (Versione, Retroversione) e il fregio rosa dell'unità. Troppi blocchi saturi nel primo schermo.
- **Ordine di lettura:** saluto → Continua → obiettivo → scorciatoie → percorso. Le scorciatoie vanno rese più quiete
  (fondo bianco, icona colorata) perché il percorso resti protagonista.
- **Tipografia:** dimensioni scelte una per una (0,7 / 0,72 / 0,74 / 0,76 / 0,78 / 0,8 / 0,82 / 0,84 / 0,85 / 0,86 /
  0,88 / 0,9 rem…). Serve una scala di sei o sette passi.

## Coerenza

| Elemento | Problema | Correzione |
|---|---|---|
| Spazi | margini ad hoc (6, 10, 14, 18, 22, 26 px) | scala da 4 px: 4, 8, 12, 16, 24, 32, 48 |
| Raggi | 10, 12, 13, 14, 16, 18, 20, 22, 24 px | tre raggi: 12 (piccoli), 16 (controlli e schede), 24 (fogli e riquadri grandi) |
| Altezze dei controlli | 34, 40, 42, 46, 50, 52, 56 px | tre altezze: 40, 48, 56 |
| Rilievo dei pulsanti | ombra inferiore di 3, 4, 5 o 7 px | 4 px per pulsanti e schede, 6 px per i nodi |
| Riquadri delle statistiche | numeri centrati a fine lezione, a sinistra nel profilo | un solo componente, centrato |

## Accessibilità

- **Contrasto:** testo bianco su viola 4,6:1 (va bene); bianco sul rosa delle unità 3,4:1 (va bene solo per testo
  grande in grassetto, quindi le etichette piccole nei fregi vanno ingrandite o scurite).
- **Aree da toccare:** strumenti della lezione e chip da 34–40 px, sotto i 44 px consigliati.
- **Leggibilità:** etichette maiuscole da 11 px troppo piccole; nessuna etichetta sotto i 12 px.

## Cosa funziona

- La mascotte nuova è riconoscibile (elmo alato, caduceo) e ha carattere.
- I colori per famiglia di argomenti aiutano a orientarsi nel percorso.
- Le opzioni a scelta multipla con il numero di tastiera sono chiare e comode.

## Priorità

1. **Sistema di misure unico** (spazi, testo, raggi, altezze, rilievo) applicato a tutto lo stile.
2. **Ricostruire i componenti rotti o sbilanciati:** scheda Continua, scorciatoie della traduzione, banco delle tessere,
   strumenti della lezione, barra della risposta.
3. **Ridurre il rumore:** meno blocchi saturi, niente fumetti superflui, percorso più pulito, impaginazione del computer centrata.
