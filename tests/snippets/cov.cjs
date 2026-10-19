/* Checks that every pseudocode line a step executes is tagged on at least one source line in every
   language. Step lines come from the golden file (default inputs). The only allowed gaps are the final
   "done" steps, where nothing is executing; they are listed explicitly below. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const golden = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'golden', 'golden-steps.json'), 'utf8'));
const CODE = path.join(ROOT, 'src', 'content', 'code');
const LANGS = ['py', 'java', 'cpp', 'js'];

// id: [final "done" pseudocode line, languages where it has no source line]
const ALLOWED = {
  bubble: [6, LANGS],
  selection: [5, LANGS],
  insertion: [6, LANGS],
  merge: [6, LANGS],
  heapsort: [6, LANGS],
  bstbuild: [4, LANGS],
  preorder: [4, LANGS],
  postorder: [4, LANGS],
  heapinsert: [5, LANGS],
  dfs: [5, ['py', 'java', 'cpp']],
  subsets: [5, ['java', 'cpp']],
  hanoi: [4, LANGS],
};

const allowed = new Set();
for (const [id, [ln, langs]] of Object.entries(ALLOWED)) for (const l of langs) allowed.add(`${id} ${l} ${ln}`);

let bad = 0;
const seen = new Set();
for (const [id, a] of Object.entries(golden.algorithms)) {
  const lns = new Set(a.steps.map((s) => s[0]).filter((x) => x !== null));
  for (const lang of LANGS) {
    const have = new Set();
    const text = fs.readFileSync(path.join(CODE, `${id}.${lang}.txt`), 'utf8').replace(/\n$/, '');
    for (const line of text.split('\n')) {
      const m = line.match(/^([\d,]*)\|/);
      if (!m) {
        console.log('BAD FORMAT', id, lang, JSON.stringify(line));
        bad++;
        continue;
      }
      if (m[1]) m[1].split(',').forEach((x) => have.add(Number(x)));
    }
    for (const ln of lns) {
      if (have.has(ln)) continue;
      const key = `${id} ${lang} ${ln}`;
      const last = a.steps[a.steps.length - 1][0];
      if (allowed.has(key) && ln === last) {
        seen.add(key);
      } else {
        console.log('MISSING', key);
        bad++;
      }
    }
  }
}
for (const key of allowed) if (!seen.has(key)) console.log('ALLOWED BUT NOT SEEN (remove it):', key), bad++;
console.log(`line coverage: ${seen.size} allowed final "done" gaps, ${bad} problems`);
if (bad) process.exit(1);
