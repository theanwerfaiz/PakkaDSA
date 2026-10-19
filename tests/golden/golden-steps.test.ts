import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../../src/engine/algorithms';
import { stepHash } from '../../src/engine/canon';
import { defaultInput } from '../../src/engine/inputs';
import type { Step } from '../../src/engine/types';

type GoldenStep = [number | null, string, string, boolean, string];
const golden = JSON.parse(readFileSync(new URL('./golden-steps.json', import.meta.url), 'utf8')) as {
  algorithms: Record<string, { input?: unknown; steps: GoldenStep[] }>;
};

const run = (id: string): Step[] => GENERATORS[id](defaultInput(id));

// `npm run golden:update` regenerates the file from the current generators. Use it only when a change
// to an algorithm's steps is intended, and explain the change in the pull request.
if (process.env['GOLDEN_UPDATE'] === '1') {
  const fresh = { ...golden, algorithms: {} as Record<string, unknown>, totalSteps: 0 } as Record<string, unknown> & {
    algorithms: Record<string, unknown>;
    totalSteps: number;
  };
  for (const id of Object.keys(GENERATORS)) {
    const steps = run(id);
    const input = defaultInput(id);
    fresh.algorithms[id] = {
      input: input.type === 'grid' ? 'default grid: see default-grid.json' : (golden.algorithms[id] as { input?: unknown })?.input ?? input,
      stepCount: steps.length,
      steps: steps.map((s) => [s.ln, s.m.en, s.m.hi, !!s.ask, stepHash(s.st, s.hl)]),
    };
    fresh.totalSteps += steps.length;
  }
  writeFileSync(new URL('./golden-steps.json', import.meta.url), JSON.stringify(fresh));
}

describe('golden steps', () => {
  it('has a generator for every algorithm in the golden file', () => {
    expect(Object.keys(GENERATORS).sort()).toEqual(Object.keys(golden.algorithms).sort());
  });

  for (const [id, g] of Object.entries(golden.algorithms)) {
    it(`${id} reproduces the reference exactly`, () => {
      const steps = run(id);
      const got = steps.map((s): GoldenStep => [s.ln, s.m.en, s.m.hi, !!s.ask, stepHash(s.st, s.hl)]);
      expect(got.length).toBe(g.steps.length);
      for (let i = 0; i < got.length; i++) expect(got[i], `${id} step ${i + 1}`).toEqual(g.steps[i]);
    });
  }
});
