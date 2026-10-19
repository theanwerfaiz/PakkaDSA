import { describe, expect, it } from 'vitest';
import { assignIds } from '../../../src/engine/ids';
import { defaultInput } from '../../../src/engine/inputs';
import type { ArrayState, Step } from '../../../src/engine/types';
import { IDS, run, viewOf } from './helpers';

const steps = (...arrays: (number | string)[][]): Step<ArrayState>[] =>
  arrays.map((a) => ({
    st: { a },
    hl: {},
    ln: null,
    m: { en: 'x', hi: 'x' },
    ask: null,
    c: { cmp: 0, swp: 0 },
  }));
const idsOf = (s: Step<ArrayState>[]) => s.map((x) => x.st.ids);

describe('assignIds', () => {
  it('numbers the first step 0..n-1', () => {
    const s = steps([5, 6, 7]);
    assignIds(s);
    expect(idsOf(s)).toEqual([[0, 1, 2]]);
  });

  it('keeps ids for unchanged positions and exchanges them on a swap', () => {
    const s = steps([1, 2, 3], [1, 2, 3], [2, 1, 3]);
    assignIds(s);
    expect(idsOf(s)).toEqual([
      [0, 1, 2],
      [0, 1, 2],
      [1, 0, 2],
    ]);
  });

  it('gives overwritten values fresh ids and handles growth and shrinking', () => {
    const s = steps([1, 2], [1, 9], [1, 9, 4], [9]);
    assignIds(s);
    expect(idsOf(s)).toEqual([[0, 1], [0, 2], [0, 2, 3], [2]]);
  });

  it('matches duplicates to the nearest previous position, deterministically', () => {
    const s = steps([3, 1, 3], [1, 3, 3]);
    assignIds(s);
    expect(idsOf(s)[1]).toEqual([1, 0, 2]);
    const again = steps([3, 1, 3], [1, 3, 3]);
    assignIds(again);
    expect(idsOf(again)).toEqual(idsOf(s));
  });

  it('gives unique ids within every step of every array algorithm', () => {
    for (const id of IDS) {
      if (!['bars', 'cells', 'heap'].includes(viewOf(id))) continue;
      const all = run<ArrayState>(id, defaultInput(id));
      assignIds(all as Step[]);
      for (const s of all) {
        expect(s.st.ids?.length, id).toBe(s.st.a.length);
        expect(new Set(s.st.ids).size, id).toBe(s.st.a.length);
      }
    }
  });

  it('ignores steps whose state has no array', () => {
    const s: Step[] = [
      {
        st: { v: [1] },
        hl: {},
        ln: null,
        m: { en: 'x', hi: 'x' },
        ask: null,
        c: { cmp: 0, swp: 0 },
      },
    ];
    assignIds(s);
    expect(s[0].st).toEqual({ v: [1] });
  });
});
