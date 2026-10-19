import { swapArr, range } from '../helpers';
import { ask, M, NO, T, YES } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step } from '../types';

export function quick(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const n = a.length;
  const st = { a, sorted: [] as number[] };
  r.add(st, {}, null, T.start);
  function qs(lo: number, hi: number): void {
    if (lo > hi) return;
    if (lo === hi) {
      st.sorted.push(lo);
      r.add(st, { region: [lo, hi] }, 0, T.fixed(a[lo]));
      return;
    }
    const p = a[hi];
    let i = lo;
    r.add(
      st,
      { pivot: hi, region: [lo, hi], ptr: { i } },
      1,
      M(`Choose the last item ${p} as the pivot.`, `आखिरी अंक ${p} को pivot चुनें।`),
    );
    for (let j = lo; j < hi; j++) {
      r.c.cmp++;
      r.add(
        st,
        { pivot: hi, cmp: [j, hi], region: [lo, hi], ptr: { i, j } },
        3,
        M(`Is ${a[j]} smaller than the pivot ${p}?`, `क्या ${a[j]}, pivot ${p} से छोटा है?`),
        ask(`Is ${a[j]} < pivot ${p}?`, `क्या ${a[j]} < pivot ${p}?`, [YES, NO], a[j] < p ? 0 : 1),
      );
      if (a[j] < p) {
        if (i !== j) {
          swapArr(a, i, j);
          r.c.swp++;
        }
        r.add(
          st,
          { pivot: hi, swap: [i, j], region: [lo, hi], ptr: { i, j } },
          3,
          M(
            `Yes. Move ${a[i]} into the "smaller" zone.`,
            `हाँ। ${a[i]} को "छोटे" वाले हिस्से में ले जाएँ।`,
          ),
        );
        i++;
      }
    }
    swapArr(a, i, hi);
    r.c.swp++;
    st.sorted.push(i);
    r.add(
      st,
      { swap: [i, hi], region: [lo, hi] },
      4,
      M(
        `Put the pivot ${p} at index ${i}. It is now in its final place.`,
        `pivot ${p} को इंडेक्स ${i} पर रखें। अब यह अपनी सही जगह पर है।`,
      ),
    );
    qs(lo, i - 1);
    qs(i + 1, hi);
  }
  qs(0, n - 1);
  st.sorted = range(n);
  r.add(st, {}, 5, T.sorted);
  return r.steps;
}
