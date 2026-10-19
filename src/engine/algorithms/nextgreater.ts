import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrInput, Step, StackState } from '../types';

export function nextgreater(inp: ArrInput): Step<StackState>[] {
  const r = new Rec<StackState>();
  const a = [...inp.a];
  const res: (number | string)[] = a.map(() => '?');
  const st = { a, stack: [] as number[], res };
  const idx: number[] = [];
  r.add(
    st,
    {},
    0,
    M(
      'For each number, find the next bigger number to its right. Keep a decreasing stack.',
      'हर अंक के लिए उसके दाईं ओर अगला बड़ा अंक ढूँढें। घटता हुआ स्टैक रखें।',
    ),
  );
  for (let i = 0; i < a.length; i++) {
    while (idx.length && a[idx[idx.length - 1]] < a[i]) {
      const j = idx.pop() as number;
      res[j] = a[i];
      st.stack = idx.map((k) => a[k]);
      r.c.cmp++;
      r.add(
        st,
        { cur: i, ans: j },
        3,
        M(
          `${a[i]} > ${a[j]}, so the next greater of ${a[j]} is ${a[i]}. Pop it.`,
          `${a[i]} > ${a[j]}, इसलिए ${a[j]} का अगला बड़ा ${a[i]} है। इसे निकालें।`,
        ),
      );
    }
    idx.push(i);
    st.stack = idx.map((k) => a[k]);
    r.add(
      st,
      { cur: i, push: true },
      4,
      M(
        `Push ${a[i]} and wait for something bigger.`,
        `${a[i]} डालें और किसी बड़े अंक का इंतज़ार करें।`,
      ),
    );
  }
  idx.forEach((j) => (res[j] = -1));
  st.stack = [];
  r.add(
    st,
    {},
    5,
    M(
      'Items left in the stack have no greater number: -1.',
      'स्टैक में बचे अंकों का कोई बड़ा अंक नहीं: -1।',
    ),
  );
  return r.steps;
}
