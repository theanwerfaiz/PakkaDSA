import { swapArr } from '../helpers';
import { ask, M, NO, YES } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step } from '../types';

export function heapinsert(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a: number[] = [];
  const st = { a, sorted: [] as number[], size: 0 };
  r.add(
    st,
    {},
    null,
    M(
      'Insert into a min-heap: add at the end, then bubble up while smaller than the parent.',
      'मिन-हीप में डालना: आखिर में जोड़ें, फिर पैरेंट से छोटा हो तो ऊपर चढ़ाएँ।',
    ),
  );
  for (const v of inp.a) {
    a.push(v);
    st.size = a.length;
    let i = a.length - 1;
    r.add(
      st,
      { active: [i] },
      0,
      M(`Add ${v} at the next free spot.`, `${v} को अगली खाली जगह पर जोड़ें।`),
    );
    while (i > 0) {
      const p = (i - 1) >> 1;
      r.c.cmp++;
      r.add(
        st,
        { cmp: [i, p] },
        2,
        M(
          `Compare ${a[i]} with its parent ${a[p]}.`,
          `${a[i]} की तुलना उसके पैरेंट ${a[p]} से करें।`,
        ),
        ask(
          `Will ${a[i]} bubble up above ${a[p]}?`,
          `क्या ${a[i]}, ${a[p]} से ऊपर जाएगा?`,
          [YES, NO],
          a[i] < a[p] ? 0 : 1,
        ),
      );
      if (a[i] >= a[p]) {
        r.add(st, { active: [i] }, 4, M('Parent is smaller. Stop.', 'पैरेंट छोटा है। रुकें।'));
        break;
      }
      swapArr(a, i, p);
      r.c.swp++;
      r.add(
        st,
        { swap: [i, p] },
        3,
        M(`Smaller than parent, swap up.`, `पैरेंट से छोटा है, ऊपर बदलें।`),
      );
      i = p;
    }
  }
  r.add(
    st,
    {},
    5,
    M(
      `Min-heap ready. The smallest value ${a[0]} sits at the root.`,
      `मिन-हीप तैयार। सबसे छोटा मान ${a[0]} जड़ पर है।`,
    ),
  );
  return r.steps;
}
