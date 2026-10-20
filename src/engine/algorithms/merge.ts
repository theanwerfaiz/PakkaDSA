import { range } from '../helpers';
import { M, T } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step, Vars } from '../types';

export function merge(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const n = a.length;
  const st = { a, sorted: [] as number[], vars: {} as Vars };
  r.add(st, {}, null, T.start);
  const list = (x: number[]) => '[' + x.join(', ') + ']';
  function ms(lo: number, hi: number): void {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    st.vars = {};
    r.add(
      st,
      { region: [lo, hi] },
      1,
      M(
        `Split [${lo}..${hi}] into two halves at index ${mid}.`,
        `[${lo}..${hi}] को इंडेक्स ${mid} पर दो हिस्सों में बाँटें।`,
      ),
    );
    ms(lo, mid);
    ms(mid + 1, hi);
    const L = a.slice(lo, mid + 1);
    const Rr = a.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;
    st.vars = { left: list(L), right: list(Rr) };
    r.add(
      st,
      { region: [lo, hi] },
      3,
      M(
        `Merge the sorted halves [${L}] and [${Rr}].`,
        `क्रमबद्ध हिस्सों [${L}] और [${Rr}] को जोड़ें।`,
      ),
    );
    while (i < L.length && j < Rr.length) {
      r.c.cmp++;
      const take = L[i] <= Rr[j] ? L[i++] : Rr[j++];
      a[k] = take;
      st.vars = { left: list(L.slice(i)), right: list(Rr.slice(j)) };
      r.add(
        st,
        { active: [k], region: [lo, hi] },
        4,
        M(`Take the smaller front item: ${take}.`, `आगे वाले दोनों में से छोटा लें: ${take}।`),
      );
      k++;
    }
    while (i < L.length) {
      a[k] = L[i++];
      st.vars = { left: list(L.slice(i)), right: '[]' };
      r.add(
        st,
        { active: [k], region: [lo, hi] },
        5,
        M(`Copy the leftover ${a[k]}.`, `बचा हुआ ${a[k]} कॉपी करें।`),
      );
      k++;
    }
    while (j < Rr.length) {
      a[k] = Rr[j++];
      st.vars = { left: '[]', right: list(Rr.slice(j)) };
      r.add(
        st,
        { active: [k], region: [lo, hi] },
        5,
        M(`Copy the leftover ${a[k]}.`, `बचा हुआ ${a[k]} कॉपी करें।`),
      );
      k++;
    }
  }
  ms(0, n - 1);
  st.vars = {};
  st.sorted = range(n);
  r.add(st, {}, 6, T.sorted);
  return r.steps;
}
