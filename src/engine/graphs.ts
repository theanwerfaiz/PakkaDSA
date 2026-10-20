import type { Graph, GraphState } from './types';

/** Adjacency lists [neighbour, weight], each sorted by neighbour id. Unweighted edges get weight 1. */
export function adj(g: Graph): Record<string, [string, number][]> {
  const m: Record<string, [string, number][]> = {};
  g.nodes.forEach((n) => (m[n.id] = []));
  g.edges.forEach(([u, v, w]) => {
    m[u].push([v, w ?? 1]);
    if (!g.directed) m[v].push([u, w ?? 1]);
  });
  Object.values(m).forEach((l) => l.sort((x, y) => (x[0] < y[0] ? -1 : 1)));
  return m;
}

export function gstate(g: Graph): GraphState {
  return {
    g: { nodes: g.nodes, edges: g.edges, directed: !!g.directed },
    visited: [],
    frontier: [],
    done: [],
    lab: {},
    vars: {},
    out: [],
  };
}
