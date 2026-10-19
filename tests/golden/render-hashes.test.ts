import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../../src/engine/algorithms';
import { assignIds } from '../../src/engine/ids';
import { REGISTRY } from '../../src/engine/registry';
import type { Input } from '../../src/engine/types';
import { render } from '../../src/render';

const fixture = JSON.parse(readFileSync(new URL('./render-hashes.json', import.meta.url), 'utf8')) as {
  algorithms: Record<string, { input: Input; widths: Record<string, string[]> }[]>;
};
const sha = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

// `npm run golden:update` also regenerates these drawing fingerprints (same inputs, current renderers).
if (process.env['GOLDEN_UPDATE'] === '1') {
  for (const [id, runs] of Object.entries(fixture.algorithms))
    for (const run of runs)
      for (const w of Object.keys(run.widths)) {
        const steps = GENERATORS[id](JSON.parse(JSON.stringify(run.input)));
        assignIds(steps);
        run.widths[w] = steps.map((s) => sha(render(REGISTRY[id].view, s.st, s.hl, Number(w))));
      }
  writeFileSync(new URL('./render-hashes.json', import.meta.url), JSON.stringify(fixture));
}

describe('renderers reproduce the reference drawings exactly', () => {
  for (const [id, runs] of Object.entries(fixture.algorithms)) {
    it(`${id}: ${runs.length} inputs × 2 widths`, () => {
      runs.forEach((run, r) => {
        for (const [w, hashes] of Object.entries(run.widths)) {
          const steps = GENERATORS[id](JSON.parse(JSON.stringify(run.input)));
          assignIds(steps);
          expect(steps.length).toBe(hashes.length);
          steps.forEach((s, i) => {
            expect(sha(render(REGISTRY[id].view, s.st, s.hl, Number(w))), `${id} input ${r} width ${w} step ${i + 1}`).toBe(hashes[i]);
          });
        }
      });
    });
  }
});
