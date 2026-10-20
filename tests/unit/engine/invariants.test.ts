import { describe, expect, it } from 'vitest';
import { defaultInput, randomInput } from '../../../src/engine/inputs';
import type { Input, Step } from '../../../src/engine/types';
import { IDS, last, META, run, seeded, viewOf } from './helpers';

const BAD_TEXT = /undefined|NaN|\[object Object\]/;

function checkInvariants(id: string, input: Input, steps: Step[]): void {
  const lines = META[id].pseudocode.length;
  expect(steps.length, `${id}: at least 2 steps`).toBeGreaterThanOrEqual(2);
  expect(steps.length, `${id}: at most 2,000 steps`).toBeLessThanOrEqual(2000);
  steps.forEach((s, i) => {
    const where = `${id} step ${i + 1}`;
    expect(
      s.ln === null || (Number.isInteger(s.ln) && s.ln >= 0 && s.ln < lines),
      `${where}: ln in range`,
    ).toBe(true);
    for (const text of [s.m.en, s.m.hi]) {
      expect(text.length, `${where}: message not empty`).toBeGreaterThan(0);
      expect(text, where).not.toMatch(BAD_TEXT);
    }
    if (s.ask) {
      expect(s.ask.opts.length, `${where}: 2–3 options`).toBeGreaterThanOrEqual(2);
      expect(s.ask.opts.length, `${where}: 2–3 options`).toBeLessThanOrEqual(3);
      expect(
        Number.isInteger(s.ask.ans) && s.ask.ans >= 0 && s.ask.ans < s.ask.opts.length,
        where,
      ).toBe(true);
      for (const t of [s.ask.q.en, s.ask.q.hi, ...s.ask.opts.flatMap((o) => [o.en, o.hi])]) {
        expect(t.length, where).toBeGreaterThan(0);
        expect(t, where).not.toMatch(BAD_TEXT);
      }
    }
    expect(s.c.cmp >= 0 && s.c.swp >= 0, where).toBe(true);
  });
  expect(last(steps).ask, `${id}: no question on the final step`).toBeNull();
  checkFirstStep(id, input, steps[0]);
}

/** The first step shows the input data (for views whose state mirrors the input directly). */
function checkFirstStep(id: string, input: Input, first: Step): void {
  const st = first.st as Record<string, unknown>;
  const view = viewOf(id);
  if (id === 'heapinsert' || id === 'bstbuild') return; // these start empty and insert one by one
  if (
    (view === 'bars' || view === 'cells' || view === 'heap' || view === 'stack') &&
    'a' in input
  ) {
    const expected =
      id === 'binary' || id === 'pairsum' ? [...input.a].sort((x, y) => x - y) : input.a;
    expect(st.a, `${id}: first step shows the input`).toEqual(expected);
  }
  if (input.type === 'str') expect(st.a).toEqual([...input.s]);
  if (view === 'list' && 'a' in input) expect(st.v).toEqual(input.a);
  if (view === 'tree' && 'a' in input) expect((st.n as unknown[]).length).toBe(input.a.length);
}

describe('generator invariants', () => {
  for (const id of IDS) {
    it(`${id}: default input`, () => {
      const input = defaultInput(id);
      checkInvariants(id, input, run(id, input));
    });

    it(`${id}: 60 random inputs (seeded)`, () => {
      const rng = seeded(id.length * 7919);
      for (let k = 0; k < 60; k++) {
        const input = randomInput(id, viewOf(id), defaultInput(id), rng);
        checkInvariants(id, input, run(id, input));
      }
    });

    it(`${id}: deterministic`, () => {
      const input = defaultInput(id);
      expect(JSON.stringify(run(id, input))).toBe(JSON.stringify(run(id, input)));
    });

    it(`${id}: no mutation leak`, () => {
      const input = defaultInput(id);
      const steps = META[id] && GENERATORS_RUN(id, input);
      const before = JSON.stringify(steps);
      mutateDeep(input);
      expect(JSON.stringify(steps)).toBe(before);
    });
  }
});

// Runs the generator on the input object itself (no defensive copy) to prove generators do not
// keep references into their input.
import { GENERATORS } from '../../../src/engine/algorithms';
const GENERATORS_RUN = (id: string, input: Input) => GENERATORS[id](input);

function mutateDeep(o: unknown): void {
  if (Array.isArray(o)) {
    for (let i = 0; i < o.length; i++) {
      if (typeof o[i] === 'number') o[i] = -12345;
      else if (typeof o[i] === 'string') o[i] = 'Z';
      else mutateDeep(o[i]);
    }
    o.push(7);
  } else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) {
      if (k === 'type') continue;
      if (typeof v === 'number') (o as Record<string, unknown>)[k] = -12345;
      else if (typeof v === 'string') (o as Record<string, unknown>)[k] = 'ZZ';
      else mutateDeep(v);
    }
  }
}
