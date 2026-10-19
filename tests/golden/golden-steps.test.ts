import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../../src/engine/algorithms';
import { stepHash } from '../../src/engine/canon';
import { defaultInput } from '../../src/engine/inputs';
import type { Step } from '../../src/engine/types';

type GoldenStep = [number | null, string, string, boolean, string];
const golden = JSON.parse(readFileSync(new URL('./golden-steps.json', import.meta.url), 'utf8')) as {
  algorithms: Record<string, { steps: GoldenStep[] }>;
};

const run = (id: string): Step[] => GENERATORS[id](defaultInput(id));

describe('golden steps', () => {
  for (const [id, g] of Object.entries(golden.algorithms)) {
    it.runIf(id in GENERATORS)(`${id} reproduces the reference exactly`, () => {
      const steps = run(id);
      const got = steps.map((s): GoldenStep => [s.ln, s.m.en, s.m.hi, !!s.ask, stepHash(s.st, s.hl)]);
      expect(got.length).toBe(g.steps.length);
      for (let i = 0; i < got.length; i++) expect(got[i], `${id} step ${i + 1}`).toEqual(g.steps[i]);
    });
  }
});
