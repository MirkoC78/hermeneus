// Sostituisce i segni diacritici combinanti isolati (non attaccati a una lettera) con sequenze di escape leggibili.
const fs = require('fs');
const BS = String.fromCharCode(92);
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  let out = '', prevLetter = false, n = 0;
  for (const ch of src) {
    const cp = ch.codePointAt(0);
    const isMark = cp >= 0x300 && cp <= 0x36f;
    if (isMark && !prevLetter) { out += BS + 'u' + cp.toString(16).toUpperCase().padStart(4, '0'); n++; continue; }
    out += ch;
    prevLetter = /\p{L}/u.test(ch) || (isMark && prevLetter);
  }
  fs.writeFileSync(f, out);
  console.log(f, n);
}
