import { describe, expect, it } from 'vitest';
import { assignIds } from '../../../src/engine/ids';
import { defaultInput, randomInput } from '../../../src/engine/inputs';
import type { Step } from '../../../src/engine/types';
import { NARROW, render, stageHeight, WIDE } from '../../../src/render';
import { gridGeometry } from '../../../src/render/grid';
import { IDS, run, seeded, viewOf } from '../engine/helpers';

const steps = (id: string, input = defaultInput(id)): Step[] => {
  const s = run(id, input);
  assignIds(s);
  return s;
};
const heightOf = (svg: string) => Number(/viewBox="0 0 \d+ ([\d.]+)"/.exec(svg)?.[1]);

describe('every step renders cleanly at both widths', () => {
  const rng = seeded(7);
  for (const id of IDS) {
    it(id, () => {
      const inputs = [
        defaultInput(id),
        ...Array.from({ length: 5 }, () => randomInput(id, viewOf(id), defaultInput(id), rng)),
      ];
      for (const input of inputs) {
        for (const W of [WIDE, NARROW]) {
          for (const [i, s] of steps(id, input).entries()) {
            const svg = render(viewOf(id), s.st, s.hl, W);
            const where = `${id} W=${W} step ${i + 1}`;
            expect(svg, where).not.toMatch(/NaN|undefined|\[object Object\]|Infinity/);
            expect(svg, where).toMatch(
              new RegExp(`^<svg viewBox="0 0 ${W} [\\d.]+" role="img" aria-label="[^"]+"`),
            );
            const keys = [...svg.matchAll(/data-k="([^"]+)"/g)].map((m) => m[1]);
            expect(new Set(keys).size, `${where}: unique keys`).toBe(keys.length);
          }
        }
      }
    });
  }
});

describe('no layout shift', () => {
  it('stageHeight reserves the tallest drawing of every run', () => {
    const rng = seeded(11);
    for (const id of IDS) {
      for (const input of [
        defaultInput(id),
        ...Array.from({ length: 3 }, () => randomInput(id, viewOf(id), defaultInput(id), rng)),
      ]) {
        for (const W of [WIDE, NARROW]) {
          const all = steps(id, input);
          const reserved = stageHeight(viewOf(id), all, W);
          const hs = all.map((s) => heightOf(render(viewOf(id), s.st, s.hl, W)));
          expect(Math.max(...hs), id).toBe(reserved);
        }
      }
    }
  });

  it('most views keep one height for every step of the default run', () => {
    for (const id of IDS) {
      if (id === 'heapinsert') continue; // the heap grows as items are inserted; the stage reserves its final height
      for (const W of [WIDE, NARROW]) {
        const hs = new Set(steps(id).map((s) => heightOf(render(viewOf(id), s.st, s.hl, W))));
        expect(hs.size, `${id} W=${W}`).toBe(1);
      }
    }
  });
});

describe('keyed items glide: same keys across a swap, in stable id order', () => {
  it('bubble sort keeps the same bar keys and only moves the swapped bars', () => {
    const s = steps('bubble');
    const swapAt = s.findIndex((x) => x.hl.swap);
    const before = render('bars', s[swapAt - 1].st, s[swapAt - 1].hl, WIDE);
    const after = render('bars', s[swapAt].st, s[swapAt].hl, WIDE);
    const bars = (svg: string) =>
      [...svg.matchAll(/data-k="(b\d+)" class="k" style="([^"]+)"/g)].map((m) => [m[1], m[2]]);
    const b0 = bars(before);
    const b1 = bars(after);
    expect(b1.map((x) => x[0])).toEqual(b0.map((x) => x[0]));
    const moved = b0.filter((x, i) => x[1] !== b1[i][1]).map((x) => x[0]);
    expect(moved).toHaveLength(2);
  });
});

describe('snapshots', () => {
  for (const [id, step] of [
    ['bubble', 3],
    ['parens', 5],
    ['reverselist', 4],
    ['bstsearch', 3],
    ['dijkstra', 6],
    ['lcs', 10],
    ['hanoi', 4],
  ] as const) {
    it(`${id} step ${step}`, () => {
      const s = steps(id)[step - 1];
      expect(render(viewOf(id), s.st, s.hl, WIDE)).toMatchSnapshot();
      expect(render(viewOf(id), s.st, s.hl, NARROW)).toMatchSnapshot();
    });
  }
});

describe('grid geometry', () => {
  it('fits 25 columns inside both widths', () => {
    for (const W of [WIDE, NARROW]) {
      const g = gridGeometry({ R: 13, C: 25 }, W);
      expect(g.x0).toBeGreaterThanOrEqual(0);
      expect(g.x0 * 2 + g.cs * 25).toBeCloseTo(W);
    }
  });

  it('draws an empty tree placeholder', () => {
    expect(render('tree', { n: [], root: -1, out: [] }, {}, WIDE)).toContain('empty tree');
  });
});
