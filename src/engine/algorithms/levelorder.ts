import { M } from '../messages';
import { Rec } from '../recorder';
import { buildBST } from '../trees';
import type { ArrInput, Step, TreeState, Vars } from '../types';

export function levelorder(inp: ArrInput): Step<TreeState>[] {
  const r = new Rec<TreeState>();
  const st: TreeState = { ...buildBST(inp.a), out: [], vars: {} as Vars };
  const vis: number[] = [];
  const q = [st.root];
  r.add(
    st,
    {},
    null,
    M(
      'Level order visits the tree row by row using a queue.',
      'लेवल ऑर्डर एक कतार (queue) से ट्री को पंक्ति दर पंक्ति देखता है।',
    ),
  );
  while (q.length) {
    const c = q.shift() as number;
    st.out.push(st.n[c].v);
    vis.push(c);
    [st.n[c].l, st.n[c].r].forEach((k) => {
      if (k !== -1) q.push(k);
    });
    st.vars = { queue: '[' + q.map((k) => st.n[k].v).join(', ') + ']' };
    r.add(
      st,
      { cur: c, visited: [...vis] },
      2,
      M(
        `Dequeue ${st.n[c].v}, add its children to the queue.`,
        `कतार से ${st.n[c].v} निकालें, उसके बच्चों को कतार में जोड़ें।`,
      ),
    );
  }
  r.add(
    st,
    { visited: vis },
    4,
    M(`Level order: ${st.out.join(', ')}`, `लेवल ऑर्डर: ${st.out.join(', ')}`),
  );
  return r.steps;
}
