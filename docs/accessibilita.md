# Verifica di accessibilità: Hermeneus (24 ottobre 2026)

**Standard:** WCAG 2.1 AA · fatta con la skill *accessibility-review* del plugin Design, con misure automatiche nel browser.

## Riepilogo

**Problemi trovati:** 7 · **Critici:** 0 · **Importanti:** 4 (corretti) · **Lievi:** 3

## Contrasto dei colori (tema chiaro, dopo le correzioni)

| Elemento | Colori | Rapporto | Richiesto | Esito |
|---|---|---|---|---|
| Testo | inchiostro su fondo | 14,1:1 | 4,5:1 | ✅ |
| Testo secondario | grigio su fondo | 5,4:1 | 4,5:1 | ✅ |
| Pulsante principale | bianco su viola | 5,5:1 | 4,5:1 | ✅ (prima 4,4) |
| Risposta giusta | verde su verde chiaro | 4,7:1 | 4,5:1 | ✅ (prima 3,8) |
| Risposta sbagliata | rosso su rosa | 4,7:1 | 4,5:1 | ✅ (prima 3,8) |
| Opzione scelta | blu su azzurro | 4,9:1 | 4,5:1 | ✅ (prima 3,5) |
| Avviso giallo | ocra su giallo chiaro | 5,1:1 | 4,5:1 | ✅ (prima 4,2) |
| Intestazioni delle unità | bianco sui colori delle famiglie | 4,6–5,5:1 | 4,5:1 | ✅ (prima 3,97 sull'arancio) |

Nel tema scuro tutti i rapporti sono tra 5,0 e 15,6:1.

## Risultati

| # | Problema | Criterio | Gravità | Stato |
|---|---|---|---|---|
| 1 | Viola, verde, rosso, blu e ocra sotto 4,5:1 sul loro fondo | 1.4.3 | 🟡 Importante | Corretto: colori scuriti |
| 2 | Bianco sull'arancio delle unità di sintassi 3,97:1 | 1.4.3 | 🟡 Importante | Corretto |
| 3 | Contorni di tessere e opzioni quasi invisibili (1,3:1) | 1.4.11 | 🟡 Importante | Migliorato: contorno più scuro e bordo inferiore in rilievo |
| 4 | Strumenti della lezione da 34 px | 2.5.5 | 🟡 Importante | Corretto: pulsanti rotondi da 44 px con nome |
| 5 | Collegamento «Vai al contenuto» invisibile anche col fuoco | 2.4.1 | 🟢 Lieve | Corretto: compare quando riceve il fuoco |
| 6 | Parole greche brevi nella frase (es. «ὁ») larghe 25 px | 2.5.8 | 🟢 Lieve | Accettato: sono parole nel testo, eccezione «in linea» |
| 7 | Le finestre di conferma non trattengono il fuoco | 2.1.2 | 🟢 Lieve | Da fare: si chiudono comunque con Esc |

## Controlli automatici

- Ogni pulsante, campo e menu ha un nome leggibile dai lettori di schermo (Percorso, Palestra, Teoria, Lessico, Profilo, lezioni).
- Le immagini di Ermes hanno il nome «Ermes, la tua guida»; le icone decorative sono nascoste ai lettori di schermo.
- Punti di riferimento presenti: `main`, due `nav` (menu laterale e barra in basso), `header`.
- Tastiera: Tab raggiunge tutti i controlli; 1–5 scelgono le opzioni; Invio controlla e prosegue; Esc chiude popup, fogli e finestre.

## Da verificare a mano

Prova con VoiceOver (iPhone) e TalkBack (Android) e zoom al 200%: non eseguibili in questo ambiente.
