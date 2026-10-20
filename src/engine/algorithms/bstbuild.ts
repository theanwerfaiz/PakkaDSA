import { ask, M } from '../messages';
import { Rec } from '../recorder';
import type { ArrInput, Step, TreeState } from '../types';

export function bstbuild(inp: ArrInput): Step<TreeState>[] {
  const r = new Rec<TreeState>();
  const st: TreeState = { n: [], root: -1, out: [] };
  r.add(
    st,
    {},
    null,
    M(
      'Insert values one by one. Smaller goes left, bigger or equal goes right.',
      'मानों को एक-एक करके डालें। छोटा बाईं ओर, बड़ा या बराबर दाईं ओर।',
    ),
  );
  for (const v of inp.a) {
    if (st.root === -1) {
      st.n.push({ v, l: -1, r: -1 });
      st.root = 0;
      r.add(st, { cur: 0 }, 0, M(`${v} becomes the root.`, `${v} जड़ (root) बनता है।`));
      continue;
    }
    let c = st.root;
    while (true) {
      r.c.cmp++;
      const left = v < st.n[c].v;
      r.add(
        st,
        { cur: c, path: [c] },
        2,
        M(`Insert ${v}: compare with ${st.n[c].v}.`, `${v} डालें: ${st.n[c].v} से तुलना करें।`),
        ask(
          `${v} vs ${st.n[c].v}: which way?`,
          `${v} बनाम ${st.n[c].v}: किस ओर?`,
          [M('Left', 'बाएँ'), M('Right', 'दाएँ')],
          left ? 0 : 1,
        ),
      );
      const side = left ? 'l' : 'r';
      if (st.n[c][side] === -1) {
        st.n.push({ v, l: -1, r: -1 });
        st.n[c][side] = st.n.length - 1;
        r.add(
          st,
          { cur: st.n.length - 1 },
          3,
          M(
            `Empty spot found. Place ${v} as the ${left ? 'left' : 'right'} child of ${st.n[c].v}.`,
            `खाली जगह मिली। ${v} को ${st.n[c].v} का ${left ? 'बायाँ' : 'दायाँ'} बच्चा बनाएँ।`,
          ),
        );
        break;
      }
      c = st.n[c][side];
    }
  }
  r.add(st, {}, 4, M('The binary search tree is built.', 'बाइनरी सर्च ट्री बन गया।'));
  return r.steps;
}
