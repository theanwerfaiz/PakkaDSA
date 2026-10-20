import { M } from '../messages';
import { Rec } from '../recorder';
import { buildBST } from '../trees';
import type { ArrInput, Msg, Step, TreeState } from '../types';

export type TraversalKind = 'in' | 'pre' | 'post';

const INTRO: Record<TraversalKind, Msg> = {
  in: M(
    'In-order: left, node, right. On a BST this gives sorted order.',
    'इन-ऑर्डर: बायाँ, नोड, दायाँ। BST पर इससे क्रमबद्ध सूची मिलती है।',
  ),
  pre: M('Pre-order: node, left, right.', 'प्री-ऑर्डर: नोड, बायाँ, दायाँ।'),
  post: M('Post-order: left, right, node.', 'पोस्ट-ऑर्डर: बायाँ, दायाँ, नोड।'),
};

/** Shared depth-first traversal used by the in-, pre- and post-order generators. */
export function traversal(kind: TraversalKind, inp: ArrInput): Step<TreeState>[] {
  const r = new Rec<TreeState>();
  const st: TreeState = { ...buildBST(inp.a), out: [] };
  const vis: number[] = [];
  r.add(st, {}, null, INTRO[kind]);
  function go(c: number): void {
    if (c === -1) return;
    r.add(
      st,
      { cur: c, visited: [...vis] },
      0,
      M(`Arrive at ${st.n[c].v}.`, `${st.n[c].v} पर पहुँचे।`),
    );
    const visit = () => {
      st.out.push(st.n[c].v);
      vis.push(c);
      r.add(
        st,
        { cur: c, visited: [...vis] },
        kind === 'pre' ? 1 : kind === 'in' ? 2 : 3,
        M(
          `Visit ${st.n[c].v}. Output: ${st.out.join(', ')}`,
          `${st.n[c].v} लिखें। आउटपुट: ${st.out.join(', ')}`,
        ),
      );
    };
    if (kind === 'pre') visit();
    go(st.n[c].l);
    if (kind === 'in') visit();
    go(st.n[c].r);
    if (kind === 'post') visit();
  }
  go(st.root);
  r.add(
    st,
    { visited: vis },
    4,
    M(`Traversal complete: ${st.out.join(', ')}`, `ट्रैवर्सल पूरा: ${st.out.join(', ')}`),
  );
  return r.steps;
}
