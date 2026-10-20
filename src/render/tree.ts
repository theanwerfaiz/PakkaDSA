import type { Highlights, TreeState } from '../engine/types';
import { fillOf, G, inkOf, r2, svgWrap, type Kind } from './common';

interface Pos {
  i: number;
  d: number;
  x: number;
  y: number;
}

/** In-order x positions and depth rows for every node reachable from the root. */
export function treeLayout(st: TreeState, W: number) {
  const pos: Record<number, Pos> = {};
  let idx = 0;
  let maxD = 0;
  (function walk(c: number, d: number): void {
    if (c === -1) return;
    walk(st.n[c].l, d + 1);
    pos[c] = { i: idx++, d, x: 0, y: 0 };
    maxD = Math.max(maxD, d);
    walk(st.n[c].r, d + 1);
  })(st.root, 0);
  const cnt = Math.max(idx, 1);
  Object.values(pos).forEach((p) => {
    p.x = 30 + (p.i + 0.5) * ((W - 60) / cnt);
    p.y = 40 + p.d * 66;
  });
  return { pos, maxD, cnt };
}

export function rTree(st: TreeState, hl: Highlights, W: number): string {
  if (st.root === -1)
    return svgWrap(
      W,
      300,
      `<text x="${W / 2}" y="64" text-anchor="middle" font-size="15" fill="var(--muted)">empty tree</text>`,
    );
  const { pos, maxD, cnt } = treeLayout(st, W);
  const rad = Math.max(12, Math.min(21, (W - 60) / cnt / 2.3));
  const fs = rad < 17 ? 12 : 15;
  const path = hl.path || [];
  const visited = hl.visited || [];
  let o = '';
  st.n.forEach((nd, i) => {
    if (!pos[i]) return;
    (
      [
        ['l', nd.l],
        ['r', nd.r],
      ] as const
    ).forEach(([sd, c]) => {
      if (c !== -1 && pos[c])
        o += `<line data-k="e${i}${sd}" x1="${r2(pos[i].x)}" y1="${pos[i].y}" x2="${r2(pos[c].x)}" y2="${pos[c].y}" stroke="${path.includes(c) && path.includes(i) ? 'var(--cmp-line)' : 'var(--line-strong)'}" stroke-width="2"/>`;
    });
  });
  st.n.forEach((nd, i) => {
    if (!pos[i]) return;
    let k: Kind = 'def';
    if (visited.includes(i)) k = 'vis';
    if (path.includes(i)) k = 'cmp';
    if (hl.cur === i) k = 'act';
    if (hl.found === i) k = 'done';
    o += G(
      'n' + i,
      pos[i].x,
      pos[i].y,
      `<circle r="${r2(rad)}" ${fillOf(k)} stroke-width="1.8"/><text text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="600" ${inkOf(k)}>${nd.v}</text>`,
    );
  });
  return svgWrap(W, Math.max(40 + maxD * 66 + 44, 300), o, 'Binary tree');
}
