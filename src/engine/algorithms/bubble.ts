import { swapArr, range } from '../helpers';
import { ask, M, NO, T, YES } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step } from '../types';

export function bubble(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const n = a.length;
  const st = { a, sorted: [] as number[] };
  r.add(st, {}, null, T.start);
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      r.c.cmp++;
      r.add(
        st,
        { cmp: [j, j + 1] },
        2,
        T.cmp(a[j], a[j + 1]),
        ask(
          `Will ${a[j]} and ${a[j + 1]} swap?`,
          `क्या ${a[j]} और ${a[j + 1]} की जगह बदलेगी?`,
          [YES, NO],
          a[j] > a[j + 1] ? 0 : 1,
        ),
      );
      if (a[j] > a[j + 1]) {
        const x = a[j];
        const y = a[j + 1];
        swapArr(a, j, j + 1);
        r.c.swp++;
        swapped = true;
        r.add(st, { swap: [j, j + 1] }, 3, T.swap(x, y));
      } else r.add(st, { cmp: [j, j + 1] }, 2, T.keep(a[j], a[j + 1]));
    }
    st.sorted.push(n - 1 - i);
    r.add(st, {}, 4, T.fixed(a[n - 1 - i]));
    if (!swapped) {
      for (let k = 0; k < n - 1 - i; k++) st.sorted.push(k);
      r.add(
        st,
        {},
        5,
        M(
          'No swaps in this pass, so everything left is already sorted.',
          'इस पास में कोई अदला-बदली नहीं हुई, यानी बाकी सब पहले से क्रम में है।',
        ),
      );
      break;
    }
  }
  st.sorted = range(n);
  r.add(st, {}, 6, T.sorted);
  return r.steps;
}
