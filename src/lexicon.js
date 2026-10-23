/* HERMENEUS — lessico di base del biennio (attico).
   Quantità: «_» dopo α ι υ lunghe quando decide l'accento (χώρα_ = χώρᾱ). «|» separa il preverbio.
   NOMI      nominativo|genitivo|genere|significato|opzioni
             opzioni: vA (vocativo in -α), voc=…, novoc, sg, pl, prop (nome proprio), tpl=genos|polis|eus|es,
                      acc=…, gpl=…, dpl=…, full=sing ; plur (5 casi: nom gen dat acc voc, «-» = manca), decl=…
   AGGETTIVI maschile|femminile (vuoto = due uscite)|neutro|significato|opzioni (cmp=…, sup=…, tpl=es|us|on, pronN, full=…)
   VERBI     temi dichiarati: pres (+ = contratto), impf (aumentato), fut, aor1/aor1a, aor2/aor2a, aorp/aorpa,
             pf (perfetto attivo, con raddoppiamento), pfm (perfetto medio-passivo, solo temi in vocale);
             dep m|p (deponente medio | passivo), futM (futuro solo medio), futMid/aorMid (anche medio),
             aorM (aoristo solo medio), ox (imperativo aoristo ossitono), noMP, no (forme escluse), x (forme scritte per intero) */
(function (root) {
const NOUNS = `
# ---- Prima declinazione: -α puro (lungo)
χώρα_|χώρας|f|regione, paese, terra
ἡμέρα_|ἡμέρας|f|giorno
οἰκία_|οἰκίας|f|casa
σοφία_|σοφίας|f|sapienza
φιλία_|φιλίας|f|amicizia
θύρα_|θύρας|f|porta
ἀγορά_|ἀγορᾶς|f|piazza, mercato
στρατιά_|στρατιᾶς|f|esercito
θεά_|θεᾶς|f|dea
αἰτία_|αἰτίας|f|causa, colpa
ἐκκλησία_|ἐκκλησίας|f|assemblea
ἐλευθερία_|ἐλευθερίας|f|libertà
εὐδαιμονία_|εὐδαιμονίας|f|felicità
βασιλεία_|βασιλείας|f|regno
ἀνδρεία_|ἀνδρείας|f|coraggio
ἡσυχία_|ἡσυχίας|f|tranquillità, quiete
πέτρα_|πέτρας|f|roccia, pietra
ἑσπέρα_|ἑσπέρας|f|sera
# ---- -α puro breve
ἀλήθεια|ἀληθείας|f|verità
μοῖρα|μοίρας|f|destino, sorte
γέφυρα|γεφύρας|f|ponte
μάχαιρα|μαχαίρας|f|spada, coltello
# ---- -α impuro
θάλαττα|θαλάττης|f|mare
γλῶττα|γλώττης|f|lingua
δόξα|δόξης|f|fama, opinione
μοῦσα|μούσης|f|musa
τράπεζα|τραπέζης|f|tavola, mensa
μέλιττα|μελίττης|f|ape
τόλμα|τόλμης|f|audacia
ἅμαξα|ἁμάξης|f|carro
ῥίζα|ῥίζης|f|radice
# ---- -η
τιμή|τιμῆς|f|onore
ψυχή|ψυχῆς|f|anima
γνώμη|γνώμης|f|opinione, parere
νί_κη|νί_κης|f|vittoria
κώμη|κώμης|f|villaggio
φωνή|φωνῆς|f|voce
ἀρετή|ἀρετῆς|f|virtù, valore
εἰρήνη|εἰρήνης|f|pace
ἐπιστολή|ἐπιστολῆς|f|lettera
κεφαλή|κεφαλῆς|f|testa
δίκη|δίκης|f|giustizia, processo
μάχη|μάχης|f|battaglia
τέχνη|τέχνης|f|arte, tecnica
βουλή|βουλῆς|f|consiglio, decisione
πύλη|πύλης|f|porta (della città)
ἀρχή|ἀρχῆς|f|inizio, comando
ὀργή|ὀργῆς|f|ira, collera
σελήνη|σελήνης|f|luna
ἡδονή|ἡδονῆς|f|piacere
φυγή|φυγῆς|f|fuga, esilio
λύ_πη|λύ_πης|f|dolore
τύχη|τύχης|f|sorte, fortuna
σκηνή|σκηνῆς|f|tenda, scena
νεφέλη|νεφέλης|f|nuvola
ὕλη|ὕλης|f|bosco, legname|sg
γῆ|γῆς|f|terra|full=γῆ γῆς γῇ γῆν γῆ,decl=1
Ἀθῆναι|Ἀθηνῶν|f|Atene|full=- - - - - ; Ἀθῆναι Ἀθηνῶν Ἀθήναις Ἀθήνας Ἀθῆναι,decl=1,prop
Θῆβαι|Θηβῶν|f|Tebe|full=- - - - - ; Θῆβαι Θηβῶν Θήβαις Θήβας Θῆβαι,decl=1,prop
# ---- maschili
πολί_της|πολί_του|m|cittadino|vA
στρατιώτης|στρατιώτου|m|soldato|vA
ναύτης|ναύτου|m|marinaio|vA
δεσπότης|δεσπότου|m|padrone, signore|voc=δέσποτα
κριτής|κριτοῦ|m|giudice|vA
μαθητής|μαθητοῦ|m|allievo, discepolo|vA
ποιητής|ποιητοῦ|m|poeta|vA
οἰκέτης|οἰκέτου|m|servo, domestico|vA
τοξότης|τοξότου|m|arciere|vA
ὁπλί_της|ὁπλί_του|m|oplita|vA
δικαστής|δικαστοῦ|m|giudice (giurato)|vA
νεανίας|νεανίου|m|giovane
ταμίας|ταμίου|m|tesoriere
Πέρσης|Πέρσου|m|Persiano|vA,prop
Ξέρξης|Ξέρξου|m|Serse|sg,prop
Μιλτιάδης|Μιλτιάδου|m|Milziade|sg,prop
Ἀλκιβιάδης|Ἀλκιβιάδου|m|Alcibiade|sg,prop
Λεωνίδας|Λεωνίδου|m|Leonida|sg,prop
# ---- Seconda declinazione
λόγος|λόγου|m|parola, discorso
ἄνθρωπος|ἀνθρώπου|m|uomo, essere umano
ἵππος|ἵππου|m|cavallo
δοῦλος|δούλου|m|schiavo
θεός|θεοῦ|m|dio|voc=θεός
ποταμός|ποταμοῦ|m|fiume
ἀδελφός|ἀδελφοῦ|m|fratello|voc=ἄδελφε
ἀγρός|ἀγροῦ|m|campo
οἶκος|οἴκου|m|casa
νόμος|νόμου|m|legge, usanza
πόλεμος|πολέμου|m|guerra
στρατηγός|στρατηγοῦ|m|stratego, comandante
στρατός|στρατοῦ|m|esercito
ἥλιος|ἡλίου|m|sole
οὐρανός|οὐρανοῦ|m|cielo
κίνδυνος|κινδύνου|m|pericolo
χρόνος|χρόνου|m|tempo
θάνατος|θανάτου|m|morte
βίος|βίου|m|vita
ὕπνος|ὕπνου|m|sonno
οἶνος|οἴνου|m|vino
σῖ_τος|σί_του|m|grano, cibo
λίθος|λίθου|m|pietra
διδάσκαλος|διδασκάλου|m|maestro
ἑταῖρος|ἑταίρου|m|compagno
ξένος|ξένου|m|straniero, ospite
γεωργός|γεωργοῦ|m|contadino
ἰατρός|ἰατροῦ|m|medico
δῆμος|δήμου|m|popolo
χορός|χοροῦ|m|coro, danza
ταῦρος|ταύρου|m|toro
λύκος|λύκου|m|lupo
ἄγγελος|ἀγγέλου|m|messaggero
σύμμαχος|συμμάχου|m|alleato
θησαυρός|θησαυροῦ|m|tesoro
καρπός|καρποῦ|m|frutto
κόσμος|κόσμου|m|ordine, mondo, ornamento
ἄνεμος|ἀνέμου|m|vento
φόβος|φόβου|m|paura
πόνος|πόνου|m|fatica
νεκρός|νεκροῦ|m|morto, cadavere
τάφος|τάφου|m|tomba
τύραννος|τυράννου|m|tiranno
ὄχλος|ὄχλου|m|folla
καιρός|καιροῦ|m|momento opportuno
ὄλεθρος|ὀλέθρου|m|rovina
Κῦ_ρος|Κύ_ρου|m|Ciro|sg,prop
Ὅμηρος|Ὁμήρου|m|Omero|sg,prop
Φίλιππος|Φιλίππου|m|Filippo|sg,prop
νῆσος|νήσου|f|isola
ὁδός|ὁδοῦ|f|strada, via
νόσος|νόσου|f|malattia
βίβλος|βίβλου|f|libro
παρθένος|παρθένου|f|fanciulla, vergine
ἤπειρος|ἠπείρου|f|terraferma, continente
δῶρον|δώρου|n|dono
ἔργον|ἔργου|n|opera, lavoro
τέκνον|τέκνου|n|figlio
ζῷον|ζῴου|n|animale
ὅπλον|ὅπλου|n|arma
βιβλίον|βιβλίου|n|libro
παιδίον|παιδίου|n|bambino
δένδρον|δένδρου|n|albero
ἱερόν|ἱεροῦ|n|tempio
πεδίον|πεδίου|n|pianura
στρατόπεδον|στρατοπέδου|n|accampamento
πλοῖον|πλοίου|n|nave
ἄστρον|ἄστρου|n|stella, astro
ἱμάτιον|ἱματίου|n|mantello
φάρμακον|φαρμάκου|n|farmaco, veleno
μῆλον|μήλου|n|mela
σημεῖον|σημείου|n|segno
ἆ_θλον|ἄ_θλου|n|premio
χωρίον|χωρίου|n|luogo, località
πρόσωπον|προσώπου|n|volto
δεῖπνον|δείπνου|n|cena
θηρίον|θηρίου|n|belva
ἀργύριον|ἀργυρίου|n|denaro
συμπόσιον|συμποσίου|n|banchetto
μέτρον|μέτρου|n|misura
ξύλον|ξύλου|n|legno
φύλλον|φύλλου|n|foglia
τόξον|τόξου|n|arco
# ---- Terza declinazione: temi in occlusiva
φύλαξ|φύλακος|m|guardiano, custode
κῆρυξ|κήρυ_κος|m|araldo
ἄναξ|ἄνακτος|m|signore, sovrano
θώραξ|θώρα_κος|m|corazza
Κύκλωψ|Κύκλωπος|m|Ciclope|prop
Αἰθίοψ|Αἰθίοπος|m|Etiope|prop
ἐλπίς|ἐλπίδος|f|speranza|voc=ἐλπί
πατρίς|πατρίδος|f|patria|novoc
λαμπάς|λαμπάδος|f|fiaccola|novoc
χάρις|χάριτος|f|grazia, riconoscenza|acc=χάριν,voc=χάρι
ὄρνις|ὄρνιθος|m/f|uccello|acc=ὄρνιν,novoc
ἔρις|ἔριδος|f|contesa, discordia|acc=ἔριν,novoc
νύξ|νυκτός|f|notte|novoc
παῖς|παιδός|m/f|fanciullo, figlio|voc=παῖ,gpl=παίδων
πούς|ποδός|m|piede|novoc
σῶμα|σώματος|n|corpo
ὄνομα|ὀνόματος|n|nome
πρᾶ_γμα|πρά_γματος|n|cosa, fatto, faccenda
γράμμα|γράμματος|n|lettera (dell'alfabeto)
στόμα|στόματος|n|bocca
χρῆμα|χρήματος|n|cosa (al plurale: ricchezze)
στράτευμα|στρατεύματος|n|esercito, spedizione
ποίημα|ποιήματος|n|poesia, opera poetica
μάθημα|μαθήματος|n|insegnamento, lezione
θαῦμα|θαύματος|n|meraviglia
ἅρμα|ἅρματος|n|carro
αἷμα|αἵματος|n|sangue
ὄμμα|ὄμματος|n|occhio
γέρων|γέροντος|m|vecchio|voc=γέρον
ἄρχων|ἄρχοντος|m|arconte, capo|voc=ἄρχον
λέων|λέοντος|m|leone|voc=λέον
γίγας|γίγαντος|m|gigante|novoc
ἐλέφας|ἐλέφαντος|m|elefante|novoc
# ---- temi in nasale e in liquida
ποιμήν|ποιμένος|m|pastore
λιμήν|λιμένος|m|porto
δαίμων|δαίμονος|m|divinità, demone|voc=δαῖμον
ἡγεμών|ἡγεμόνος|m|guida, comandante
ἀγών|ἀγῶνος|m|gara, lotta
χειμών|χειμῶνος|m|inverno, tempesta
Ἕλλην|Ἕλληνος|m|Greco, Elleno|prop
εἰκών|εἰκόνος|f|immagine
γείτων|γείτονος|m|vicino|voc=γεῖτον
μήν|μηνός|m|mese|novoc
ῥήτωρ|ῥήτορος|m|oratore|voc=ῥῆτορ
σωτήρ|σωτῆρος|m|salvatore|voc=σῶτερ
θήρ|θηρός|m|fiera, belva|novoc
πατήρ|πατρός|m|padre|full=πατήρ πατρός πατρί πατέρα πάτερ ; πατέρες πατέρων πατράσι(ν) πατέρας πατέρες,decl=3
μήτηρ|μητρός|f|madre|full=μήτηρ μητρός μητρί μητέρα μῆτερ ; μητέρες μητέρων μητράσι(ν) μητέρας μητέρες,decl=3
θυγάτηρ|θυγατρός|f|figlia|full=θυγάτηρ θυγατρός θυγατρί θυγατέρα θύγατερ ; θυγατέρες θυγατέρων θυγατράσι(ν) θυγατέρας θυγατέρες,decl=3
ἀνήρ|ἀνδρός|m|uomo, marito|full=ἀνήρ ἀνδρός ἀνδρί ἄνδρα ἄνερ ; ἄνδρες ἀνδρῶν ἀνδράσι(ν) ἄνδρας ἄνδρες,decl=3
γυνή|γυναικός|f|donna, moglie|full=γυνή γυναικός γυναικί γυναῖκα γύναι ; γυναῖκες γυναικῶν γυναιξί(ν) γυναῖκας γυναῖκες,decl=3
χείρ|χειρός|f|mano|full=χείρ χειρός χειρί χεῖρα χείρ ; χεῖρες χειρῶν χερσί(ν) χεῖρας χεῖρες,decl=3
ἀστήρ|ἀστέρος|m|stella|full=ἀστήρ ἀστέρος ἀστέρι ἀστέρα - ; ἀστέρες ἀστέρων ἀστράσι(ν) ἀστέρας ἀστέρες,decl=3
# ---- temi in sigma
γένος|γένους|n|stirpe, genere|tpl=genos
τεῖχος|τείχους|n|muro|tpl=genos
ἔθνος|ἔθνους|n|popolo, nazione|tpl=genos
ἔτος|ἔτους|n|anno|tpl=genos
ὄρος|ὄρους|n|monte|tpl=genos
πάθος|πάθους|n|sofferenza, passione|tpl=genos
ξίφος|ξίφους|n|spada|tpl=genos
ψεῦδος|ψεύδους|n|menzogna|tpl=genos
κάλλος|κάλλους|n|bellezza|tpl=genos,sg
πλῆθος|πλήθους|n|moltitudine, quantità|tpl=genos
τέλος|τέλους|n|fine, compimento|tpl=genos
μέρος|μέρους|n|parte|tpl=genos
ἄνθος|ἄνθους|n|fiore|tpl=genos
ἔπος|ἔπους|n|parola, verso|tpl=genos
νέφος|νέφους|n|nuvola|tpl=genos
κέρδος|κέρδους|n|guadagno|tpl=genos
κράτος|κράτους|n|forza, potere|tpl=genos,sg
θέρος|θέρους|n|estate|tpl=genos,sg
Σωκράτης|Σωκράτους|m|Socrate|tpl=es,prop
Δημοσθένης|Δημοσθένους|m|Demostene|tpl=es,prop
Ἀριστοτέλης|Ἀριστοτέλους|m|Aristotele|tpl=es,prop
Περικλῆς|Περικλέους|m|Pericle|full=Περικλῆς Περικλέους Περικλεῖ Περικλέα Περίκλεις,decl=3,prop
Θεμιστοκλῆς|Θεμιστοκλέους|m|Temistocle|full=Θεμιστοκλῆς Θεμιστοκλέους Θεμιστοκλεῖ Θεμιστοκλέα Θεμιστόκλεις,decl=3,prop
τριήρης|τριήρους|f|trireme|full=τριήρης τριήρους τριήρει τριήρη - ; τριήρεις τριήρων τριήρεσι(ν) τριήρεις τριήρεις,decl=3
# ---- temi in vocale e in dittongo
πόλις|πόλεως|f|città|tpl=polis
δύναμις|δυνάμεως|f|forza, potenza|tpl=polis
φύσις|φύσεως|f|natura|tpl=polis
τάξις|τάξεως|f|schieramento, ordine|tpl=polis
πρᾶ_ξις|πρά_ξεως|f|azione|tpl=polis
στάσις|στάσεως|f|discordia, rivolta|tpl=polis
κρίσις|κρίσεως|f|giudizio|tpl=polis
ποίησις|ποιήσεως|f|poesia, creazione|tpl=polis
ὕβρις|ὕβρεως|f|tracotanza|tpl=polis
μάντις|μάντεως|m|indovino|tpl=polis
ἀκρόπολις|ἀκροπόλεως|f|acropoli|tpl=polis
ἄστυ|ἄστεως|n|città|full=ἄστυ ἄστεως ἄστει ἄστυ ἄστυ ; ἄστη ἄστεων ἄστεσι(ν) ἄστη ἄστη,decl=3
ἰχθύς|ἰχθύος|m|pesce|full=ἰχθύς ἰχθύος ἰχθύϊ ἰχθύν ἰχθύ ; ἰχθύες ἰχθύων ἰχθύσι(ν) ἰχθῦς ἰχθύες,decl=3
βασιλεύς|βασιλέως|m|re|tpl=eus
ἱερεύς|ἱερέως|m|sacerdote|tpl=eus
ἱππεύς|ἱππέως|m|cavaliere|tpl=eus
γονεύς|γονέως|m|genitore|tpl=eus
φονεύς|φονέως|m|assassino|tpl=eus
βοῦς|βοός|m/f|bue, vacca|full=βοῦς βοός βοΐ βοῦν βοῦ ; βόες βοῶν βουσί(ν) βοῦς βόες,decl=3
ναῦς|νεώς|f|nave|full=ναῦς νεώς νηΐ ναῦν ναῦ ; νῆες νεῶν ναυσί(ν) ναῦς νῆες,decl=3
Ζεύς|Διός|m|Zeus|full=Ζεύς Διός Διί Δία Ζεῦ,decl=3,prop
ὕδωρ|ὕδατος|n|acqua|full=ὕδωρ ὕδατος ὕδατι ὕδωρ ὕδωρ ; ὕδατα ὑδάτων ὕδασι(ν) ὕδατα ὕδατα,decl=3
πῦρ|πυρός|n|fuoco|full=πῦρ πυρός πυρί πῦρ πῦρ,decl=3
`;

const ADJS = `
# ---- Prima classe
ἀγαθός|ἀγαθή|ἀγαθόν|buono, valoroso|cmp=ἀμείνων/βελτί_ων/κρείττων,sup=ἄριστος/βέλτιστος/κράτιστος
κακός|κακή|κακόν|cattivo, vile|cmp=κακί_ων/χείρων,sup=κάκιστος/χείριστος
καλός|καλή|καλόν|bello|cmp=καλλί_ων,sup=κάλλιστος
σοφός|σοφή|σοφόν|sapiente, saggio|cmp=σοφώτερος,sup=σοφώτατος
δίκαιος|δικαία_|δίκαιον|giusto|cmp=δικαιότερος,sup=δικαιότατος
ἄδικος||ἄδικον|ingiusto|cmp=ἀδικώτερος,sup=ἀδικώτατος
ἀνδρεῖος|ἀνδρεία_|ἀνδρεῖον|coraggioso|cmp=ἀνδρειότερος,sup=ἀνδρειότατος
φίλος|φίλη|φίλον|caro, amico
χαλεπός|χαλεπή|χαλεπόν|difficile, duro|cmp=χαλεπώτερος,sup=χαλεπώτατος
ῥᾴδιος|ῥᾳδία_|ῥᾴδιον|facile|cmp=ῥᾴων,sup=ῥᾷστος
μικρός|μικρά_|μικρόν|piccolo|cmp=μικρότερος,sup=μικρότατος
μακρός|μακρά_|μακρόν|lungo|cmp=μακρότερος,sup=μακρότατος
νέος|νέα_|νέον|giovane, nuovo|cmp=νεώτερος,sup=νεώτατος
παλαιός|παλαιά_|παλαιόν|antico, vecchio
ἀρχαῖος|ἀρχαία_|ἀρχαῖον|antico
δεινός|δεινή|δεινόν|terribile; abile|cmp=δεινότερος,sup=δεινότατος
χρηστός|χρηστή|χρηστόν|onesto, utile|cmp=χρηστότερος,sup=χρηστότατος
ἐλεύθερος|ἐλευθέρα_|ἐλεύθερον|libero|cmp=ἐλευθερώτερος,sup=ἐλευθερώτατος
πλούσιος|πλουσία_|πλούσιον|ricco|cmp=πλουσιώτερος,sup=πλουσιώτατος
ἄξιος|ἀξία_|ἄξιον|degno|cmp=ἀξιώτερος,sup=ἀξιώτατος
ἱερός|ἱερά_|ἱερόν|sacro
αἰσχρός|αἰσχρά_|αἰσχρόν|turpe, vergognoso|cmp=αἰσχί_ων,sup=αἴσχιστος
ἐχθρός|ἐχθρά_|ἐχθρόν|nemico, ostile|cmp=ἐχθί_ων,sup=ἔχθιστος
φοβερός|φοβερά_|φοβερόν|spaventoso|cmp=φοβερώτερος,sup=φοβερώτατος
πολέμιος|πολεμία_|πολέμιον|nemico
ἀθάνατος||ἀθάνατον|immortale
θνητός|θνητή|θνητόν|mortale
βάρβαρος||βάρβαρον|straniero, barbaro
λευκός|λευκή|λευκόν|bianco|cmp=λευκότερος,sup=λευκότατος
ὀλίγος|ὀλίγη|ὀλίγον|poco (pl. pochi)
ἄλλος|ἄλλη|ἄλλο|altro|pronN
ἕτερος|ἑτέρα_|ἕτερον|l'altro (fra due)
πρῶτος|πρώτη|πρῶτον|primo
δεύτερος|δευτέρα_|δεύτερον|secondo
μόνος|μόνη|μόνον|solo
ἕκαστος|ἑκάστη|ἕκαστον|ciascuno
ἐσθλός|ἐσθλή|ἐσθλόν|nobile, valente
ἰσχυ_ρός|ἰσχυ_ρά_|ἰσχυ_ρόν|forte|cmp=ἰσχυ_ρότερος,sup=ἰσχυ_ρότατος
μέγας|μεγάλη|μέγα|grande|full=m: μέγας μεγάλου μεγάλῳ μέγαν - | μεγάλοι μεγάλων μεγάλοις μεγάλους - ; f: μεγάλη μεγάλης μεγάλῃ μεγάλην - | μεγάλαι μεγάλων μεγάλαις μεγάλας - ; n: μέγα μεγάλου μεγάλῳ μέγα - | μεγάλα μεγάλων μεγάλοις μεγάλα -,cmp=μείζων,sup=μέγιστος
πολύς|πολλή|πολύ|molto|full=m: πολύς πολλοῦ πολλῷ πολύν - | πολλοί πολλῶν πολλοῖς πολλούς - ; f: πολλή πολλῆς πολλῇ πολλήν - | πολλαί πολλῶν πολλαῖς πολλάς - ; n: πολύ πολλοῦ πολλῷ πολύ - | πολλά πολλῶν πολλοῖς πολλά -,cmp=πλείων,sup=πλεῖστος
πολιτικός|πολιτική|πολιτικόν|politico, civile
κοινός|κοινή|κοινόν|comune
ἐμός|ἐμή|ἐμόν|mio|topic=pron
σός|σή|σόν|tuo|topic=pron
ἡμέτερος|ἡμετέρα_|ἡμέτερον|nostro|topic=pron
ὑμέτερος|ὑμετέρα_|ὑμέτερον|vostro|topic=pron
# ---- Seconda classe
ἀληθής||ἀληθές|vero, sincero|tpl=es,cmp=ἀληθέστερος,sup=ἀληθέστατος
σαφής||σαφές|chiaro|tpl=es,cmp=σαφέστερος,sup=σαφέστατος
εὐγενής||εὐγενές|nobile|tpl=es,cmp=εὐγενέστερος,sup=εὐγενέστατος
ἀσθενής||ἀσθενές|debole|tpl=es,cmp=ἀσθενέστερος,sup=ἀσθενέστατος
εὐσεβής||εὐσεβές|pio|tpl=es,cmp=εὐσεβέστερος,sup=εὐσεβέστατος
ψευδής||ψευδές|falso, menzognero|tpl=es
εὐδαίμων||εὔδαιμον|felice|tpl=on,cmp=εὐδαιμονέστερος,sup=εὐδαιμονέστατος
σώφρων||σῶφρον|saggio, temperante|tpl=on,cmp=σωφρονέστερος,sup=σωφρονέστατος
ἄφρων||ἄφρον|stolto|tpl=on,cmp=ἀφρονέστερος,sup=ἀφρονέστατος
ἡδύς|ἡδεῖα|ἡδύ|dolce, piacevole|tpl=us,cmp=ἡδί_ων,sup=ἥδιστος
ταχύς|ταχεῖα|ταχύ|veloce|tpl=us,cmp=θά_ττων,sup=τάχιστος
βαρύς|βαρεῖα|βαρύ|pesante|tpl=us,cmp=βαρύτερος,sup=βαρύτατος
ὀξύς|ὀξεῖα|ὀξύ|acuto, aguzzo|tpl=us,cmp=ὀξύτερος,sup=ὀξύτατος
βραδύς|βραδεῖα|βραδύ|lento|tpl=us,cmp=βραδύτερος,sup=βραδύτατος
βαθύς|βαθεῖα|βαθύ|profondo|tpl=us,cmp=βαθύτερος,sup=βαθύτατος
εὐρύς|εὐρεῖα|εὐρύ|largo, ampio|tpl=us
γλυκύς|γλυκεῖα|γλυκύ|dolce|tpl=us,cmp=γλυκύτερος,sup=γλυκύτατος
βραχύς|βραχεῖα|βραχύ|breve|tpl=us,cmp=βραχύτερος,sup=βραχύτατος
ἑκών|ἑκοῦσα|ἑκόν|volontario, di propria volontà|topic=agg2,full=m: ἑκών ἑκόντος ἑκόντι ἑκόντα - | ἑκόντες ἑκόντων ἑκοῦσι(ν) ἑκόντας - ; f: ἑκοῦσα ἑκούσης ἑκούσῃ ἑκοῦσαν - | ἑκοῦσαι ἑκουσῶν ἑκούσαις ἑκούσας - ; n: ἑκόν ἑκόντος ἑκόντι ἑκόν - | ἑκόντα ἑκόντων ἑκοῦσι(ν) ἑκόντα -
πᾶς|πᾶσα|πᾶν|tutto, ogni|topic=agg2,full=m: πᾶς παντός παντί πάντα - | πάντες πάντων πᾶσι(ν) πάντας - ; f: πᾶσα πάσης πάσῃ πᾶσαν - | πᾶσαι πασῶν πάσαις πάσας - ; n: πᾶν παντός παντί πᾶν - | πάντα πάντων πᾶσι(ν) πάντα -
μέλας|μέλαινα|μέλαν|nero|topic=agg2,full=m: μέλας μέλανος μέλανι μέλανα μέλαν | μέλανες μελάνων μέλασι(ν) μέλανας μέλανες ; f: μέλαινα μελαίνης μελαίνῃ μέλαιναν μέλαινα | μέλαιναι μελαινῶν μελαίναις μελαίνας μέλαιναι ; n: μέλαν μέλανος μέλανι μέλαν μέλαν | μέλανα μελάνων μέλασι(ν) μέλανα μέλανα
`;

/* Pronomi: tabelle complete per genere (x = maschile e femminile insieme) */
const PRONOUNS = [
  { id: 'ego', head: 'ἐγώ, ἐμοῦ', m: 'io', topic: 'pron', encl: 'μου μοι με', spec: 'x: ἐγώ ἐμοῦ/μου ἐμοί/μοι ἐμέ/με - | ἡμεῖς ἡμῶν ἡμῖν ἡμᾶς -' },
  { id: 'su', head: 'σύ, σοῦ', m: 'tu', topic: 'pron', encl: 'σου σοι σε', spec: 'x: σύ σοῦ/σου σοί/σοι σέ/σε σύ | ὑμεῖς ὑμῶν ὑμῖν ὑμᾶς ὑμεῖς' },
  { id: 'autos', head: 'αὐτός, αὐτή, αὐτό', m: 'egli, lui; stesso', topic: 'pron', spec: 'm: αὐτός αὐτοῦ αὐτῷ αὐτόν - | αὐτοί αὐτῶν αὐτοῖς αὐτούς - ; f: αὐτή αὐτῆς αὐτῇ αὐτήν - | αὐταί αὐτῶν αὐταῖς αὐτάς - ; n: αὐτό αὐτοῦ αὐτῷ αὐτό - | αὐτά αὐτῶν αὐτοῖς αὐτά -' },
  { id: 'houtos', head: 'οὗτος, αὕτη, τοῦτο', m: 'questo', topic: 'pron', spec: 'm: οὗτος τούτου τούτῳ τοῦτον - | οὗτοι τούτων τούτοις τούτους - ; f: αὕτη ταύτης ταύτῃ ταύτην - | αὗται τούτων ταύταις ταύτας - ; n: τοῦτο τούτου τούτῳ τοῦτο - | ταῦτα τούτων τούτοις ταῦτα -' },
  { id: 'hode', head: 'ὅδε, ἥδε, τόδε', m: 'questo (qui)', topic: 'pron', spec: 'm: ὅδε τοῦδε τῷδε τόνδε - | οἵδε τῶνδε τοῖσδε τούσδε - ; f: ἥδε τῆσδε τῇδε τήνδε - | αἵδε τῶνδε ταῖσδε τάσδε - ; n: τόδε τοῦδε τῷδε τόδε - | τάδε τῶνδε τοῖσδε τάδε -' },
  { id: 'ekeinos', head: 'ἐκεῖνος, ἐκείνη, ἐκεῖνο', m: 'quello', topic: 'pron', spec: 'm: ἐκεῖνος ἐκείνου ἐκείνῳ ἐκεῖνον - | ἐκεῖνοι ἐκείνων ἐκείνοις ἐκείνους - ; f: ἐκείνη ἐκείνης ἐκείνῃ ἐκείνην - | ἐκεῖναι ἐκείνων ἐκείναις ἐκείνας - ; n: ἐκεῖνο ἐκείνου ἐκείνῳ ἐκεῖνο - | ἐκεῖνα ἐκείνων ἐκείνοις ἐκεῖνα -' },
  { id: 'hos', head: 'ὅς, ἥ, ὅ', m: 'il quale, che (relativo)', topic: 'rel', spec: 'm: ὅς οὗ ᾧ ὅν - | οἵ ὧν οἷς οὕς - ; f: ἥ ἧς ᾗ ἥν - | αἵ ὧν αἷς ἅς - ; n: ὅ οὗ ᾧ ὅ - | ἅ ὧν οἷς ἅ -' },
  { id: 'tis', head: 'τίς, τί', m: 'chi? che cosa? quale?', topic: 'rel', noGrave: true, spec: 'x: τίς τίνος τίνι τίνα - | τίνες τίνων τίσι(ν) τίνας - ; n: τί τίνος τίνι τί - | τίνα τίνων τίσι(ν) τίνα -' },
  { id: 'tis_i', head: 'τις, τι', m: 'qualcuno, qualcosa; un certo', topic: 'rel', encl: '*', spec: 'x: τις τινός τινί τινά - | τινές τινῶν τισί(ν) τινάς - ; n: τι τινός τινί τι - | τινά τινῶν τισί(ν) τινά -' },
  { id: 'medeis', head: 'μηδείς, μηδεμία, μηδέν', m: 'nessuno, niente (con μή)', topic: 'rel', spec: 'm: μηδείς μηδενός μηδενί μηδένα - ; f: μηδεμία μηδεμιᾶς μηδεμιᾷ μηδεμίαν - ; n: μηδέν μηδενός μηδενί μηδέν -' },
  { id: 'emautou', head: 'ἐμαυτοῦ, ἐμαυτῆς', m: 'di me stesso (riflessivo)', topic: 'pron', spec: 'm: - ἐμαυτοῦ ἐμαυτῷ ἐμαυτόν - ; f: - ἐμαυτῆς ἐμαυτῇ ἐμαυτήν -' },
  { id: 'seautou', head: 'σεαυτοῦ, σεαυτῆς', m: 'di te stesso (riflessivo)', topic: 'pron', spec: 'm: - σεαυτοῦ σεαυτῷ σεαυτόν - ; f: - σεαυτῆς σεαυτῇ σεαυτήν -' },
  { id: 'heautou', head: 'ἑαυτοῦ, ἑαυτῆς, ἑαυτοῦ', m: 'di sé (riflessivo)', topic: 'pron', spec: 'm: - ἑαυτοῦ ἑαυτῷ ἑαυτόν - | - ἑαυτῶν ἑαυτοῖς ἑαυτούς - ; f: - ἑαυτῆς ἑαυτῇ ἑαυτήν - | - ἑαυτῶν ἑαυταῖς ἑαυτάς - ; n: - ἑαυτοῦ ἑαυτῷ ἑαυτό - | - ἑαυτῶν ἑαυτοῖς ἑαυτά -' },
  { id: 'oudeis', head: 'οὐδείς, οὐδεμία, οὐδέν', m: 'nessuno, niente', topic: 'rel', spec: 'm: οὐδείς οὐδενός οὐδενί οὐδένα - ; f: οὐδεμία οὐδεμιᾶς οὐδεμιᾷ οὐδεμίαν - ; n: οὐδέν οὐδενός οὐδενί οὐδέν -' },
];

/* Verbi */
const VERBS = [
  // ---- tema in vocale (-ω puri)
  { v: 'λύω', m: 'sciogliere, liberare', pres: 'λυ_', impf: 'ἐλυ_', fut: 'λυ_σ', futMid: 1, aor1: 'λυ_σ', aor1a: 'ἐλυ_σ', aorMid: 1, pf: 'λελυκ', pfm: 'λελυ', aorp: 'λυθ', aorpa: 'ἐλυθ' },
  { v: 'παιδεύω', m: 'educare', pres: 'παιδευ', impf: 'ἐπαιδευ', fut: 'παιδευσ', aor1: 'παιδευσ', aor1a: 'ἐπαιδευσ', pf: 'πεπαιδευκ', pfm: 'πεπαιδευ', aorp: 'παιδευθ', aorpa: 'ἐπαιδευθ' },
  { v: 'πιστεύω', m: 'credere, fidarsi (+ dat.)', pres: 'πιστευ', impf: 'ἐπιστευ', fut: 'πιστευσ', aor1: 'πιστευσ', aor1a: 'ἐπιστευσ', pf: 'πεπιστευκ', pfm: 'πεπιστευ', aorp: 'πιστευθ', aorpa: 'ἐπιστευθ' },
  { v: 'βουλεύω', m: 'deliberare; medio: decidere', pres: 'βουλευ', impf: 'ἐβουλευ', fut: 'βουλευσ', futMid: 1, aor1: 'βουλευσ', aor1a: 'ἐβουλευσ', aorMid: 1, pf: 'βεβουλευκ', pfm: 'βεβουλευ', aorp: 'βουλευθ', aorpa: 'ἐβουλευθ' },
  { v: 'δουλεύω', m: 'essere schiavo, servire (+ dat.)', pres: 'δουλευ', impf: 'ἐδουλευ', fut: 'δουλευσ', aor1: 'δουλευσ', aor1a: 'ἐδουλευσ', pf: 'δεδουλευκ', noMP: 1 },
  { v: 'κελεύω', m: 'ordinare, esortare', pres: 'κελευ', impf: 'ἐκελευ', fut: 'κελευσ', aor1: 'κελευσ', aor1a: 'ἐκελευσ', pf: 'κεκελευκ', aorp: 'κελευσθ', aorpa: 'ἐκελευσθ' },
  { v: 'θύω', m: 'sacrificare', pres: 'θυ_', impf: 'ἐθυ_', fut: 'θυ_σ', aor1: 'θυ_σ', aor1a: 'ἐθυ_σ', pf: 'τεθυκ', pfm: 'τεθυ', aorp: 'τυθ', aorpa: 'ἐτυθ' },
  { v: 'ἀκούω', m: 'ascoltare, udire', pres: 'ἀκου', impf: 'ἠκου', fut: 'ἀκουσ', futM: 1, aor1: 'ἀκουσ', aor1a: 'ἠκουσ', pf: 'ἀκηκο', aorp: 'ἀκουσθ', aorpa: 'ἠκουσθ' },
  { v: 'κωλύω', m: 'impedire', pres: 'κωλυ_', impf: 'ἐκωλυ_', fut: 'κωλυ_σ', aor1: 'κωλυ_σ', aor1a: 'ἐκωλυ_σ', pf: 'κεκωλυκ', pfm: 'κεκωλυ', aorp: 'κωλυθ', aorpa: 'ἐκωλυθ' },
  { v: 'παύω', m: 'far cessare; medio: cessare', pres: 'παυ', impf: 'ἐπαυ', fut: 'παυσ', futMid: 1, aor1: 'παυσ', aor1a: 'ἐπαυσ', aorMid: 1, pf: 'πεπαυκ', pfm: 'πεπαυ', aorp: 'παυσθ', aorpa: 'ἐπαυσθ' },
  { v: 'θεραπεύω', m: 'curare, servire', pres: 'θεραπευ', impf: 'ἐθεραπευ', fut: 'θεραπευσ', aor1: 'θεραπευσ', aor1a: 'ἐθεραπευσ', pf: 'τεθεραπευκ', pfm: 'τεθεραπευ', aorp: 'θεραπευθ', aorpa: 'ἐθεραπευθ' },
  { v: 'φονεύω', m: 'uccidere', pres: 'φονευ', impf: 'ἐφονευ', fut: 'φονευσ', aor1: 'φονευσ', aor1a: 'ἐφονευσ', pf: 'πεφονευκ', pfm: 'πεφονευ', aorp: 'φονευθ', aorpa: 'ἐφονευθ' },
  { v: 'χορεύω', m: 'danzare', pres: 'χορευ', impf: 'ἐχορευ', fut: 'χορευσ', aor1: 'χορευσ', aor1a: 'ἐχορευσ', noMP: 1 },
  { v: 'κινδυνεύω', m: 'correre un pericolo', pres: 'κινδυνευ', impf: 'ἐκινδυνευ', fut: 'κινδυνευσ', aor1: 'κινδυνευσ', aor1a: 'ἐκινδυνευσ', pf: 'κεκινδυνευκ', noMP: 1 },
  { v: 'στρατεύω', m: 'fare una spedizione', pres: 'στρατευ', impf: 'ἐστρατευ', fut: 'στρατευσ', futMid: 1, aor1: 'στρατευσ', aor1a: 'ἐστρατευσ', aorMid: 1 },
  { v: 'δακρύω', m: 'piangere', pres: 'δακρυ_', impf: 'ἐδακρυ_', fut: 'δακρυ_σ', aor1: 'δακρυ_σ', aor1a: 'ἐδακρυ_σ', noMP: 1 },
  { v: 'κλαίω', m: 'piangere', pres: 'κλαι', impf: 'ἐκλαι', fut: 'κλαυσ', futM: 1, aor1: 'κλαυσ', aor1a: 'ἐκλαυσ', noMP: 1 },
  // ---- tema in consonante
  { v: 'γράφω', m: 'scrivere', pres: 'γραφ', impf: 'ἐγραφ', fut: 'γραψ', aor1: 'γραψ', aor1a: 'ἐγραψ', pf: 'γεγραφ', aorp: 'γραφ', aorpa: 'ἐγραφ' },
  { v: 'πέμπω', m: 'mandare, inviare', pres: 'πεμπ', impf: 'ἐπεμπ', fut: 'πεμψ', aor1: 'πεμψ', aor1a: 'ἐπεμψ', pf: 'πεπομφ', aorp: 'πεμφθ', aorpa: 'ἐπεμφθ' },
  { v: 'βλέπω', m: 'guardare, vedere', pres: 'βλεπ', impf: 'ἐβλεπ', fut: 'βλεψ', futM: 1, aor1: 'βλεψ', aor1a: 'ἐβλεψ', noMP: 1 },
  { v: 'λείπω', m: 'lasciare, abbandonare', pres: 'λειπ', impf: 'ἐλειπ', fut: 'λειψ', aor2: 'λιπ', aor2a: 'ἐλιπ', pf: 'λελοιπ', aorp: 'λειφθ', aorpa: 'ἐλειφθ' },
  { v: 'κρύπτω', m: 'nascondere', pres: 'κρυπτ', impf: 'ἐκρυπτ', fut: 'κρυψ', aor1: 'κρυψ', aor1a: 'ἐκρυψ', pf: 'κεκρυφ', aorp: 'κρυφθ', aorpa: 'ἐκρυφθ' },
  { v: 'κλέπτω', m: 'rubare', pres: 'κλεπτ', impf: 'ἐκλεπτ', fut: 'κλεψ', aor1: 'κλεψ', aor1a: 'ἐκλεψ', pf: 'κεκλοφ', aorp: 'κλαπ', aorpa: 'ἐκλαπ' },
  { v: 'ῥίπτω', m: 'gettare', pres: 'ῥι_πτ', impf: 'ἐρρι_πτ', fut: 'ῥι_ψ', aor1: 'ῥι_ψ', aor1a: 'ἐρρι_ψ', pf: 'ἐρρι_φ', aorp: 'ῥι_φθ', aorpa: 'ἐρρι_φθ' },
  { v: 'θάπτω', m: 'seppellire', pres: 'θαπτ', impf: 'ἐθαπτ', fut: 'θαψ', aor1: 'θαψ', aor1a: 'ἐθαψ', aorp: 'ταφ', aorpa: 'ἐταφ' },
  { v: 'ἄγω', m: 'condurre, guidare', pres: 'ἀγ', impf: 'ἠγ', fut: 'ἀξ', aor2: 'ἀγαγ', aor2a: 'ἠγαγ', pf: 'ἠχ', aorp: 'ἀχθ', aorpa: 'ἠχθ' },
  { v: 'ἄρχω', m: 'comandare (+ gen.); medio: cominciare', pres: 'ἀρχ', impf: 'ἠρχ', fut: 'ἀρξ', futMid: 1, aor1: 'ἀρξ', aor1a: 'ἠρξ', aorMid: 1, pf: 'ἠρχ', aorp: 'ἀρχθ', aorpa: 'ἠρχθ' },
  { v: 'διώκω', m: 'inseguire', pres: 'διωκ', impf: 'ἐδιωκ', fut: 'διωξ', futMid: 1, aor1: 'διωξ', aor1a: 'ἐδιωξ', pf: 'δεδιωχ', aorp: 'διωχθ', aorpa: 'ἐδιωχθ' },
  { v: 'φυλάττω', m: 'custodire, sorvegliare', pres: 'φυλαττ', impf: 'ἐφυλαττ', fut: 'φυλαξ', aor1: 'φυλαξ', aor1a: 'ἐφυλαξ', aorMid: 1, pf: 'πεφυλαχ', aorp: 'φυλαχθ', aorpa: 'ἐφυλαχθ' },
  { v: 'πράττω', m: 'fare, agire', pres: 'πρα_ττ', impf: 'ἐπρα_ττ', fut: 'πρα_ξ', aor1: 'πρα_ξ', aor1a: 'ἐπρα_ξ', pf: 'πεπρα_χ', aorp: 'πρα_χθ', aorpa: 'ἐπρα_χθ' },
  { v: 'τάττω', m: 'schierare, ordinare', pres: 'ταττ', impf: 'ἐταττ', fut: 'ταξ', aor1: 'ταξ', aor1a: 'ἐταξ', pf: 'τεταχ', aorp: 'ταχθ', aorpa: 'ἐταχθ' },
  { v: 'διδάσκω', m: 'insegnare', pres: 'διδασκ', impf: 'ἐδιδασκ', fut: 'διδαξ', aor1: 'διδαξ', aor1a: 'ἐδιδαξ', pf: 'δεδιδαχ', aorp: 'διδαχθ', aorpa: 'ἐδιδαχθ' },
  { v: 'πείθω', m: 'persuadere; medio-passivo: obbedire (+ dat.)', pres: 'πειθ', impf: 'ἐπειθ', fut: 'πεισ', aor1: 'πεισ', aor1a: 'ἐπεισ', pf: 'πεπεικ', aorp: 'πεισθ', aorpa: 'ἐπεισθ' },
  { v: 'σῴζω', m: 'salvare', pres: 'σῳζ', impf: 'ἐσῳζ', fut: 'σωσ', aor1: 'σωσ', aor1a: 'ἐσωσ', pf: 'σεσωκ', aorp: 'σωθ', aorpa: 'ἐσωθ' },
  { v: 'νομίζω', m: 'ritenere, credere', pres: 'νομιζ', impf: 'ἐνομιζ', fut: 'νομιε+', aor1: 'νομισ', aor1a: 'ἐνομισ', pf: 'νενομικ', aorp: 'νομισθ', aorpa: 'ἐνομισθ' },
  { v: 'θαυμάζω', m: 'ammirare, meravigliarsi', pres: 'θαυμαζ', impf: 'ἐθαυμαζ', fut: 'θαυμασ', futM: 1, aor1: 'θαυμασ', aor1a: 'ἐθαυμασ', pf: 'τεθαυμακ', aorp: 'θαυμασθ', aorpa: 'ἐθαυμασθ' },
  { v: 'κομίζω', m: 'portare, trasportare', pres: 'κομιζ', impf: 'ἐκομιζ', fut: 'κομιε+', aor1: 'κομισ', aor1a: 'ἐκομισ', pf: 'κεκομικ', aorp: 'κομισθ', aorpa: 'ἐκομισθ' },
  { v: 'ἐλπίζω', m: 'sperare', pres: 'ἐλπιζ', impf: 'ἠλπιζ', fut: 'ἐλπιε+', aor1: 'ἐλπισ', aor1a: 'ἠλπισ', pf: 'ἠλπικ', noMP: 1 },
  { v: 'ἀναγκάζω', m: 'costringere', pres: 'ἀναγκαζ', impf: 'ἠναγκαζ', fut: 'ἀναγκασ', aor1: 'ἀναγκασ', aor1a: 'ἠναγκασ', pf: 'ἠναγκακ', aorp: 'ἀναγκασθ', aorpa: 'ἠναγκασθ' },
  { v: 'ὀνομάζω', m: 'chiamare, dare il nome', pres: 'ὀνομαζ', impf: 'ὠνομαζ', fut: 'ὀνομασ', aor1: 'ὀνομασ', aor1a: 'ὠνομασ', pf: 'ὠνομακ', aorp: 'ὀνομασθ', aorpa: 'ὠνομασθ' },
  { v: 'ἁρπάζω', m: 'rapire, saccheggiare', pres: 'ἁρπαζ', impf: 'ἡρπαζ', fut: 'ἁρπασ', aor1: 'ἁρπασ', aor1a: 'ἡρπασ', pf: 'ἡρπακ', aorp: 'ἁρπασθ', aorpa: 'ἡρπασθ' },
  { v: 'βαδίζω', m: 'camminare, andare', pres: 'βαδιζ', impf: 'ἐβαδιζ', fut: 'βαδιε+', futM: 1, aor1: 'βαδισ', aor1a: 'ἐβαδισ', noMP: 1 },
  { v: 'παρασκευάζω', m: 'preparare', pres: 'παρα|σκευαζ', impf: 'παρ|εσκευαζ', fut: 'παρα|σκευασ', aor1: 'παρα|σκευασ', aor1a: 'παρ|εσκευασ', aorMid: 1, pf: 'παρ|εσκευακ', aorp: 'παρα|σκευασθ', aorpa: 'παρ|εσκευασθ' },
  { v: 'σπεύδω', m: 'affrettarsi', pres: 'σπευδ', impf: 'ἐσπευδ', fut: 'σπευσ', aor1: 'σπευσ', aor1a: 'ἐσπευσ', noMP: 1 },
  { v: 'φεύγω', m: 'fuggire, evitare', pres: 'φευγ', impf: 'ἐφευγ', fut: 'φευξ', futM: 1, aor2: 'φυγ', aor2a: 'ἐφυγ', pf: 'πεφευγ', noMP: 1 },
  { v: 'ἐθέλω', m: 'volere', pres: 'ἐθελ', impf: 'ἠθελ', fut: 'ἐθελησ', aor1: 'ἐθελησ', aor1a: 'ἠθελησ', pf: 'ἠθεληκ', noMP: 1 },
  { v: 'μέλλω', m: 'stare per, essere sul punto di', pres: 'μελλ', impf: 'ἐμελλ', fut: 'μελλησ', aor1: 'μελλησ', aor1a: 'ἐμελλησ', noMP: 1 },
  { v: 'ἥκω', m: 'essere giunto, venire', pres: 'ἡκ', impf: 'ἡκ', fut: 'ἡξ', noMP: 1 },
  // ---- temi in liquida e nasale (futuro contratto)
  { v: 'μένω', m: 'rimanere, attendere', pres: 'μεν', impf: 'ἐμεν', fut: 'μενε+', aor1: 'μειν', aor1a: 'ἐμειν', pf: 'μεμενηκ', noMP: 1 },
  { v: 'κρίνω', m: 'giudicare, scegliere', pres: 'κρι_ν', impf: 'ἐκρι_ν', fut: 'κρινε+', aor1: 'κρι_ν', aor1a: 'ἐκρι_ν', pf: 'κεκρικ', pfm: 'κεκρι', aorp: 'κριθ', aorpa: 'ἐκριθ' },
  { v: 'ἀγγέλλω', m: 'annunciare', pres: 'ἀγγελλ', impf: 'ἠγγελλ', fut: 'ἀγγελε+', aor1: 'ἀγγειλ', aor1a: 'ἠγγειλ', pf: 'ἠγγελκ', aorp: 'ἀγγελθ', aorpa: 'ἠγγελθ' },
  { v: 'ἀποκτείνω', m: 'uccidere', pres: 'ἀπο|κτειν', impf: 'ἀπ|εκτειν', fut: 'ἀπο|κτενε+', aor1: 'ἀπο|κτειν', aor1a: 'ἀπ|εκτειν', pf: 'ἀπ|εκτον', noMP: 1 },
  { v: 'φαίνω', m: 'mostrare; passivo: apparire, sembrare', pres: 'φαιν', impf: 'ἐφαιν', fut: 'φανε+', aor1: 'φην', aor1a: 'ἐφην', aorp: 'φαν', aorpa: 'ἐφαν' },
  { v: 'διαφθείρω', m: 'distruggere, corrompere', pres: 'δια|φθειρ', impf: 'δι|εφθειρ', fut: 'δια|φθερε+', aor1: 'δια|φθειρ', aor1a: 'δι|εφθειρ', pf: 'δι|εφθαρκ', aorp: 'δια|φθαρ', aorpa: 'δι|εφθαρ' },
  { v: 'βάλλω', m: 'gettare, colpire', pres: 'βαλλ', impf: 'ἐβαλλ', fut: 'βαλε+', aor2: 'βαλ', aor2a: 'ἐβαλ', pf: 'βεβληκ', pfm: 'βεβλη', aorp: 'βληθ', aorpa: 'ἐβληθ' },
  { v: 'ἐκβάλλω', m: 'scacciare, gettare fuori', pres: 'ἐκ|βαλλ', impf: 'ἐξ|εβαλλ', fut: 'ἐκ|βαλε+', aor2: 'ἐκ|βαλ', aor2a: 'ἐξ|εβαλ', pf: 'ἐκ|βεβληκ', aorp: 'ἐκ|βληθ', aorpa: 'ἐξ|εβληθ' },
  { v: 'εἰσβάλλω', m: 'invadere, irrompere', pres: 'εἰσ|βαλλ', impf: 'εἰσ|εβαλλ', fut: 'εἰσ|βαλε+', aor2: 'εἰσ|βαλ', aor2a: 'εἰσ|εβαλ', noMP: 1 },
  { v: 'χαίρω', m: 'rallegrarsi', pres: 'χαιρ', impf: 'ἐχαιρ', fut: 'χαιρησ', aorp: 'χαρ', aorpa: 'ἐχαρ', noFutP: 1, noMP: 1 },
  // ---- aoristi secondi e paradigmi misti
  { v: 'λαμβάνω', m: 'prendere, ricevere', pres: 'λαμβαν', impf: 'ἐλαμβαν', fut: 'ληψ', futM: 1, aor2: 'λαβ', aor2a: 'ἐλαβ', ox: 1, pf: 'εἰληφ', aorp: 'ληφθ', aorpa: 'ἐληφθ' },
  { v: 'μανθάνω', m: 'imparare, apprendere', pres: 'μανθαν', impf: 'ἐμανθαν', fut: 'μαθησ', futM: 1, aor2: 'μαθ', aor2a: 'ἐμαθ', pf: 'μεμαθηκ', noMP: 1 },
  { v: 'λέγω', m: 'dire, parlare', pres: 'λεγ', impf: 'ἐλεγ', fut: 'ἐρε+', aor2: 'εἰπ', aor2a: 'εἰπ', ox: 1, pf: 'εἰρηκ', pfm: 'εἰρη', aorp: 'λεχθ', aorpa: 'ἐλεχθ' },
  { v: 'ἔχω', m: 'avere, tenere', pres: 'ἐχ', impf: 'εἰχ', fut: 'ἑξ', aor2: 'σχ', aor2a: 'ἐσχ', pf: 'ἐσχηκ', noMP: 1, no: 'aor.imp aor.subj aor.opt' },
  { v: 'γιγνώσκω', m: 'conoscere, riconoscere', pres: 'γιγνωσκ', impf: 'ἐγιγνωσκ', fut: 'γνωσ', futM: 1, pf: 'ἐγνωκ', aorp: 'γνωσθ', aorpa: 'ἐγνωσθ',
    x: `aor.ind.act(atematico): ἔγνων ἔγνως ἔγνω ἔγνωμεν ἔγνωτε ἔγνωσαν
      aor.subj.act: γνῶ γνῷς γνῷ γνῶμεν γνῶτε γνῶσι(ν)
      aor.opt.act: γνοίην γνοίης γνοίη γνοῖμεν γνοῖτε γνοῖεν
      aor.imp.act: γνῶθι γνώτω γνῶτε γνόντων
      aor.inf.act: γνῶναι
      aor.part.act: γνούς|γνόντος|γνοῦσα|γνόν|γνοῦσι(ν)` },
  { v: 'ἀποθνῄσκω', m: 'morire', pres: 'ἀπο|θνῃσκ', impf: 'ἀπ|εθνῃσκ', fut: 'ἀπο|θανε+', futM: 1, aor2: 'ἀπο|θαν', aor2a: 'ἀπ|εθαν', pf: 'τεθνηκ', noMP: 1, no: 'pres.imp aor.imp' },
  { v: 'πάσχω', m: 'subire, soffrire', pres: 'πασχ', impf: 'ἐπασχ', fut: 'πεισ', futM: 1, aor2: 'παθ', aor2a: 'ἐπαθ', pf: 'πεπονθ', noMP: 1 },
  { v: 'πίπτω', m: 'cadere', pres: 'πιπτ', impf: 'ἐπιπτ', fut: 'πεσε+', futM: 1, aor2: 'πεσ', aor2a: 'ἐπεσ', pf: 'πεπτωκ', noMP: 1, no: 'pres.imp pres.part.act.n.nom pres.part.act.n.acc pres.part.act.n.voc' },
  { v: 'εὑρίσκω', m: 'trovare', pres: 'εὑρισκ', impf: 'ηὑρισκ', fut: 'εὑρησ', aor2: 'εὑρ', aor2a: 'ηὑρ', ox: 1, pf: 'ηὑρηκ', aorp: 'εὑρεθ', aorpa: 'ηὑρεθ' },
  { v: 'φέρω', m: 'portare, sopportare', pres: 'φερ', impf: 'ἐφερ', fut: 'οἰσ', pf: 'ἐνηνοχ', aorp: 'ἐνεχθ', aorpa: 'ἠνεχθ',
    x: `aor.ind.act: ἤνεγκα ἤνεγκας ἤνεγκε(ν) ἠνέγκαμεν ἠνέγκατε ἤνεγκαν
      aor.inf.act: ἐνεγκεῖν
      aor.part.act: ἐνεγκών|ἐνεγκόντος|ἐνεγκοῦσα|ἐνεγκόν|ἐνεγκοῦσι(ν)` },
  { v: 'ἐσθίω', m: 'mangiare', pres: 'ἐσθι', impf: 'ἠσθι', fut: 'ἐδ', futM: 1, aor2: 'φαγ', aor2a: 'ἐφαγ', noMP: 1 },
  { v: 'πίνω', m: 'bere', pres: 'πι_ν', impf: 'ἐπι_ν', fut: 'πι_', futM: 1, aor2: 'πι', aor2a: 'ἐπι', pf: 'πεπωκ', noMP: 1, no: 'aor.imp' },
  { v: 'τρέχω', m: 'correre', pres: 'τρεχ', impf: 'ἐτρεχ', fut: 'δραμε+', futM: 1, aor2: 'δραμ', aor2a: 'ἐδραμ', pf: 'δεδραμηκ', noMP: 1 },
  { v: 'ἔρχομαι', m: 'andare, venire', dep: 'm', pres: 'ἐρχ', aor2: 'ἐλθ', aor2a: 'ἠλθ', ox: 1, pf: 'ἐληλυθ', no: 'pres.subj pres.opt pres.imp pres.part' },
  { v: 'γίγνομαι', m: 'diventare, nascere, accadere', dep: 'm', pres: 'γιγν', impf: 'ἐγιγν', fut: 'γενησ', futM: 1, aor2: 'γεν', aor2a: 'ἐγεν', aorM: 1, pf: 'γεγον', pfm: 'γεγενη' },
  { v: 'αἰσθάνομαι', m: 'accorgersi, percepire', dep: 'm', pres: 'αἰσθαν', impf: 'ᾐσθαν', fut: 'αἰσθησ', futM: 1, aor2: 'αἰσθ', aor2a: 'ᾐσθ', aorM: 1, pfm: 'ᾐσθη' },
  { v: 'ἀφικνέομαι', m: 'arrivare, giungere', dep: 'm', pres: 'ἀφ|ικνε+', impf: 'ἀφ|ι_κνε+', fut: 'ἀφ|ι_ξ', futM: 1, aor2: 'ἀφ|ικ', aor2a: 'ἀφ|ι_κ', aorM: 1 },
  // ---- deponenti
  { v: 'βούλομαι', m: 'volere', dep: 'm', pres: 'βουλ', impf: 'ἐβουλ', fut: 'βουλησ', futM: 1, aorp: 'βουληθ', aorpa: 'ἐβουληθ', noFutP: 1, no: 'pres.imp' },
  { v: 'δέχομαι', m: 'ricevere, accogliere', dep: 'm', pres: 'δεχ', impf: 'ἐδεχ', fut: 'δεξ', futM: 1, aor1: 'δεξ', aor1a: 'ἐδεξ', aorM: 1 },
  { v: 'μάχομαι', m: 'combattere (+ dat.)', dep: 'm', pres: 'μαχ', impf: 'ἐμαχ', fut: 'μαχε+', futM: 1, aor1: 'μαχεσ', aor1a: 'ἐμαχεσ', aorM: 1 },
  { v: 'πορεύομαι', m: 'marciare, andare', dep: 'm', pres: 'πορευ', impf: 'ἐπορευ', fut: 'πορευσ', futM: 1, aorp: 'πορευθ', aorpa: 'ἐπορευθ', noFutP: 1, pfm: 'πεπορευ' },
  { v: 'ὀργίζομαι', m: 'adirarsi', dep: 'm', pres: 'ὀργιζ', impf: 'ὠργιζ', fut: 'ὀργιε+', futM: 1, aorp: 'ὀργισθ', aorpa: 'ὠργισθ', noFutP: 1 },
  { v: 'ἀποκρίνομαι', m: 'rispondere', dep: 'm', pres: 'ἀπο|κρι_ν', impf: 'ἀπ|εκρι_ν', fut: 'ἀπο|κρινε+', futM: 1, aor1: 'ἀπο|κρι_ν', aor1a: 'ἀπ|εκρι_ν', aorM: 1 },
  { v: 'ἡγέομαι', m: 'guidare (+ dat.); ritenere', dep: 'm', pres: 'ἡγε+', impf: 'ἡγε+', fut: 'ἡγησ', futM: 1, aor1: 'ἡγησ', aor1a: 'ἡγησ', aorM: 1, pfm: 'ἡγη' },
  { v: 'φοβέομαι', m: 'temere, avere paura', dep: 'm', pres: 'φοβε+', impf: 'ἐφοβε+', fut: 'φοβησ', futM: 1, aorp: 'φοβηθ', aorpa: 'ἐφοβηθ', noFutP: 1, pfm: 'πεφοβη' },
  { v: 'θεάομαι', m: 'contemplare, osservare', dep: 'm', pres: 'θεα+', impf: 'ἐθεα+', fut: 'θεα_σ', futM: 1, aor1: 'θεα_σ', aor1a: 'ἐθεα_σ', aorM: 1, pfm: 'τεθεα_' },
  { v: 'πειράομαι', m: 'tentare, cercare di', dep: 'm', pres: 'πειρα+', impf: 'ἐπειρα+', fut: 'πειρα_σ', futM: 1, aor1: 'πειρα_σ', aor1a: 'ἐπειρα_σ', aorM: 1 },
  // ---- verbi contratti
  { v: 'ποιέω', m: 'fare', pres: 'ποιε+', impf: 'ἐποιε+', fut: 'ποιησ', futMid: 1, aor1: 'ποιησ', aor1a: 'ἐποιησ', aorMid: 1, pf: 'πεποιηκ', pfm: 'πεποιη', aorp: 'ποιηθ', aorpa: 'ἐποιηθ' },
  { v: 'φιλέω', m: 'amare', pres: 'φιλε+', impf: 'ἐφιλε+', fut: 'φιλησ', aor1: 'φιλησ', aor1a: 'ἐφιλησ', pf: 'πεφιληκ', pfm: 'πεφιλη', aorp: 'φιληθ', aorpa: 'ἐφιληθ' },
  { v: 'οἰκέω', m: 'abitare', pres: 'οἰκε+', impf: 'ᾠκε+', fut: 'οἰκησ', aor1: 'οἰκησ', aor1a: 'ᾠκησ', pf: 'ᾠκηκ', pfm: 'ᾠκη', aorp: 'οἰκηθ', aorpa: 'ᾠκηθ' },
  { v: 'ζητέω', m: 'cercare', pres: 'ζητε+', impf: 'ἐζητε+', fut: 'ζητησ', aor1: 'ζητησ', aor1a: 'ἐζητησ', pf: 'ἐζητηκ', pfm: 'ἐζητη', aorp: 'ζητηθ', aorpa: 'ἐζητηθ' },
  { v: 'ὠφελέω', m: 'giovare, aiutare', pres: 'ὠφελε+', impf: 'ὠφελε+', fut: 'ὠφελησ', aor1: 'ὠφελησ', aor1a: 'ὠφελησ', pf: 'ὠφεληκ', pfm: 'ὠφελη', aorp: 'ὠφεληθ', aorpa: 'ὠφεληθ' },
  { v: 'ἀδικέω', m: 'fare torto, offendere', pres: 'ἀδικε+', impf: 'ἠδικε+', fut: 'ἀδικησ', aor1: 'ἀδικησ', aor1a: 'ἠδικησ', pf: 'ἠδικηκ', pfm: 'ἠδικη', aorp: 'ἀδικηθ', aorpa: 'ἠδικηθ' },
  { v: 'καλέω', m: 'chiamare, invitare', pres: 'καλε+', impf: 'ἐκαλε+', fut: 'καλε+', aor1: 'καλεσ', aor1a: 'ἐκαλεσ', pf: 'κεκληκ', pfm: 'κεκλη', aorp: 'κληθ', aorpa: 'ἐκληθ' },
  { v: 'αἱρέω', m: 'prendere, conquistare; medio: scegliere', pres: 'αἱρε+', impf: 'ᾑρε+', fut: 'αἱρησ', futMid: 1, aor2: 'ἑλ', aor2a: 'εἱλ', aorMid: 1, pf: 'ᾑρηκ', pfm: 'ᾑρη', aorp: 'αἱρεθ', aorpa: 'ᾑρεθ', no: 'aor.imp' },
  { v: 'δοκέω', m: 'sembrare; ritenere', pres: 'δοκε+', impf: 'ἐδοκε+', fut: 'δοξ', aor1: 'δοξ', aor1a: 'ἐδοξ', noMP: 1 },
  { v: 'πολεμέω', m: 'fare guerra (+ dat.)', pres: 'πολεμε+', impf: 'ἐπολεμε+', fut: 'πολεμησ', aor1: 'πολεμησ', aor1a: 'ἐπολεμησ', pf: 'πεπολεμηκ', noMP: 1 },
  { v: 'βοηθέω', m: 'soccorrere (+ dat.)', pres: 'βοηθε+', impf: 'ἐβοηθε+', fut: 'βοηθησ', aor1: 'βοηθησ', aor1a: 'ἐβοηθησ', pf: 'βεβοηθηκ', noMP: 1 },
  { v: 'κοσμέω', m: 'ornare, ordinare', pres: 'κοσμε+', impf: 'ἐκοσμε+', fut: 'κοσμησ', aor1: 'κοσμησ', aor1a: 'ἐκοσμησ', pf: 'κεκοσμηκ', pfm: 'κεκοσμη', aorp: 'κοσμηθ', aorpa: 'ἐκοσμηθ' },
  { v: 'μισέω', m: 'odiare', pres: 'μι_σε+', impf: 'ἐμι_σε+', fut: 'μι_σησ', aor1: 'μι_σησ', aor1a: 'ἐμι_σησ', pf: 'μεμι_σηκ', pfm: 'μεμι_ση', aorp: 'μι_σηθ', aorpa: 'ἐμι_σηθ' },
  { v: 'ἀναχωρέω', m: 'ritirarsi', pres: 'ἀνα|χωρε+', impf: 'ἀν|εχωρε+', fut: 'ἀνα|χωρησ', aor1: 'ἀνα|χωρησ', aor1a: 'ἀν|εχωρησ', pf: 'ἀνα|κεχωρηκ', noMP: 1 },
  { v: 'ἐπαινέω', m: 'lodare', pres: 'ἐπ|αινε+', impf: 'ἐπ|ῃνε+', fut: 'ἐπ|αινεσ', futM: 1, aor1: 'ἐπ|αινεσ', aor1a: 'ἐπ|ῃνεσ', pf: 'ἐπ|ῃνεκ', aorp: 'ἐπ|αινεθ', aorpa: 'ἐπ|ῃνεθ' },
  { v: 'αἰτέω', m: 'chiedere', pres: 'αἰτε+', impf: 'ᾐτε+', fut: 'αἰτησ', aor1: 'αἰτησ', aor1a: 'ᾐτησ', pf: 'ᾐτηκ', pfm: 'ᾐτη', aorp: 'αἰτηθ', aorpa: 'ᾐτηθ' },
  { v: 'κρατέω', m: 'vincere, dominare (+ gen.)', pres: 'κρατε+', impf: 'ἐκρατε+', fut: 'κρατησ', aor1: 'κρατησ', aor1a: 'ἐκρατησ', pf: 'κεκρατηκ', aorp: 'κρατηθ', aorpa: 'ἐκρατηθ' },
  { v: 'κινέω', m: 'muovere', pres: 'κι_νε+', impf: 'ἐκι_νε+', fut: 'κι_νησ', aor1: 'κι_νησ', aor1a: 'ἐκι_νησ', pf: 'κεκι_νηκ', pfm: 'κεκι_νη', aorp: 'κι_νηθ', aorpa: 'ἐκι_νηθ' },
  { v: 'λυπέω', m: 'addolorare', pres: 'λυ_πε+', impf: 'ἐλυ_πε+', fut: 'λυ_πησ', aor1: 'λυ_πησ', aor1a: 'ἐλυ_πησ', aorp: 'λυ_πηθ', aorpa: 'ἐλυ_πηθ' },
  { v: 'ἀκολουθέω', m: 'seguire (+ dat.)', pres: 'ἀκολουθε+', impf: 'ἠκολουθε+', fut: 'ἀκολουθησ', aor1: 'ἀκολουθησ', aor1a: 'ἠκολουθησ', pf: 'ἠκολουθηκ', noMP: 1 },
  { v: 'σκοπέω', m: 'osservare, esaminare', pres: 'σκοπε+', impf: 'ἐσκοπε+' },
  { v: 'νικάω', m: 'vincere', pres: 'νι_κα+', impf: 'ἐνι_κα+', fut: 'νι_κησ', aor1: 'νι_κησ', aor1a: 'ἐνι_κησ', pf: 'νενι_κηκ', pfm: 'νενι_κη', aorp: 'νι_κηθ', aorpa: 'ἐνι_κηθ' },
  { v: 'τιμάω', m: 'onorare', pres: 'τι_μα+', impf: 'ἐτι_μα+', fut: 'τι_μησ', aor1: 'τι_μησ', aor1a: 'ἐτι_μησ', pf: 'τετι_μηκ', pfm: 'τετι_μη', aorp: 'τι_μηθ', aorpa: 'ἐτι_μηθ' },
  { v: 'ὁράω', m: 'vedere', pres: 'ὁρα+', impf: 'ἑωρα+', fut: 'ὀψ', futM: 1, aor2: 'ἰδ', aor2a: 'εἰδ', ox: 1, pf: 'ἑωρα_κ', aorp: 'ὀφθ', aorpa: 'ὠφθ' },
  { v: 'ἐρωτάω', m: 'domandare, interrogare', pres: 'ἐρωτα+', impf: 'ἠρωτα+', fut: 'ἐρωτησ', aor1: 'ἐρωτησ', aor1a: 'ἠρωτησ', pf: 'ἠρωτηκ', aorp: 'ἐρωτηθ', aorpa: 'ἠρωτηθ' },
  { v: 'τολμάω', m: 'osare', pres: 'τολμα+', impf: 'ἐτολμα+', fut: 'τολμησ', aor1: 'τολμησ', aor1a: 'ἐτολμησ', pf: 'τετολμηκ', noMP: 1 },
  { v: 'βοάω', m: 'gridare', pres: 'βοα+', impf: 'ἐβοα+', fut: 'βοησ', futM: 1, aor1: 'βοησ', aor1a: 'ἐβοησ', noMP: 1 },
  { v: 'ἀγαπάω', m: 'amare, voler bene', pres: 'ἀγαπα+', impf: 'ἠγαπα+', fut: 'ἀγαπησ', aor1: 'ἀγαπησ', aor1a: 'ἠγαπησ', pf: 'ἠγαπηκ', pfm: 'ἠγαπη', aorp: 'ἀγαπηθ', aorpa: 'ἠγαπηθ' },
  { v: 'γελάω', m: 'ridere', pres: 'γελα+', impf: 'ἐγελα+', fut: 'γελασ', futM: 1, aor1: 'γελασ', aor1a: 'ἐγελασ', noMP: 1 },
  { v: 'σιγάω', m: 'tacere', pres: 'σι_γα+', impf: 'ἐσι_γα+', fut: 'σι_γησ', futM: 1, aor1: 'σι_γησ', aor1a: 'ἐσι_γησ', noMP: 1 },
  { v: 'τελευτάω', m: 'finire; morire', pres: 'τελευτα+', impf: 'ἐτελευτα+', fut: 'τελευτησ', aor1: 'τελευτησ', aor1a: 'ἐτελευτησ', pf: 'τετελευτηκ', noMP: 1 },
  { v: 'ἀπατάω', m: 'ingannare', pres: 'ἀπατα+', impf: 'ἠπατα+', fut: 'ἀπατησ', aor1: 'ἀπατησ', aor1a: 'ἠπατησ', pf: 'ἠπατηκ', pfm: 'ἠπατη', aorp: 'ἀπατηθ', aorpa: 'ἠπατηθ' },
  { v: 'ὁρμάω', m: 'spingere; medio-passivo: lanciarsi', pres: 'ὁρμα+', impf: 'ὡρμα+', fut: 'ὁρμησ', aor1: 'ὁρμησ', aor1a: 'ὡρμησ', pf: 'ὡρμηκ', pfm: 'ὡρμη', aorp: 'ὁρμηθ', aorpa: 'ὡρμηθ' },
  { v: 'δηλόω', m: 'mostrare, rivelare', pres: 'δηλο+', impf: 'ἐδηλο+', fut: 'δηλωσ', aor1: 'δηλωσ', aor1a: 'ἐδηλωσ', pf: 'δεδηλωκ', pfm: 'δεδηλω', aorp: 'δηλωθ', aorpa: 'ἐδηλωθ' },
  { v: 'δουλόω', m: 'rendere schiavo', pres: 'δουλο+', impf: 'ἐδουλο+', fut: 'δουλωσ', aor1: 'δουλωσ', aor1a: 'ἐδουλωσ', pf: 'δεδουλωκ', pfm: 'δεδουλω', aorp: 'δουλωθ', aorpa: 'ἐδουλωθ' },
  { v: 'ἐλευθερόω', m: 'liberare', pres: 'ἐλευθερο+', impf: 'ἠλευθερο+', fut: 'ἐλευθερωσ', aor1: 'ἐλευθερωσ', aor1a: 'ἠλευθερωσ', pf: 'ἠλευθερωκ', pfm: 'ἠλευθερω', aorp: 'ἐλευθερωθ', aorpa: 'ἠλευθερωθ' },
  { v: 'ἀξιόω', m: 'ritenere degno, chiedere', pres: 'ἀξιο+', impf: 'ἠξιο+', fut: 'ἀξιωσ', aor1: 'ἀξιωσ', aor1a: 'ἠξιωσ', pf: 'ἠξιωκ', pfm: 'ἠξιω', aorp: 'ἀξιωθ', aorpa: 'ἠξιωθ' },
  { v: 'πλέω', m: 'navigare', tags: ['contr'], fut: 'πλευσ', futM: 1, aor1: 'πλευσ', aor1a: 'ἐπλευσ', noMP: 1,
    x: `pres.ind.act: πλέω πλεῖς πλεῖ πλέομεν πλεῖτε πλέουσι(ν)
      impf.ind.act: ἔπλεον ἔπλεις ἔπλει ἐπλέομεν ἐπλεῖτε ἔπλεον
      pres.inf.act: πλεῖν
      pres.part.act: πλέων|πλέοντος|πλέουσα|πλέον|πλέουσι(ν)` },
  { v: 'ῥέω', m: 'scorrere', tags: ['contr'], noMP: 1,
    x: `pres.ind.act: ῥέω ῥεῖς ῥεῖ ῥέομεν ῥεῖτε ῥέουσι(ν)
      impf.ind.act: ἔρρεον ἔρρεις ἔρρει ἐρρέομεν ἐρρεῖτε ἔρρεον
      pres.inf.act: ῥεῖν` },
  // ---- εἰμί e verbi in -μι
  { v: 'εἰμί', m: 'essere', pp: 'εἰμί, ἔσομαι',
    x: `pres.ind.act: εἰμί! εἶ ἐστί(ν)! ἐσμέν! ἐστέ! εἰσί(ν)!
      impf.ind.act: ἦ/ἦν ἦσθα ἦν ἦμεν ἦτε ἦσαν
      pres.subj.act: ὦ ᾖς ᾖ ὦμεν ἦτε ὦσι(ν)
      pres.opt.act: εἴην εἴης εἴη εἶμεν/εἴημεν εἶτε/εἴητε εἶεν/εἴησαν
      pres.imp.act: ἴσθι ἔστω ἔστε ἔστων/ὄντων
      pres.inf.act: εἶναι
      pres.part.act: ὤν|ὄντος|οὖσα|ὄν|οὖσι(ν)
      fut.ind.mid: ἔσομαι ἔσῃ/ἔσει ἔσται ἐσόμεθα ἔσεσθε ἔσονται
      fut.opt.mid: ἐσοίμην ἔσοιο ἔσοιτο ἐσοίμεθα ἔσοισθε ἔσοιντο
      fut.inf.mid: ἔσεσθαι
      fut.part.mid: ἐσόμενος` },
  { v: 'δύναμαι', m: 'potere, essere in grado', mi: 1, fut: 'δυνησ', futM: 1, aorp: 'δυνηθ', aorpa: 'ἐδυνηθ', noFutP: 1,
    x: `pres.ind.mp: δύναμαι δύνασαι δύναται δυνάμεθα δύνασθε δύνανται
      pres.subj.mp: δύνωμαι δύνῃ δύνηται δυνώμεθα δύνησθε δύνωνται
      pres.opt.mp: δυναίμην δύναιο δύναιτο δυναίμεθα δύναισθε δύναιντο
      pres.inf.mp: δύνασθαι
      pres.part.mp: δυνάμενος
      impf.ind.mp: ἐδυνάμην/ἠδυνάμην ἐδύνω/ἠδύνω ἐδύνατο/ἠδύνατο ἐδυνάμεθα/ἠδυνάμεθα ἐδύνασθε/ἠδύνασθε ἐδύναντο/ἠδύναντο` },
  { v: 'φημί', m: 'dire, affermare', mi: 1,
    x: `pres.ind.act: φημί! φῄς φησί(ν)! φαμέν! φατέ! φασί(ν)!
      impf.ind.act: ἔφην ἔφησθα/ἔφης ἔφη ἔφαμεν ἔφατε ἔφασαν
      pres.inf.act: φάναι` },
  { v: 'δίδωμι', m: 'dare', mi: 1, fut: 'δωσ', pf: 'δεδωκ', pfm: 'δεδο', aorp: 'δοθ', aorpa: 'ἐδοθ',
    x: `pres.ind.act: δίδωμι δίδως δίδωσι(ν) δίδομεν δίδοτε διδόασι(ν)
      pres.subj.act: διδῶ διδῷς διδῷ διδῶμεν διδῶτε διδῶσι(ν)
      pres.opt.act: διδοίην διδοίης διδοίη διδοῖμεν διδοῖτε διδοῖεν
      pres.imp.act: δίδου διδότω δίδοτε διδόντων
      pres.inf.act: διδόναι
      pres.part.act: διδούς|διδόντος|διδοῦσα|διδόν|διδοῦσι(ν)
      pres.ind.mp: δίδομαι δίδοσαι δίδοται διδόμεθα δίδοσθε δίδονται
      pres.subj.mp: διδῶμαι διδῷ διδῶται διδώμεθα διδῶσθε διδῶνται
      pres.opt.mp: διδοίμην διδοῖο διδοῖτο διδοίμεθα διδοῖσθε διδοῖντο
      pres.imp.mp: δίδοσο διδόσθω δίδοσθε διδόσθων
      pres.inf.mp: δίδοσθαι
      pres.part.mp: διδόμενος
      impf.ind.act: ἐδίδουν ἐδίδους ἐδίδου ἐδίδομεν ἐδίδοτε ἐδίδοσαν
      impf.ind.mp: ἐδιδόμην ἐδίδοσο ἐδίδοτο ἐδιδόμεθα ἐδίδοσθε ἐδίδοντο
      aor.ind.act: ἔδωκα ἔδωκας ἔδωκε(ν) ἔδομεν ἔδοτε ἔδοσαν
      aor.subj.act: δῶ δῷς δῷ δῶμεν δῶτε δῶσι(ν)
      aor.opt.act: δοίην δοίης δοίη δοῖμεν δοῖτε δοῖεν
      aor.imp.act: δός δότω δότε δόντων
      aor.inf.act: δοῦναι
      aor.part.act: δούς|δόντος|δοῦσα|δόν|δοῦσι(ν)
      aor.ind.mid: ἐδόμην ἔδου ἔδοτο ἐδόμεθα ἔδοσθε ἔδοντο
      aor.subj.mid: δῶμαι δῷ δῶται δώμεθα δῶσθε δῶνται
      aor.opt.mid: δοίμην δοῖο δοῖτο δοίμεθα δοῖσθε δοῖντο
      aor.imp.mid: δοῦ δόσθω δόσθε δόσθων
      aor.inf.mid: δόσθαι
      aor.part.mid: δόμενος` },
  { v: 'τίθημι', m: 'porre, collocare', mi: 1, fut: 'θησ', futMid: 1, pf: 'τεθηκ', aorp: 'τεθ', aorpa: 'ἐτεθ',
    x: `pres.ind.act: τίθημι τίθης τίθησι(ν) τίθεμεν τίθετε τιθέασι(ν)
      pres.subj.act: τιθῶ τιθῇς τιθῇ τιθῶμεν τιθῆτε τιθῶσι(ν)
      pres.opt.act: τιθείην τιθείης τιθείη τιθεῖμεν τιθεῖτε τιθεῖεν
      pres.imp.act: τίθει τιθέτω τίθετε τιθέντων
      pres.inf.act: τιθέναι
      pres.part.act: τιθείς|τιθέντος|τιθεῖσα|τιθέν|τιθεῖσι(ν)
      pres.ind.mp: τίθεμαι τίθεσαι τίθεται τιθέμεθα τίθεσθε τίθενται
      pres.subj.mp: τιθῶμαι τιθῇ τιθῆται τιθώμεθα τιθῆσθε τιθῶνται
      pres.opt.mp: τιθείμην τιθεῖο τιθεῖτο τιθείμεθα τιθεῖσθε τιθεῖντο
      pres.imp.mp: τίθεσο τιθέσθω τίθεσθε τιθέσθων
      pres.inf.mp: τίθεσθαι
      pres.part.mp: τιθέμενος
      impf.ind.act: ἐτίθην ἐτίθεις ἐτίθει ἐτίθεμεν ἐτίθετε ἐτίθεσαν
      impf.ind.mp: ἐτιθέμην ἐτίθεσο ἐτίθετο ἐτιθέμεθα ἐτίθεσθε ἐτίθεντο
      aor.ind.act: ἔθηκα ἔθηκας ἔθηκε(ν) ἔθεμεν ἔθετε ἔθεσαν
      aor.subj.act: θῶ θῇς θῇ θῶμεν θῆτε θῶσι(ν)
      aor.opt.act: θείην θείης θείη θεῖμεν θεῖτε θεῖεν
      aor.imp.act: θές θέτω θέτε θέντων
      aor.inf.act: θεῖναι
      aor.part.act: θείς|θέντος|θεῖσα|θέν|θεῖσι(ν)
      aor.ind.mid: ἐθέμην ἔθου ἔθετο ἐθέμεθα ἔθεσθε ἔθεντο
      aor.subj.mid: θῶμαι θῇ θῆται θώμεθα θῆσθε θῶνται
      aor.opt.mid: θείμην θεῖο θεῖτο θείμεθα θεῖσθε θεῖντο
      aor.imp.mid: θοῦ θέσθω θέσθε θέσθων
      aor.inf.mid: θέσθαι
      aor.part.mid: θέμενος` },
  { v: 'ἵστημι', m: 'porre, collocare; aoristo II e perfetto: stare', mi: 1, fut: 'στησ', futMid: 1, aor1: 'στησ', aor1a: 'ἐστησ', pf: 'ἑστηκ', aorp: 'σταθ', aorpa: 'ἐσταθ',
    x: `pres.ind.act: ἵστημι ἵστης ἵστησι(ν) ἵσταμεν ἵστατε ἱστᾶσι(ν)
      pres.subj.act: ἱστῶ ἱστῇς ἱστῇ ἱστῶμεν ἱστῆτε ἱστῶσι(ν)
      pres.opt.act: ἱσταίην ἱσταίης ἱσταίη ἱσταῖμεν ἱσταῖτε ἱσταῖεν
      pres.imp.act: ἵστη ἱστάτω ἵστατε ἱστάντων
      pres.inf.act: ἱστάναι
      pres.part.act: ἱστάς|ἱστάντος|ἱστᾶσα|ἱστάν|ἱστᾶσι(ν)
      pres.ind.mp: ἵσταμαι ἵστασαι ἵσταται ἱστάμεθα ἵστασθε ἵστανται
      pres.subj.mp: ἱστῶμαι ἱστῇ ἱστῆται ἱστώμεθα ἱστῆσθε ἱστῶνται
      pres.opt.mp: ἱσταίμην ἱσταῖο ἱσταῖτο ἱσταίμεθα ἱσταῖσθε ἱσταῖντο
      pres.imp.mp: ἵστασο ἱστάσθω ἵστασθε ἱστάσθων
      pres.inf.mp: ἵστασθαι
      pres.part.mp: ἱστάμενος
      impf.ind.act: ἵστην ἵστης ἵστη ἵσταμεν ἵστατε ἵστασαν
      impf.ind.mp: ἱστάμην ἵστασο ἵστατο ἱστάμεθα ἵστασθε ἵσταντο
      aor.ind.act(II, intransitivo): ἔστην ἔστης ἔστη ἔστημεν ἔστητε ἔστησαν
      aor.subj.act(II, intransitivo): στῶ στῇς στῇ στῶμεν στῆτε στῶσι(ν)
      aor.opt.act(II, intransitivo): σταίην σταίης σταίη σταῖμεν σταῖτε σταῖεν
      aor.imp.act(II, intransitivo): στῆθι στήτω στῆτε στάντων
      aor.inf.act(II, intransitivo): στῆναι
      aor.part.act(II, intransitivo): στάς|στάντος|στᾶσα|στάν|στᾶσι(ν)` },
  { v: 'δείκνυμι', m: 'mostrare', mi: 1, fut: 'δειξ', aor1: 'δειξ', aor1a: 'ἐδειξ', aorMid: 1, pf: 'δεδειχ', aorp: 'δειχθ', aorpa: 'ἐδειχθ',
    x: `pres.ind.act: δείκνυμι δείκνυς δείκνυσι(ν) δείκνυμεν δείκνυτε δεικνύασι(ν)
      pres.subj.act: δεικνύω δεικνύῃς δεικνύῃ δεικνύωμεν δεικνύητε δεικνύωσι(ν)
      pres.opt.act: δεικνύοιμι δεικνύοις δεικνύοι δεικνύοιμεν δεικνύοιτε δεικνύοιεν
      pres.imp.act: δείκνυ δεικνύτω δείκνυτε δεικνύντων
      pres.inf.act: δεικνύναι
      pres.part.act: δεικνύς|δεικνύντος|δεικνῦσα|δεικνύν|δεικνῦσι(ν)
      pres.ind.mp: δείκνυμαι δείκνυσαι δείκνυται δεικνύμεθα δείκνυσθε δείκνυνται
      pres.subj.mp: δεικνύωμαι δεικνύῃ δεικνύηται δεικνυώμεθα δεικνύησθε δεικνύωνται
      pres.opt.mp: δεικνυοίμην δεικνύοιο δεικνύοιτο δεικνυοίμεθα δεικνύοισθε δεικνύοιντο
      pres.imp.mp: δείκνυσο δεικνύσθω δείκνυσθε δεικνύσθων
      pres.inf.mp: δείκνυσθαι
      pres.part.mp: δεικνύμενος
      impf.ind.act: ἐδείκνυν ἐδείκνυς ἐδείκνυ ἐδείκνυμεν ἐδείκνυτε ἐδείκνυσαν
      impf.ind.mp: ἐδεικνύμην ἐδείκνυσο ἐδείκνυτο ἐδεικνύμεθα ἐδείκνυσθε ἐδείκνυντο` },
  // ---- perfetto con valore di presente; impersonali
  { v: 'οἶδα', m: 'sapere (perfetto con valore di presente)', pp: 'οἶδα',
    x: `pf.ind.act: οἶδα οἶσθα οἶδε(ν) ἴσμεν ἴστε ἴσασι(ν)
      pf.inf.act: εἰδέναι
      pf.part.act: εἰδώς|εἰδότος|εἰδυῖα|εἰδός|εἰδόσι(ν)` },
  { v: 'δεῖ', m: 'bisogna, è necessario', tags: ['inf'], pp: 'δεῖ, δεήσει, ἐδέησε(ν)',
    x: `pres.ind.act: - - δεῖ - - -
      impf.ind.act: - - ἔδει - - -
      fut.ind.act: - - δεήσει - - -
      pres.subj.act: - - δέῃ - - -
      pres.opt.act: - - δέοι - - -
      pres.inf.act: δεῖν` },
];

/* Parole invariabili: [forma(/varianti), significato, argomento, categoria, opzioni] */
const INV = [
  ['καί', 'e; anche', 'pres', 'cong'],
  ['ἀλλά', 'ma', 'pres', 'cong'],
  ['οὐ/οὐκ/οὐχ', 'non', 'pres', 'neg', { procl: true }],
  ['μή', 'non (nei divieti, nelle finali, nelle condizioni)', 'pres', 'neg'],
  ['ἤ', 'o, oppure; (dopo un comparativo) che, di', 'pres', 'cong'],
  ['ὦ', 'o (col vocativo)', 'pres', 'inter'],
  ['νῦν', 'ora', 'pres', 'avv'],
  ['ἀεί', 'sempre', 'pres', 'avv'],
  ['πολλάκις', 'spesso', 'pres', 'avv'],
  ['ἤδη', 'già', 'pres', 'avv'],
  ['ἔτι', 'ancora', 'pres', 'avv'],
  ['οὐκέτι', 'non più', 'pres', 'avv'],
  ['εὖ', 'bene', 'pres', 'avv'],
  ['μάλα', 'molto', 'pres', 'avv'],
  ['σφόδρα', 'molto, assai', 'pres', 'avv'],
  ['ἄγαν', 'troppo', 'pres', 'avv'],
  ['οὕτως/οὕτω', 'così', 'pres', 'avv'],
  ['ἐνθάδε', 'qui', 'pres', 'avv'],
  ['ἐκεῖ', 'là', 'pres', 'avv'],
  ['αὔριον', 'domani', 'pres', 'avv'],
  ['χθές', 'ieri', 'pres', 'avv'],
  ['τότε', 'allora', 'pres', 'avv'],
  ['πάλαι', 'anticamente, da tempo', 'pres', 'avv'],
  ['οἴκοι', 'a casa', 'pres', 'avv'],
  ['ποτέ', 'una volta, un tempo; mai', 'pres', 'avv', { encl: true }],
  ['οὔποτε', 'mai', 'pres', 'avv'],
  ['πῶς', 'come?', 'pres', 'int'],
  ['ποῦ', 'dove?', 'pres', 'int'],
  ['πόθεν', 'da dove?', 'pres', 'int'],
  ['ποῖ', 'verso dove?', 'pres', 'int'],
  ['πότε', 'quando?', 'pres', 'int'],
  ['ἆρα', '(introduce una domanda)', 'pres', 'part'],
  ['οὐδέ', 'e non, neppure', 'pres', 'cong'],
  ['μηδέ', 'e non, neppure', 'pres', 'cong'],
  ['τε', 'e', 'pres', 'cong', { encl: true, post: true }],
  ['οὔτε', 'né', 'pres', 'cong'],
  ['ναί', 'sì', 'pres', 'part'],
  ['καλῶς', 'bene', 'agg1', 'avv'],
  ['κακῶς', 'male', 'agg1', 'avv'],
  ['σοφῶς', 'saggiamente', 'agg1', 'avv'],
  ['δικαίως', 'giustamente', 'agg1', 'avv'],
  ['ταχέως', 'velocemente', 'agg2', 'avv'],
  ['βραδέως', 'lentamente', 'agg2', 'avv'],
  ['μᾶλλον', 'più, piuttosto', 'agg2', 'avv'],
  ['μάλιστα', 'moltissimo, soprattutto', 'agg2', 'avv'],
  // preposizioni
  ['ἐν', 'in (+ dat.)', 'prep', 'prep', { procl: true, cases: 'dat' }],
  ['εἰς', 'in, verso (+ acc.)', 'prep', 'prep', { procl: true, cases: 'acc' }],
  ['ἐκ/ἐξ', 'da, fuori da (+ gen.)', 'prep', 'prep', { procl: true, cases: 'gen' }],
  ['ἀπό', 'da (+ gen.)', 'prep', 'prep', { cases: 'gen' }],
  ['πρός', 'verso, contro (+ acc.); presso (+ dat.); da parte di (+ gen.)', 'prep', 'prep', { cases: 'acc dat gen' }],
  ['διά', 'attraverso, per mezzo di (+ gen.); a causa di (+ acc.)', 'prep', 'prep', { cases: 'gen acc' }],
  ['μετά', 'con (+ gen.); dopo (+ acc.)', 'prep', 'prep', { cases: 'gen acc' }],
  ['περί', 'riguardo a (+ gen.); intorno a (+ acc.)', 'prep', 'prep', { cases: 'gen acc' }],
  ['παρά', 'da (+ gen.); presso (+ dat.); verso, presso (+ acc.)', 'prep', 'prep', { cases: 'gen dat acc' }],
  ['ἐπί', 'su (+ gen. e dat.); contro, verso (+ acc.)', 'prep', 'prep', { cases: 'gen dat acc' }],
  ['κατά', 'giù da (+ gen.); lungo, secondo (+ acc.)', 'prep', 'prep', { cases: 'gen acc' }],
  ['σύν', 'con, insieme a (+ dat.)', 'prep', 'prep', { cases: 'dat' }],
  ['ὑπό', 'da (+ gen., d\'agente); sotto (+ dat. e acc.)', 'prep', 'prep', { cases: 'gen dat acc' }],
  ['ἀντί', 'invece di, al posto di (+ gen.)', 'prep', 'prep', { cases: 'gen' }],
  ['πρό', 'davanti a, prima di (+ gen.)', 'prep', 'prep', { cases: 'gen' }],
  ['ὑπέρ', 'per, in difesa di (+ gen.); oltre (+ acc.)', 'prep', 'prep', { cases: 'gen acc' }],
  ['ἄνευ', 'senza (+ gen.)', 'prep', 'prep', { cases: 'gen' }],
  ['ἕνεκα', 'a causa di, per (+ gen., di solito posposto)', 'prep', 'prep', { cases: 'gen' }],
  // subordinazione
  ['εἰ', 'se', 'cong', 'cong', { procl: true }],
  ['ἵνα', 'affinché, perché (finale)', 'cong', 'cong'],
  ['ὅπως', 'affinché; come', 'cong', 'cong'],
  ['ὡς', 'come; che; affinché', 'cong', 'cong', { procl: true }],
  ['ὅτι', 'che (dichiarativo); perché (causale)', 'cong', 'cong'],
  ['εἴθε', 'oh se! (desiderio)', 'cong', 'part'],
  ['ὅτε', 'quando', 'sub', 'cong'],
  ['ἐπεί', 'poiché; quando, dopo che', 'sub', 'cong'],
  ['ἐπειδή', 'dopo che; poiché', 'sub', 'cong'],
  ['ὅταν', 'quando (+ cong.: eventualità)', 'sub', 'cong'],
  ['ἐάν', 'se (+ cong.: eventualità)', 'sub', 'cong'],
  ['ὥστε', 'cosicché, tanto che', 'sub', 'cong'],
  ['πρίν', 'prima che, prima di', 'sub', 'cong'],
  ['ἕως', 'finché', 'sub', 'cong'],
  ['διότι', 'poiché, perché', 'sub', 'cong'],
  ['χρή', 'bisogna, è necessario', 'inf', 'avv', { d: 'verbo impersonale' }],
  ['ἔξεστι(ν)', 'è lecito, è possibile', 'inf', 'avv', { d: 'verbo impersonale' }],
  // particelle
  ['μέν', '(da una parte; correlato con δέ)', 'perf', 'part', { post: true }],
  ['δέ', 'e, ma, invece', 'perf', 'part', { post: true }],
  ['γάρ', 'infatti', 'perf', 'part', { post: true }],
  ['οὖν', 'dunque, quindi', 'perf', 'part', { post: true }],
  ['ἄν', '(particella modale: possibilità, eventualità)', 'perf', 'part'],
  ['γε', 'almeno, proprio', 'perf', 'part', { encl: true, post: true }],
  ['δή', 'appunto, dunque', 'perf', 'part', { post: true }],
];

root.HERM_LEX = { NOUNS, ADJS, PRONOUNS, VERBS, INV };
if (typeof module !== 'undefined') module.exports = root.HERM_LEX;
})(typeof window !== 'undefined' ? window : globalThis);
