// Fails if any page's initial JavaScript (entry scripts plus everything they import statically)
// is over 150 KB gzipped. Lazily imported chunks (generators, code snippets) are not counted.
//   npm run build && node scripts/check-budget.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const LIMIT = 150 * 1024;
const DIST = 'dist';
const walk = (d) =>
  readdirSync(d).flatMap((n) =>
    statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)],
  );

function staticClosure(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  const src = readFileSync(file, 'utf8');
  // Static imports only: `import ... from "./x.js"` and bare `import "./x.js"`, not import().
  for (const m of src.matchAll(/(?:^|[;}\s])import\s*(?:[\w*{}\s,$]+from\s*)?["'](\.[^"']+)["']/g))
    staticClosure(resolve(dirname(file), m[1]), seen);
  return seen;
}

let worst = 0;
let failed = false;
for (const html of walk(DIST).filter((f) => f.endsWith('.html'))) {
  const page = readFileSync(html, 'utf8');
  const files = new Set();
  for (const m of page.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g))
    for (const f of staticClosure(join(DIST, m[1]))) files.add(f);
  const inline = [
    ...page.matchAll(
      /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ]
    .map((m) => m[1])
    .join('');
  const bytes =
    [...files].reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0) + gzipSync(inline).length;
  worst = Math.max(worst, bytes);
  if (bytes > LIMIT) {
    failed = true;
    console.log(`over budget: ${html} ${(bytes / 1024).toFixed(1)} KB`);
  }
}
console.log(
  `largest initial JavaScript: ${(worst / 1024).toFixed(1)} KB gzipped (limit ${LIMIT / 1024} KB)`,
);
process.exit(failed ? 1 : 0);
