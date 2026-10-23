const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
const R = (a, b) => { if (!s.includes(a)) throw new Error('manca: ' + a.slice(0, 70)); s = s.replace(a, b); };
R("function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignora */ } }",
  "// la vibrazione è permessa solo dopo un tocco reale dell'utente\nfunction buzz(p) { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch (e) { /* ignora */ } }");
R("function closeModal() { const m = $('#modal'); if (m) m.remove(); }",
  "function closeModal() { const m = $('#modal'); if (m) m.remove(); }\n// conferma e richiesta di testo dentro l'app (i dialoghi nativi possono essere bloccati)\nlet modalCb = null;\nfunction askConfirm(text, okLabel, cb, danger) { modalCb = cb; showModal(`<h2>${esc(text)}</h2><div class=\"grid2\" style=\"grid-template-columns:1fr 1fr;margin-top:14px\"><button class=\"btn ghost\" data-act=\"closeModal\">Annulla</button><button class=\"btn ${danger ? 'err' : ''}\" data-act=\"modalOk\">${esc(okLabel)}</button></div>`); }\nfunction askText(label, value, cb) { modalCb = cb; showModal(`<label for=\"mdIn\"><b>${esc(label)}</b></label><input id=\"mdIn\" class=\"typed\" style=\"margin-top:8px\" maxlength=\"24\" autocomplete=\"off\" value=\"${esc(value)}\"><div class=\"grid2\" style=\"grid-template-columns:1fr 1fr;margin-top:14px\"><button class=\"btn ghost\" data-act=\"closeModal\">Annulla</button><button class=\"btn\" data-act=\"modalOk\">Salva</button></div>`); setTimeout(() => { const i = $('#mdIn'); if (i) i.focus(); }, 40); }");
R("  quit: () => { if (SES && SES.i > 0 && !SES.done && !confirm('Vuoi interrompere l\u2019allenamento? I punti di questa sessione andranno persi.')) return; SES = null; closeOverlay(); render(); },",
  "  quit: () => { const go = () => { SES = null; closeOverlay(); render(); }; if (SES && SES.i > 0 && !SES.done) askConfirm('Interrompere l\u2019allenamento? I punti di questa sessione andranno persi.', 'Interrompi', go); else go(); },\n  modalOk: () => { const i = $('#mdIn'); const v = i ? i.value : true; const cb = modalCb; modalCb = null; closeModal(); if (cb) cb(v); },");
R("  rename: () => { const n = prompt('Il tuo nome (facoltativo):', S.name); if (n !== null) { S.name = n.trim().slice(0, 24); save(); render(); } },",
  "  rename: () => askText('Il tuo nome (facoltativo)', S.name, (n) => { S.name = String(n).trim().slice(0, 24); save(); render(); }),");
R("  reset: () => { if (confirm('Cancellare tutti i progressi da questo dispositivo?')) { try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ } S = DEFAULT(); onb = null; applyTheme(); render(); } },",
  "  reset: () => askConfirm('Cancellare tutti i progressi da questo dispositivo?', 'Cancella', () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ } S = DEFAULT(); onb = null; applyTheme(); render(); }, true),");
fs.writeFileSync(f, s);
console.log('ok');
