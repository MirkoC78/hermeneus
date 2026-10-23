const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
const a = "setTimeout(() => theorySheet(topic, true), 400); }";
if (!s.includes(a)) throw new Error('manca');
s = s.replace(a, "const cur = SES.cur; setTimeout(() => { if (SES && SES.cur === cur && !SES.done && !$('#sheet')) theorySheet(topic, true); }, 400); }");
fs.writeFileSync(f, s);
console.log('ok');
