import { swapArr, range } from '../helpers';
import { ask, M, NO, T, YES } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step } from '../types';

export function insertion(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const n = a.length;
  const st = { a, sorted: [0] };
  r.add(
    st,
    { region: [0, 0] },
    null,
    M(
      'The first item alone is a sorted part of size 1.',
      'पहला अंक अकेला ही 1 आकार का क्रमबद्ध हिस्सा है।',
    ),
  );
  for (let i = 1; i < n; i++) {
    let j = i;
    r.add(
      st,
      { active: [i], region: [0, i - 1] },
      1,
      M(
        `Pick ${a[i]} as the key to insert into the sorted part.`,
        `${a[i]} को key चुनें, इसे क्रमबद्ध हिस्से में डालना है।`,
      ),
    );
    while (j > 0) {
      r.c.cmp++;
      const mv = a[j - 1] > a[j];
      r.add(
        st,
        { cmp: [j - 1, j], region: [0, i] },
        3,
        T.cmp(a[j - 1], a[j]),
        ask(
          `Will ${a[j]} move left past ${a[j - 1]}?`,
          `क्या ${a[j]}, ${a[j - 1]} को पार करके बाईं ओर जाएगा?`,
          [YES, NO],
          mv ? 0 : 1,
        ),
      );
      if (!mv) {
        r.add(
          st,
          { active: [j], region: [0, i] },
          5,
          M(
            `${a[j - 1]} ≤ ${a[j]}, so the key stops here.`,
            `${a[j - 1]} ≤ ${a[j]}, इसलिए key यहीं रुक जाती है।`,
          ),
        );
        break;
      }
      swapArr(a, j, j - 1);
      r.c.swp++;
      r.add(
        st,
        { swap: [j - 1, j], region: [0, i] },
        4,
        M(`${a[j]} is bigger, so it shifts right.`, `${a[j]} बड़ा है, इसलिए दाईं ओर खिसकता है।`),
      );
      j--;
    }
    st.sorted = range(i + 1);
  }
  st.sorted = range(n);
  r.add(st, {}, 6, T.sorted);
  return r.steps;
}
