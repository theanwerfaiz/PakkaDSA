import { adj, gstate } from '../graphs';
import { G2 } from '../inputs';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { GraphState, Step } from '../types';

export function topo(): Step<GraphState>[] {
  const g = G2;
  const A = adj(g);
  const r = new Rec<GraphState>();
  const st = gstate(g);
  const indeg: Record<string, number> = {};
  g.nodes.forEach((n) => (indeg[n.id] = 0));
  g.edges.forEach(([, v]) => indeg[v]++);
  const lab = () => g.nodes.forEach((n) => (st.lab[n.id] = 'in:' + indeg[n.id]));
  lab();
  r.add(
    st,
    {},
    0,
    M(
      'Topological sort: order tasks so every arrow points forward. Count incoming arrows.',
      'टोपोलॉजिकल सॉर्ट: काम ऐसे क्रम में रखें कि हर तीर आगे की ओर हो। आने वाले तीर गिनें।',
    ),
  );
  const q = g.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id);
  const queue = () => '[' + q.join(', ') + ']';
  st.frontier = [...q];
  st.vars = { queue: queue() };
  r.add(
    st,
    {},
    1,
    M(
      `Nodes with no incoming arrows: ${q.join(', ')}.`,
      `जिन नोड में कोई तीर नहीं आता: ${q.join(', ')}।`,
    ),
  );
  while (q.length) {
    const u = q.shift() as string;
    st.out.push(u);
    st.visited.push(u);
    st.frontier = [...q];
    st.vars = { queue: queue() };
    r.add(
      st,
      { cur: u },
      3,
      M(`Take ${u}. Order: ${st.out.join(' → ')}`, `${u} लें। क्रम: ${st.out.join(' → ')}`),
    );
    for (const [v] of A[u]) {
      indeg[v]--;
      lab();
      if (indeg[v] === 0) q.push(v);
      st.frontier = [...q];
      st.vars = { queue: queue() };
      const zero = indeg[v] === 0;
      r.add(
        st,
        { cur: u, edge: [u, v] },
        4,
        M(
          `Remove arrow ${u}→${v}. ${v} now has ${indeg[v]} incoming${zero ? ', so it joins the queue' : ''}.`,
          `तीर ${u}→${v} हटाएँ। ${v} में अब ${indeg[v]} तीर आते हैं${zero ? ', इसलिए यह कतार में जुड़ता है' : ''}।`,
        ),
      );
    }
  }
  r.add(
    st,
    {},
    5,
    M(`Topological order: ${st.out.join(' → ')}`, `टोपोलॉजिकल क्रम: ${st.out.join(' → ')}`),
  );
  return r.steps;
}
