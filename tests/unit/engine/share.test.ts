import { describe, expect, it } from 'vitest';
import { defaultGrid, defaultInput, inputFromData, randomInput } from '../../../src/engine/inputs';
import { IDS, seeded, viewOf } from './helpers';

const from = (id: string, raw: unknown) => inputFromData(id, viewOf(id), raw);

describe('inputs from share links', () => {
  it('round-trips every default and random input', () => {
    const rng = seeded(5);
    for (const id of IDS) {
      for (const input of [
        defaultInput(id),
        ...Array.from({ length: 20 }, () => randomInput(id, viewOf(id), defaultInput(id), rng)),
      ]) {
        const back = from(id, JSON.parse(JSON.stringify(input)));
        expect(back, id).toEqual(
          id === 'coins' && input.type === 'coins'
            ? { ...input, coins: [...new Set(input.coins)].sort((a, b) => a - b) }
            : input,
        );
      }
    }
  });

  it('rejects junk, the wrong input type and values outside the limits', () => {
    for (const raw of [
      null,
      5,
      'x',
      [],
      {},
      { type: 'arr' },
      { type: 'arr', a: 'oops' },
      { type: 'arr', a: [1] },
      { type: 'arr', a: [1, 'x'] },
    ])
      expect(from('bubble', raw)).toBeNull();
    expect(from('bubble', { type: 'str', s: 'abc' })).toBeNull();
    expect(from('bubble', { type: 'arr', a: [1, 2000] })).toBeNull();
    expect(from('linear', { type: 'arrt', a: [1, 2], t: 1.5 })).toBeNull();
    expect(from('bfs', { type: 'node', s: 'Z' })).toBeNull();
    expect(from('knap', { type: 'knap', items: [[1, 2, 3]], cap: 4 })).toBeNull();
    expect(from('hanoi', { type: 'n', n: 99, lo: 2, hi: 99 })).toBeNull(); // limits come from the algorithm, not the link
  });

  it('accepts a valid grid and rejects malformed ones', () => {
    const g = defaultGrid();
    expect(from('gridbfs', { type: 'grid', grid: g })).toEqual({ type: 'grid', grid: g });
    const bad = [
      { ...g, R: 100 },
      { ...g, walls: [-1] },
      { ...g, walls: [999] },
      { ...g, walls: [6 * 25 + 2] },
      { ...g, start: [6, 22] },
      { ...g, start: [13, 0] },
      { ...g, end: ['a', 1] },
      { ...g, walls: 'x' },
    ];
    for (const grid of bad) expect(from('astar', { type: 'grid', grid })).toBeNull();
    expect(from('astar', { type: 'grid', grid: { ...g, walls: [1, 1, 2] } })?.type === 'grid').toBe(
      true,
    );
  });

  it('topological sort has nothing to share but its type', () => {
    expect(from('topo', { type: 'none' })).toEqual({ type: 'none' });
  });
});
