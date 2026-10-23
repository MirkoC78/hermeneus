const fs = require('fs');
const f = 'src/lessons.js';
let s = fs.readFileSync(f, 'utf8');
const R = (a, b) => { if (!s.includes(a)) throw new Error('manca: ' + a.slice(0, 60)); s = s.split(a).join(b); };
R("valid.includes(f.d) && prefRank(valid[0]) < prefRank(f.d) ? valid[0] : f.d", "best");
R("      const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d)).sort((a, b) => prefRank(a) - prefRank(b));",
  "      const valid = uniq(e.forms.filter((x) => x.f === f.f).map((x) => x.d));\n      // risposta proposta: la lettura più naturale fra quelle dentro il perimetro della lezione\n      const best = uniq(forms.filter((x) => x.f === f.f).map((x) => x.d)).sort((a, b) => prefRank(a) - prefRank(b))[0] || f.d;");
fs.writeFileSync(f, s);
console.log('ok');
