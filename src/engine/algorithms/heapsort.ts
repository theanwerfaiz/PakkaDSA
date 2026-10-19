import { swapArr, range } from '../helpers';
import { M, T } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step } from '../types';

export function heapsort(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const n = a.length;
  const st = { a, sorted: [] as number[], size: n };
  r.add(
    st,
    {},
    null,
    M(
      'The array is drawn as a binary tree: children of i are 2i+1 and 2i+2.',
      'ऐरे को बाइनरी ट्री की तरह दिखाया गया है: i के बच्चे 2i+1 और 2i+2 हैं।',
    ),
  );
  function sift(i: number, size: number): void {
    while (true) {
      const l = 2 * i + 1;
      const rr = 2 * i + 2;
      let c = i;
      if (l < size && a[l] > a[c]) c = l;
      if (rr < size && a[rr] > a[c]) c = rr;
      if (l < size) {
        r.c.cmp++;
        r.add(
          st,
          { cmp: [i, c === i ? l : c] },
          4,
          M(`Compare ${a[i]} with its larger child.`, `${a[i]} की तुलना उसके बड़े बच्चे से करें।`),
        );
      }
      if (c === i) {
        r.add(
          st,
          { active: [i] },
          5,
          M(`${a[i]} is bigger than its children. Stop.`, `${a[i]} अपने बच्चों से बड़ा है। रुकें।`),
        );
        return;
      }
      const x = a[i];
      const y = a[c];
      swapArr(a, i, c);
      r.c.swp++;
      r.add(
        st,
        { swap: [i, c] },
        5,
        M(
          `${y} > ${x}, swap them and continue down.`,
          `${y} > ${x}, इन्हें बदलें और नीचे जारी रखें।`,
        ),
      );
      i = c;
    }
  }
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
  r.add(
    st,
    {},
    0,
    M(
      'Max-heap built: the largest item is at the root.',
      'मैक्स-हीप तैयार: सबसे बड़ा अंक जड़ (root) पर है।',
    ),
  );
  for (let e = n - 1; e > 0; e--) {
    const mx = a[0];
    swapArr(a, 0, e);
    r.c.swp++;
    st.size = e;
    st.sorted.push(e);
    r.add(
      st,
      { swap: [0, e] },
      2,
      M(
        `Move the max ${mx} to the end. It is now fixed.`,
        `सबसे बड़े ${mx} को आखिर में ले जाएँ। अब यह तय है।`,
      ),
    );
    sift(0, e);
  }
  st.sorted = range(n);
  st.size = 0;
  r.add(st, {}, 6, T.sorted);
  return r.steps;
}
