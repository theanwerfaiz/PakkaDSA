import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type GoldenStep = [number | null, string, string, boolean, string];
interface Golden {
  totalSteps: number;
  algorithms: Record<string, { stepCount: number; steps: GoldenStep[] }>;
}

const golden = JSON.parse(
  readFileSync(new URL('./golden-steps.json', import.meta.url), 'utf8'),
) as Golden;

describe('golden file', () => {
  it('covers 38 algorithms and 1,012 steps', () => {
    const algorithms = Object.values(golden.algorithms);
    expect(algorithms).toHaveLength(38);
    expect(golden.totalSteps).toBe(1012);
    expect(algorithms.reduce((n, a) => n + a.steps.length, 0)).toBe(1012);
  });

  it('has a well-formed entry for every step', () => {
    for (const [id, a] of Object.entries(golden.algorithms)) {
      expect(a.steps.length, id).toBe(a.stepCount);
      for (const [ln, en, hi, quiz, hash] of a.steps) {
        expect(ln === null || (Number.isInteger(ln) && ln >= 0), id).toBe(true);
        expect(en.length > 0 && hi.length > 0, id).toBe(true);
        expect(typeof quiz, id).toBe('boolean');
        expect(hash, id).toMatch(/^[0-9a-f]{12}$/);
      }
    }
  });
});
