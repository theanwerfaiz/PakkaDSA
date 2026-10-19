import { adj, gstate } from '../graphs';
import { G1 } from '../inputs';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { GraphState, NodeInput, Step } from '../types';

export function dfs(inp: NodeInput): Step<GraphState>[] {
  const g = G1;
  const A = adj(g);
  const s = inp.s;
  const r = new Rec<GraphState>();
  const st = gstate(g);
  const seen = new Set<string>();
  const stack: string[] = [];
  r.add(
    st,
    {},
    0,
    M(
      `DFS from ${s}: go as deep as possible before backtracking.`,
      `${s} से DFS: पीछे लौटने से पहले जितना हो सके उतना गहरा जाएँ।`,
    ),
  );
  function go(u: string, from: string | null): void {
    seen.add(u);
    stack.push(u);
    st.visited.push(u);
    st.out.push(u);
    st.frontier = [...stack];
    st.vars = { path: stack.join(' → ') };
    r.add(st, { cur: u, edge: from ? [from, u] : null }, 1, M(`Visit ${u}.`, `${u} पर जाएँ।`));
    for (const [v] of A[u]) {
      if (!seen.has(v)) {
        r.add(
          st,
          { cur: u, edge: [u, v] },
          3,
          M(`${v} not visited yet, go deeper.`, `${v} अभी नहीं देखा, और गहरे जाएँ।`),
        );
        go(v, u);
        st.vars = { path: stack.join(' → ') };
        r.add(st, { cur: u }, 4, M(`Back at ${u}.`, `वापस ${u} पर।`));
      }
    }
    stack.pop();
    st.done.push(u);
    st.frontier = [...stack];
  }
  go(s, null);
  r.add(st, {}, 5, M(`DFS order: ${st.out.join(' → ')}`, `DFS क्रम: ${st.out.join(' → ')}`));
  return r.steps;
}
