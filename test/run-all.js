// Esegue tutti i test di Hermeneus: node test/run-all.js
const { execFileSync } = require('child_process');
const path = require('path');
let failed = 0;
for (const t of ['engine.test.js', 'bank.test.js', 'content.test.js', 'generator.test.js', 'course.test.js', 'save.test.js']) {
  try { process.stdout.write(execFileSync(process.execPath, [path.join(__dirname, t)], { encoding: 'utf8' })); }
  catch (e) { failed++; process.stdout.write(e.stdout || ''); }
}
console.log(failed ? `\n${failed} gruppi di test con errori.` : '\nTutti i test superati.');
process.exitCode = failed ? 1 : 0;
