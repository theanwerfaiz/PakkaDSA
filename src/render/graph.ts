import type { GraphState, Highlights } from '../engine/types';
import { esc, fillOf, inkOf, isNarrow, marker, r2, svgWrap, type Kind } from './common';

export function rGraph(st: GraphState, hl: Highlights, W: number): string {
  const g = st.g;
  const xs = g.nodes.map((n) => n.x);
  const mn = Math.min(...xs);
  const mx = Math.max(...xs);
  const pad = isNarrow(W) ? 34 : 70;
  const X = (x: number) => pad + ((x - mn) * (W - 2 * pad)) / (mx - mn);
  const P: Record<string, { x: number; y: number }> = {};
  g.nodes.forEach((n) => (P[n.id] = { x: X(n.x), y: n.y }));
  let o = marker;
  g.edges.forEach(([u, v, w]) => {
    const a = P[u];
    const b = P[v];
    const on =
      !!hl.edge &&
      ((hl.edge[0] === u && hl.edge[1] === v) ||
        (!g.directed && hl.edge[0] === v && hl.edge[1] === u));
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const L = Math.hypot(dx, dy);
    const ux = dx / L;
    const uy = dy / L;
    const x1 = a.x + ux * 24;
    const y1 = a.y + uy * 24;
    const x2 = b.x - ux * (g.directed ? 28 : 24);
    const y2 = b.y - uy * (g.directed ? 28 : 24);
    o += `<line data-k="e${u}${v}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${on ? 'var(--act-line)' : 'var(--line-strong)'}" stroke-width="${on ? 3.5 : 2}" ${g.directed ? `marker-end="url(#${on ? 'ahh' : 'ah'})"` : ''}/>`;
    if (w !== undefined) {
      const mx2 = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      o += `<g data-k="w${u}${v}"><rect x="${r2(mx2 - 12)}" y="${r2(my - 10)}" width="24" height="20" rx="5" fill="var(--paper)" stroke="var(--line)"/><text x="${r2(mx2)}" y="${r2(my)}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="var(--ink-2)">${w}</text></g>`;
    }
  });
  g.nodes.forEach((n) => {
    let k: Kind = 'def';
    if (st.frontier.includes(n.id)) k = 'wait';
    if (st.visited.includes(n.id)) k = 'vis';
    if (st.done.includes(n.id)) k = 'done';
    if (hl.upd === n.id) k = 'done';
    if (hl.cur === n.id) k = 'act';
    const p = P[n.id];
    o += `<g data-k="v${n.id}"><circle cx="${r2(p.x)}" cy="${p.y}" r="23" ${fillOf(k)} stroke-width="2"/><text x="${r2(p.x)}" y="${p.y}" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="700" ${inkOf(k)}>${n.id}</text>`;
    const lb = st.lab[n.id];
    if (lb !== undefined) {
      o += `<rect x="${r2(p.x - 22)}" y="${p.y - 50}" width="44" height="20" rx="10" fill="${hl.upd === n.id ? 'var(--act-fill)' : 'var(--paper-2)'}" stroke="var(--line)"/><text x="${r2(p.x)}" y="${p.y - 40}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="var(--ink)">${esc(lb)}</text>`;
    }
    o += '</g>';
  });
  return svgWrap(W, 380, o, 'Graph');
}
