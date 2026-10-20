import { adj, gstate } from '../graphs';
import { G1 } from '../inputs';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { GraphState, NodeInput, Step } from '../types';

export function bfs(inp: NodeInput): Step<GraphState>[] {
  const g = G1;
  const A = adj(g);
  const s = inp.s;
  const r = new Rec<GraphState>();
  const st = gstate(g);
  const q = [s];
  const seen = new Set([s]);
  st.frontier = [s];
  st.vars = { queue: `[${s}]` };
  r.add(
    st,
    {},
    0,
    M(
      `BFS from ${s}: explore neighbours level by level with a queue.`,
      `${s} से BFS: कतार से पड़ोसियों को स्तर दर स्तर देखें।`,
    ),
  );
  while (q.length) {
    const u = q.shift() as string;
    st.frontier = [...q];
    st.visited.push(u);
    st.out.push(u);
    st.vars = { queue: '[' + q.join(', ') + ']' };
    r.add(st, { cur: u }, 2, M(`Dequeue ${u} and visit it.`, `कतार से ${u} निकालें और देखें।`));
    for (const [v] of A[u]) {
      if (!seen.has(v)) {
        seen.add(v);
        q.push(v);
        st.frontier = [...q];
        st.vars = { queue: '[' + q.join(', ') + ']' };
        r.add(
          st,
          { cur: u, edge: [u, v] },
          4,
          M(`${v} is new, add it to the queue.`, `${v} नया है, इसे कतार में जोड़ें।`),
        );
      }
    }
  }
  r.add(st, {}, 5, M(`BFS order: ${st.out.join(' → ')}`, `BFS क्रम: ${st.out.join(' → ')}`));
  return r.steps;
}
