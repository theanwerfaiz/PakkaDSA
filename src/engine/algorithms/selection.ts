import { swapArr, range } from '../helpers';
import { ask, M, NO, T, YES } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step } from '../types';

export function selection(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const n = a.length;
  const st = { a, sorted: [] as number[] };
  r.add(st, {}, null, T.start);
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    r.add(
      st,
      { active: [m], ptr: { i, min: m } },
      1,
      M(
        `Assume ${a[m]} (index ${i}) is the smallest for now.`,
        `मान लें अभी ${a[m]} (इंडेक्स ${i}) सबसे छोटा है।`,
      ),
    );
    for (let j = i + 1; j < n; j++) {
      r.c.cmp++;
      r.add(
        st,
        { cmp: [j, m], ptr: { i, j, min: m } },
        3,
        T.cmp(a[j], a[m]),
        ask(
          `Is ${a[j]} smaller than the current minimum ${a[m]}?`,
          `क्या ${a[j]} मौजूदा सबसे छोटे ${a[m]} से छोटा है?`,
          [YES, NO],
          a[j] < a[m] ? 0 : 1,
        ),
      );
      if (a[j] < a[m]) {
        m = j;
        r.add(
          st,
          { active: [m], ptr: { i, j, min: m } },
          3,
          M(`${a[m]} is the new minimum.`, `${a[m]} नया सबसे छोटा है।`),
        );
      }
    }
    if (m !== i) {
      const x = a[i];
      const y = a[m];
      swapArr(a, i, m);
      r.c.swp++;
      r.add(
        st,
        { swap: [i, m] },
        4,
        M(`Swap ${x} with the minimum ${y}.`, `${x} को सबसे छोटे ${y} से बदलें।`),
      );
    }
    st.sorted.push(i);
    r.add(st, {}, 4, T.fixed(a[i]));
  }
  st.sorted = range(n);
  r.add(st, {}, 5, T.sorted);
  return r.steps;
}
