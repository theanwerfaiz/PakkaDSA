import type { Highlights, SetsState } from '../engine/types';
import { fillOf, inkOf, r2, svgWrap, type Kind } from './common';

export function rSets(st: SetsState, hl: Highlights, W: number): string {
  const a = st.a;
  const n = a.length;
  const s = 58;
  const x0 = (W - (n * (s + 12) - 12)) / 2;
  const y = 34;
  let o = '';
  a.forEach((v, i) => {
    let k: Kind = st.cur.includes(i) ? 'done' : 'def';
    if (hl.at === i) k = hl.inc ? 'act' : 'cmp';
    const x = x0 + i * (s + 12);
    o += `<g data-k="e${i}"><rect x="${r2(x)}" y="${y}" width="${s}" height="${s}" rx="9" ${fillOf(k)} stroke-width="1.6"/><text x="${r2(x + s / 2)}" y="${y + s / 2}" text-anchor="middle" dominant-baseline="central" font-size="18" font-weight="600" ${inkOf(k)}>${v}</text><text x="${r2(x + s / 2)}" y="${y + s + 20}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ptr)" opacity="${hl.at === i ? 1 : 0}">${hl.inc ? 'take' : 'skip'}</text></g>`;
  });
  o += `<text data-k="cur" x="${W / 2}" y="${y + s + 56}" text-anchor="middle" font-size="18" font-weight="600" fill="var(--ink)">{ ${st.cur.map((k) => a[k]).join(', ')} }</text>`;
  return svgWrap(W, y + s + 80, o, 'Subset builder');
}
