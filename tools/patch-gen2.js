const fs = require('fs');
let g = fs.readFileSync('src/generator.js', 'utf8');
const R = (a, b, all) => { if (!g.includes(a)) throw new Error('manca: ' + a.slice(0, 60)); g = all ? g.split(a).join(b) : g.replace(a, b); };
// i complementi di luogo accettano solo luoghi (classe P)
R("    const cands = nounsFor(ctx, spec).filter((n) => !(o.avoid || []).includes(n));", "    const cands = nounsFor(ctx, spec).filter((n) => !(o.avoid || []).includes(n) && (!o.place || n.cls.has('P')));");
R("{ avoid: [sNP && sNP.n, oNP && oNP.n].filter(Boolean), adj: false, num: 's' }", "{ avoid: [sNP && sNP.n, oNP && oNP.n].filter(Boolean), adj: false, num: 's', place: true, demo: false }");
R("{ avoid: [n], adj: false, num: 's', demo: false }", "{ avoid: [n], adj: false, num: 's', demo: false, place: true }");
// chi muore non compie poi altre azioni: niente ἀποθνῄσκω nelle temporali, relative e genitivi assoluti
R("vf: (v) => !!v.pp && !v.o, neg: false });", "vf: (v) => !!v.pp && !v.o && v.la !== 'ἀποθνῄσκω', neg: false });");
R("VERBS.filter((v) => v.pp && !v.o && !v.req && ctx.T.has(v.e.topic))", "VERBS.filter((v) => v.pp && !v.o && !v.req && v.la !== 'ἀποθνῄσκω' && ctx.T.has(v.e.topic))", true);
fs.writeFileSync('src/generator.js', g);
let s = fs.readFileSync('src/semantic.js', 'utf8');
const Q = (a, b) => { if (!s.includes(a)) throw new Error('manca: ' + a); s = s.replace(a, b); };
Q('ἀγορά|P city|', 'ἀγορά|P square|');
Q("pp: { from: 'city field house wood isle camp', to: 'city house wood isle mount' }", "pp: { from: 'city square field house wood isle camp', to: 'city house wood isle mount' }");
Q("pp: { loc: 'city house field isle camp temple' }", "pp: { loc: 'city square house field isle camp temple' }");
Q("pp: { to: 'city house field river', from: 'city house field wood' }", "pp: { to: 'city square house field', from: 'city square house field wood' }");
Q("pp: { to: 'city house field camp temple' }, req: 'to'", "pp: { to: 'city square house field camp temple' }, req: 'to'");
Q("pp: { loc: 'plain field city sea' }", "pp: { loc: 'plain field city sea square' }");
fs.writeFileSync('src/semantic.js', s);
console.log('ok');
