/* Strips the line tags from every snippet in src/content/code and writes it to ./out/<id>.<lang>
   so the language harnesses can run it. */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'src', 'content', 'code');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const strip = (s) =>
  s
    .replace(/\n$/, '')
    .split('\n')
    .map((l) => l.replace(/^[\d,]*\|/, ''))
    .join('\n');

let n = 0;
for (const file of fs.readdirSync(SRC)) {
  const m = file.match(/^(\w+)\.(py|java|cpp|js)\.txt$/);
  if (!m) continue;
  fs.writeFileSync(path.join(OUT, `${m[1]}.${m[2]}`), strip(fs.readFileSync(path.join(SRC, file), 'utf8')));
  n++;
}
console.log('extracted', n, 'snippets');
