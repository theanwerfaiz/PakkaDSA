import { adj, gstate } from '../graphs';
import { G1 } from '../inputs';
import { ask, M, NO, YES } from '../messages';
import { Rec } from '../recorder';
import type { GraphState, NodeInput, Step } from '../types';

export function dijkstra(inp: NodeInput): Step<GraphState>[] {
  const g = G1;
  const A = adj(g);
  const s = inp.s;
  const r = new Rec<GraphState>();
  const st = gstate(g);
  const D: Record<string, number> = {};
  g.nodes.forEach((n) => (D[n.id] = Infinity));
  D[s] = 0;
  const show = (d: number) => (d === Infinity ? '∞' : d);
  const lab = () => {
    g.nodes.forEach((n) => (st.lab[n.id] = show(D[n.id])));
  };
  lab();
  r.add(
    st,
    {},
    0,
    M(
      `Shortest paths from ${s}. All distances start at ∞ except ${s} = 0.`,
      `${s} से सबसे छोटे रास्ते। ${s} = 0 के अलावा सभी दूरियाँ ∞ से शुरू।`,
    ),
  );
  const done = new Set<string>();
  while (done.size < g.nodes.length) {
    let u: string | null = null;
    for (const n of g.nodes) if (!done.has(n.id) && (u === null || D[n.id] < D[u])) u = n.id;
    if (u === null || D[u] === Infinity) break;
    done.add(u);
    st.visited = [...done];
    st.vars = { picked: `${u} (${D[u]})` };
    r.add(
      st,
      { cur: u },
      2,
      M(
        `Pick the closest unfinished node: ${u} with distance ${D[u]}.`,
        `सबसे पास का अधूरा नोड चुनें: ${u}, दूरी ${D[u]}।`,
      ),
    );
    for (const [v, w] of A[u]) {
      if (done.has(v)) continue;
      r.c.cmp++;
      const nd = D[u] + w;
      const better = nd < D[v];
      r.add(
        st,
        { cur: u, edge: [u, v] },
        4,
        M(
          `Edge ${u}→${v} (${w}): ${D[u]} + ${w} = ${nd} vs current ${show(D[v])}.`,
          `किनारा ${u}→${v} (${w}): ${D[u]} + ${w} = ${nd} बनाम मौजूदा ${show(D[v])}।`,
        ),
        ask(
          `Will ${v}'s distance improve to ${nd}?`,
          `क्या ${v} की दूरी ${nd} हो जाएगी?`,
          [YES, NO],
          better ? 0 : 1,
        ),
      );
      if (better) {
        D[v] = nd;
        lab();
        r.add(
          st,
          { cur: u, edge: [u, v], upd: v },
          5,
          M(`Yes, update ${v} to ${nd}.`, `हाँ, ${v} को ${nd} करें।`),
        );
      }
    }
  }
  st.done = [...done];
  r.add(st, {}, 6, M('All shortest distances found.', 'सभी सबसे छोटी दूरियाँ मिल गईं।'));
  return r.steps;
}
