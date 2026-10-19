// Astro integration: after the build, writes dist/sw.js with a list of every built file to cache,
// so the whole site works offline after the first visit. No third-party service-worker library.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP = /(^|\/)(_headers|sw\.js|robots\.txt|sitemap\.xml)$|\.map$|^og\//;

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

export default function serviceWorker() {
  return {
    name: 'pakkadsa-service-worker',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        const files = walk(root)
          .map((f) => relative(root, f).split(sep).join('/'))
          .filter((f) => !SKIP.test(f))
          .sort();
        const urls = files.map((f) => '/' + f.replace(/(^|\/)index\.html$/, '$1'));
        const hash = createHash('sha1');
        for (const f of files) hash.update(f).update(readFileSync(join(root, f)));
        const template = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8');
        const sw = template
          .replace('__VERSION__', hash.digest('hex').slice(0, 12))
          .replace('__PRECACHE__', JSON.stringify(urls));
        writeFileSync(join(root, 'sw.js'), sw);
      },
    },
  };
}
