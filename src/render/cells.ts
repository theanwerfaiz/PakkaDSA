import type { ArrayState, Highlights } from '../engine/types';
import { aKind, byId, esc, fillOf, G, has, inkOf, ptrs, r2, svgWrap } from './common';

export function cellsLayout(n: number, W: number) {
  const s = Math.min(62, (W - 40) / n - 8);
  const tot = n * (s + 8) - 8;
  return { s, x0: (W - tot) / 2 };
}

export function rCells(st: ArrayState, hl: Highlights, W: number): string {
  const a = st.a;
  const n = a.length;
  const { s, x0 } = cellsLayout(n, W);
  const y = 50;
  let o = '';
  const wn = hl.win;
  o += G(
    'win',
    wn ? x0 + wn[0] * (s + 8) - 6 : x0,
    y - 6,
    `<rect width="${wn ? r2((wn[1] - wn[0] + 1) * (s + 8) + 4) : 0}" height="${r2(s + 12)}" rx="12" fill="var(--hl-soft)" stroke="var(--act-line)" stroke-width="1.5" opacity="${wn ? 1 : 0}"/>`,
  );
  byId(a, st.ids).forEach(([id, pos]) => {
    const v = a[pos];
    const k = aKind(pos, st, hl);
    const dim = has(hl.dim, pos) ? 0.3 : 1;
    o += G(
      'c' + id,
      x0 + pos * (s + 8),
      y,
      `<g opacity="${dim}"><rect width="${r2(s)}" height="${r2(s)}" rx="8" ${fillOf(k)} stroke-width="1.5"/><text x="${r2(s / 2)}" y="${r2(s / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${String(v).length > 3 ? 13 : 17}" font-weight="600" ${inkOf(k)}>${esc(v)}</text></g>`,
    );
  });
  for (let i = 0; i < n; i++)
    o += `<text data-k="i${i}" x="${r2(x0 + i * (s + 8) + s / 2)}" y="${r2(y + s + 18)}" text-anchor="middle" font-size="11" fill="var(--muted)">${i}</text>`;
  o += ptrs(hl.ptr, (i) => x0 + i * (s + 8) + s / 2, y + s + 42, 17, '▲ ', '');
  return svgWrap(W, y + s + 50 + 34, o, 'Array cells');
}
