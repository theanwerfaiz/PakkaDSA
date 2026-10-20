import type { HanoiState, Highlights } from '../engine/types';
import { fillOf, G, inkOf, r2, svgWrap, type Kind } from './common';

export function rHanoi(st: HanoiState, hl: Highlights, W: number): string {
  const xs = [W * 0.2, W * 0.5, W * 0.8];
  const base = 250;
  const n = st.n;
  const maxw = W * 0.27;
  let o = '';
  xs.forEach((x, i) => {
    o += `<rect data-k="peg${i}" x="${r2(x - 5)}" y="70" width="10" height="${base - 70}" rx="4" fill="var(--line-strong)"/><text data-k="pl${i}" x="${r2(x)}" y="${base + 28}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink-2)">${'ABC'[i]}</text>`;
  });
  o += `<rect data-k="floor" x="${r2(W * 0.05)}" y="${base}" width="${r2(W * 0.9)}" height="8" rx="4" fill="var(--ink-2)"/>`;
  const pos: Record<number, { p: number; j: number }> = {};
  st.pegs.forEach((peg, p) =>
    peg.forEach((d, j) => {
      pos[d] = { p, j };
    }),
  );
  for (let d = 1; d <= n; d++) {
    const { p, j } = pos[d];
    const w = 24 + d * ((maxw - 24) / n);
    const k: Kind = hl.disk === d ? 'act' : 'def';
    o += G(
      'd' + d,
      xs[p],
      base - (j + 1) * 24,
      `<rect x="${r2(-w / 2)}" width="${r2(w)}" height="21" rx="8" ${fillOf(k)} stroke-width="1.6"/><text y="10.5" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" ${inkOf(k)}>${d}</text>`,
    );
  }
  return svgWrap(W, base + 44, o, 'Tower of Hanoi');
}
