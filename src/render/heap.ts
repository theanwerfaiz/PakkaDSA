import type { ArrayState, Highlights } from '../engine/types';
import { aKind, byId, fillOf, G, inkOf, r2, svgWrap } from './common';

export function rHeap(st: ArrayState, hl: Highlights, W: number): string {
  const a = st.a;
  const n = a.length;
  const size = st.size ?? n;
  let o = '';
  const lastD = Math.floor(Math.log2(Math.max(n, 1)));
  const P = (i: number) => {
    const d = Math.floor(Math.log2(i + 1));
    const k = i - (2 ** d - 1);
    return { x: 30 + ((k + 0.5) * (W - 60)) / 2 ** d, y: 36 + d * 62, d };
  };
  for (let i = 1; i < size; i++) {
    const p = P(i);
    const q = P((i - 1) >> 1);
    o += `<line data-k="e${i}" x1="${r2(q.x)}" y1="${q.y}" x2="${r2(p.x)}" y2="${p.y}" stroke="var(--line-strong)" stroke-width="2"/>`;
  }
  const ty = 36 + lastD * 62 + 50;
  const s = Math.min(46, (W - 40) / Math.max(n, 1) - 6);
  const x0 = (W - (n * (s + 6) - 6)) / 2;
  const order = byId(a, st.ids);
  order.forEach(([id, pos]) => {
    const k = aKind(pos, st, hl);
    const p = P(pos);
    const inTree = pos < size;
    o += G(
      'n' + id,
      p.x,
      p.y,
      `<g opacity="${inTree ? 1 : 0}"><circle r="20" ${fillOf(k)} stroke-width="1.8"/><text text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" ${inkOf(k)}>${a[pos]}</text></g>`,
    );
  });
  o += `<text data-k="arrl" x="${r2(x0)}" y="${ty - 10}" font-size="12" fill="var(--muted)">array</text>`;
  order.forEach(([id, pos]) => {
    const k = aKind(pos, st, hl);
    o += G(
      'c' + id,
      x0 + pos * (s + 6),
      ty,
      `<g opacity="${pos >= size && k !== 'done' ? 0.4 : 1}"><rect width="${r2(s)}" height="${r2(s)}" rx="7" ${fillOf(k)} stroke-width="1.4"/><text x="${r2(s / 2)}" y="${r2(s / 2)}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" ${inkOf(k)}>${a[pos]}</text></g>`,
    );
  });
  for (let i = 0; i < n; i++)
    o += `<text data-k="i${i}" x="${r2(x0 + i * (s + 6) + s / 2)}" y="${r2(ty + s + 14)}" text-anchor="middle" font-size="10" fill="var(--muted)">${i}</text>`;
  return svgWrap(W, ty + s + 30, o, 'Heap as tree and array');
}
