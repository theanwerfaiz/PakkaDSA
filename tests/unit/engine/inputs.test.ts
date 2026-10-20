import { describe, expect, it } from 'vitest';
import {
  ARRAY_LIMITS,
  defaultGrid,
  defaultInput,
  ERR,
  parseNums,
  randomInput,
  validateInput,
  type InputFields,
} from '../../../src/engine/inputs';
import type { Input, ViewType } from '../../../src/engine/types';
import { IDS, seeded, viewOf } from './helpers';

const nums = (n: number, v = 5) => Array.from({ length: n }, () => v).join(', ');
const check = (id: string, fields: InputFields) =>
  validateInput(id, viewOf(id), defaultInput(id), fields);
const ok = (id: string, fields: InputFields) =>
  expect(check(id, fields).ok, JSON.stringify(fields)).toBe(true);
const fails = (id: string, fields: InputFields, error: { en: string; hi: string }) =>
  expect(check(id, fields)).toEqual({ ok: false, error });

/** Turns an input back into form text, as the input panel would show it. */
function toFields(i: Input): InputFields {
  switch (i.type) {
    case 'arr':
      return { a: i.a.join(', ') };
    case 'arrt':
      return { a: i.a.join(', '), t: String(i.t) };
    case 'arrk':
      return { a: i.a.join(', '), k: String(i.k) };
    case 'arrc':
      return { a: i.a.join(', '), c: String(i.c) };
    case 'str':
      return { s: i.s };
    case 'n':
      return { n: String(i.n) };
    case 'node':
      return { s: i.s };
    case 'coins':
      return { amt: String(i.amt), coins: i.coins.join(', ') };
    case 'two':
      return { s1: i.s1, s2: i.s2 };
    case 'knap':
      return { items: i.items.map(([w, v]) => `${w}:${v}`).join(', '), cap: String(i.cap) };
    default:
      return {};
  }
}

describe('defaults', () => {
  it('gives every algorithm a fresh default input that passes validation', () => {
    for (const id of IDS) {
      const i = defaultInput(id);
      expect(defaultInput(id)).not.toBe(i);
      expect(validateInput(id, viewOf(id), i, toFields(i)).ok, id).toBe(true);
    }
  });

  it('fills the default 13 × 25 grid for grid algorithms', () => {
    const i = defaultInput('gridbfs');
    expect(i.type === 'grid' && i.grid).toEqual(defaultGrid());
    expect(defaultGrid()).toMatchObject({ R: 13, C: 25, start: [6, 2], end: [6, 22] });
  });

  it('rejects unknown algorithms', () => {
    expect(() => defaultInput('nope')).toThrow();
  });
});

describe('array limits per view', () => {
  const sample: Record<string, string> = {
    bars: 'bubble',
    cells: 'kadane',
    stack: 'nextgreater',
    list: 'reverselist',
    tree: 'inorder',
    heap: 'heapsort',
    sets: 'subsets',
  };
  for (const [view, [lo, hi]] of Object.entries(ARRAY_LIMITS) as [ViewType, [number, number]][]) {
    it(`${view}: ${lo}–${hi} numbers`, () => {
      const id = sample[view];
      ok(id, { a: nums(lo) });
      ok(id, { a: nums(hi) });
      fails(id, { a: nums(hi + 1) }, ERR.count(lo, hi));
      if (lo > 1) fails(id, { a: nums(lo - 1) }, ERR.count(lo, hi));
    });
  }

  it('numbers must be whole and within −999…999', () => {
    ok('bubble', { a: '-999, 999' });
    fails('bubble', { a: '-1000, 3' }, ERR.range);
    fails('bubble', { a: '1000, 3' }, ERR.range);
    fails('bubble', { a: '1.5, 3' }, ERR.nums);
    fails('bubble', { a: 'a, b' }, ERR.nums);
    fails('bubble', { a: '' }, ERR.count(2, 16));
  });

  it('accepts commas and spaces as separators', () => {
    expect(parseNums('3,1  4 ,1')).toEqual([3, 1, 4, 1]);
  });

  it('water heights cannot be negative', () => {
    ok('water', { a: '0, 3' });
    fails('water', { a: '-1, 3' }, ERR.negWall);
  });
});

describe('other fields', () => {
  it('target must be a whole number', () => {
    ok('linear', { a: '1, 2', t: '-5' });
    fails('linear', { a: '1, 2', t: '2.5' }, ERR.target);
    fails('linear', { a: '1, 2', t: 'x' }, ERR.target);
  });

  it('k must be 1…length', () => {
    ok('maxsumk', { a: '1, 2, 3', k: '1' });
    ok('maxsumk', { a: '1, 2, 3', k: '3' });
    fails('maxsumk', { a: '1, 2, 3', k: '0' }, ERR.k(3));
    fails('maxsumk', { a: '1, 2, 3', k: '4' }, ERR.k(3));
  });

  it('cycle index must be −1…length−1', () => {
    ok('cyclelist', { a: '1, 2, 3', c: '-1' });
    ok('cyclelist', { a: '1, 2, 3', c: '2' });
    fails('cyclelist', { a: '1, 2, 3', c: '-2' }, ERR.cycle(3));
    fails('cyclelist', { a: '1, 2, 3', c: '3' }, ERR.cycle(3));
  });

  it('strings are 1–14 characters; parentheses allow only brackets', () => {
    ok('longestuniq', { s: 'a' });
    ok('longestuniq', { s: 'a'.repeat(14) });
    fails('longestuniq', { s: 'a'.repeat(15) }, ERR.str);
    fails('longestuniq', { s: '  ' }, ERR.str);
    ok('parens', { s: '([]{})' });
    fails('parens', { s: '(a)' }, ERR.parens);
  });

  it('n stays within each algorithm’s range', () => {
    for (const [id, lo, hi] of [
      ['fib', 2, 20],
      ['nqueens', 4, 8],
      ['hanoi', 2, 6],
    ] as const) {
      ok(id, { n: String(lo) });
      ok(id, { n: String(hi) });
      fails(id, { n: String(lo - 1) }, ERR.n(lo, hi));
      fails(id, { n: String(hi + 1) }, ERR.n(lo, hi));
    }
  });

  it('coin change: amount 1–30, coins 1–30, deduplicated and sorted', () => {
    expect(check('coins', { amt: '30', coins: '5, 1, 5, 30' })).toMatchObject({
      ok: true,
      input: { amt: 30, coins: [1, 5, 30] },
    });
    ok('coins', { amt: '1', coins: '1' });
    fails('coins', { amt: '0', coins: '1' }, ERR.amt);
    fails('coins', { amt: '31', coins: '1' }, ERR.amt);
    fails('coins', { amt: '5', coins: '0, 1' }, ERR.coins);
    fails('coins', { amt: '5', coins: '31' }, ERR.coins);
    fails('coins', { amt: '5', coins: '' }, ERR.coins);
  });

  it('two strings: 1–10 characters each, uppercased', () => {
    expect(check('lcs', { s1: 'abc', s2: 'b' })).toMatchObject({
      ok: true,
      input: { s1: 'ABC', s2: 'B' },
    });
    ok('lcs', { s1: 'A'.repeat(10), s2: 'B' });
    fails('lcs', { s1: 'A'.repeat(11), s2: 'B' }, ERR.two);
    fails('lcs', { s1: '', s2: 'B' }, ERR.two);
  });

  it('knapsack: 1–6 items of weight:value 1–99, capacity 1–12', () => {
    ok('knap', { items: '1:1', cap: '1' });
    ok('knap', { items: '1:1 2:2 3:3 4:4 5:5 99:99', cap: '12' });
    fails('knap', { items: '1:1 2:2 3:3 4:4 5:5 6:6 7:7', cap: '5' }, ERR.items);
    fails('knap', { items: '1:100', cap: '5' }, ERR.items);
    fails('knap', { items: '0:1', cap: '5' }, ERR.items);
    fails('knap', { items: '1-1', cap: '5' }, ERR.items);
    fails('knap', { items: '', cap: '5' }, ERR.items);
    fails('knap', { items: '1:1', cap: '0' }, ERR.cap);
    fails('knap', { items: '1:1', cap: '13' }, ERR.cap);
  });

  it('start node must be one of the fixed graph’s nodes', () => {
    expect(check('bfs', { s: 'H' })).toMatchObject({ ok: true, input: { s: 'H' } });
    fails('bfs', { s: 'Z' }, ERR.node);
    fails('dijkstra', { s: '' }, ERR.node);
  });

  it('every error exists in both languages', () => {
    const msgs = [...Object.values(ERR)].map((e) =>
      typeof e === 'function'
        ? (e as (a: number, b: number) => { en: string; hi: string })(1, 2)
        : e,
    );
    for (const m of msgs) {
      expect(m.en.length).toBeGreaterThan(0);
      expect(m.hi.length).toBeGreaterThan(0);
    }
  });

  it('never throws on junk and never changes the current input', () => {
    const junk = ['', ' ', 'NaN', 'Infinity', '1e400', '[]', '{}', '١٢', '\u0000', '9'.repeat(400)];
    for (const id of IDS) {
      const current = defaultInput(id);
      const before = JSON.stringify(current);
      for (const j of junk) {
        const fields = Object.fromEntries(
          ['a', 't', 'k', 'c', 's', 'n', 'amt', 'coins', 's1', 's2', 'items', 'cap'].map((k) => [
            k,
            j,
          ]),
        );
        expect(() => validateInput(id, viewOf(id), current, fields)).not.toThrow();
      }
      expect(JSON.stringify(current)).toBe(before);
    }
  });
});

describe('random inputs', () => {
  it('always produce input that passes validation (seeded, 100 per algorithm)', () => {
    const rng = seeded(42);
    for (const id of IDS) {
      for (let k = 0; k < 100; k++) {
        const i = randomInput(id, viewOf(id), defaultInput(id), rng);
        if (i.type === 'grid') {
          expect(i.grid.walls).not.toContain(i.grid.start[0] * i.grid.C + i.grid.start[1]);
          continue;
        }
        const res = validateInput(id, viewOf(id), i, toFields(i));
        expect(res.ok, `${id} ${JSON.stringify(i)}`).toBe(true);
      }
    }
  });
});
