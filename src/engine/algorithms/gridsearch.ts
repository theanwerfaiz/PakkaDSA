import { M } from '../messages';
import type { GridInput, GridState, Msg, Step } from '../types';

export type GridKind = 'bfs' | 'astar';

/**
 * Shared grid search used by BFS and A*. Like the prototype, it does not use the recorder: every
 * step shares the input grid and, at the end, the full exploration order; `k` says how much of it
 * to show. Cells are indexes (row * C + col).
 */
export function gridSearch(kind: GridKind, inp: GridInput): Step<GridState>[] {
  const { R, C, walls, start, end } = inp.grid;
  const W = new Set(walls);
  const key = (r: number, c: number) => r * C + c;
  const steps: Step<GridState>[] = [];
  const order: number[] = [];
  const prev: Record<number, number> = {};
  const sk = key(...start);
  const ek = key(...end);
  const push = (
    m: Msg,
    ln: number,
    extra: { frontier?: number[]; path?: number[]; cur?: number },
  ) =>
    steps.push({
      st: {
        grid: inp.grid,
        k: order.length,
        order: null,
        frontier: extra.frontier || [],
        path: extra.path || [],
        cur: extra.cur ?? null,
      },
      hl: {},
      ln,
      m,
      ask: null,
      c: { cmp: order.length, swp: 0 },
    });
  push(
    kind === 'bfs'
      ? M(
          'BFS spreads out evenly in every direction from the start.',
          'BFS शुरुआत से हर दिशा में बराबर फैलता है।',
        )
      : M(
          'A* uses distance-to-goal as a hint, so it heads toward the target.',
          'A* लक्ष्य तक की दूरी को संकेत की तरह इस्तेमाल करता है, इसलिए लक्ष्य की ओर बढ़ता है।',
        ),
    0,
    {},
  );
  const h = (k: number) => Math.abs(Math.floor(k / C) - end[0]) + Math.abs((k % C) - end[1]);
  const g: Record<number, number> = { [sk]: 0 };
  const open = [sk];
  const closed = new Set<number>();
  while (open.length) {
    let u: number;
    if (kind === 'bfs') u = open.shift() as number;
    else {
      let bi = 0;
      for (let i = 1; i < open.length; i++) {
        const fi = g[open[i]] + h(open[i]);
        const fb = g[open[bi]] + h(open[bi]);
        if (fi < fb || (fi === fb && h(open[i]) < h(open[bi]))) bi = i;
      }
      u = open.splice(bi, 1)[0];
    }
    if (closed.has(u)) continue;
    closed.add(u);
    order.push(u);
    if (u === ek) {
      const path: number[] = [];
      let k: number | undefined = ek;
      while (k !== undefined) {
        path.unshift(k);
        k = prev[k];
      }
      push(
        M(
          `Reached the goal! Shortest path has ${path.length - 1} steps. ${order.length} cells explored.`,
          `लक्ष्य मिल गया! सबसे छोटे रास्ते में ${path.length - 1} कदम। ${order.length} खाने देखे गए।`,
        ),
        5,
        { path, cur: u },
      );
      steps.forEach((s) => (s.st.order = order));
      return steps;
    }
    const ur = Math.floor(u / C);
    const uc = u % C;
    for (const [dr, dc] of [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ]) {
      const nr = ur + dr;
      const nc = uc + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      const v = key(nr, nc);
      if (W.has(v) || closed.has(v)) continue;
      const ng = g[u] + 1;
      if (g[v] === undefined || ng < g[v]) {
        g[v] = ng;
        prev[v] = u;
        open.push(v);
      }
    }
    if (order.length % 2 === 1 || open.length === 0)
      push(
        M(
          `Explore cell (${ur}, ${uc}). ${open.length} cells waiting.`,
          `खाना (${ur}, ${uc}) देखें। ${open.length} खाने इंतज़ार में।`,
        ),
        2,
        { frontier: [...open], cur: u },
      );
  }
  push(
    M(
      'The goal cannot be reached. Walls block every route.',
      'लक्ष्य तक नहीं पहुँचा जा सकता। दीवारें हर रास्ता रोकती हैं।',
    ),
    6,
    {},
  );
  steps.forEach((s) => (s.st.order = order));
  return steps;
}
