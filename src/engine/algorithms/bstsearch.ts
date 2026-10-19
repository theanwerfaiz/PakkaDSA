import { ask, M } from '../messages';
import { Rec } from '../recorder';
import { buildBST } from '../trees';
import type { ArrTargetInput, Step, TreeState } from '../types';

export function bstsearch(inp: ArrTargetInput): Step<TreeState>[] {
  const r = new Rec<TreeState>();
  const st: TreeState = { ...buildBST(inp.a), out: [] };
  const x = inp.t;
  let c = st.root;
  const path: number[] = [];
  r.add(
    st,
    {},
    null,
    M(
      `Search for ${x}. At each node, go left if smaller, right if bigger.`,
      `${x} ढूँढें। हर नोड पर, छोटा हो तो बाएँ, बड़ा हो तो दाएँ जाएँ।`,
    ),
  );
  while (c !== -1) {
    path.push(c);
    r.c.cmp++;
    const v = st.n[c].v;
    const ans = x === v ? 2 : x < v ? 0 : 1;
    r.add(
      st,
      { cur: c, path: [...path] },
      1,
      M(`Compare ${x} with ${v}.`, `${x} की तुलना ${v} से करें।`),
      ask(
        `${x} vs ${v}?`,
        `${x} बनाम ${v}?`,
        [M('Go left', 'बाएँ'), M('Go right', 'दाएँ'), M('Found', 'मिल गया')],
        ans,
      ),
    );
    if (x === v) {
      r.add(st, { found: c, path }, 2, M(`Found ${x}!`, `${x} मिल गया!`));
      return r.steps;
    }
    c = x < v ? st.n[c].l : st.n[c].r;
  }
  r.add(st, { path }, 4, M(`${x} is not in the tree.`, `${x} ट्री में नहीं है।`));
  return r.steps;
}
