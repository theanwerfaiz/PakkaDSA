// Lists installed packages whose licence is outside the allow-list.
// Known build-only exceptions are documented in docs/DECISIONS.md (D6).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED =
  /^\(?(MIT|ISC|Apache-2\.0|BSD-[23]-Clause|0BSD|BlueOak-1\.0\.0|CC0-1\.0|OFL-1\.1|Python-2\.0|CC-BY-4\.0|Unlicense)/;
const KNOWN = /^(lightningcss(-.*)?|@img\/sharp-libvips-.*|axe-core)$/;

const found = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name.startsWith('@')) {
      walk(path);
      continue;
    }
    const pkgFile = join(path, 'package.json');
    if (!existsSync(pkgFile)) continue;
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));
    const licence =
      typeof pkg.license === 'string' ? pkg.license : (pkg.license?.type ?? 'UNKNOWN');
    if (!ALLOWED.test(licence) && !KNOWN.test(pkg.name)) {
      found.push(`${pkg.name}@${pkg.version} ${licence}`);
    }
    const nested = join(path, 'node_modules');
    if (existsSync(nested)) walk(nested);
  }
}
walk('node_modules');
if (found.length) {
  console.error('Packages with licences outside the allow-list:\n' + found.join('\n'));
  process.exit(1);
}
console.log('Licence check passed');
