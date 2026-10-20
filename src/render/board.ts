import type { BoardState, Highlights, Pair } from '../engine/types';
import { r2, svgWrap } from './common';

export function rBoard(st: BoardState, hl: Highlights, W: number): string {
  const n = st.n;
  const cs = Math.min(56, 330 / n, (W - 40) / n);
  const x0 = (W - n * cs) / 2;
  const y0 = 16;
  const bad = hl.bad as Pair[] | undefined;
  const at = (p: Pair | undefined, r: number, c: number) => !!p && p[0] === r && p[1] === c;
  let o = '';
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      let f = (r + c) % 2 ? 'var(--paper-2)' : 'var(--node)';
      let sk = 'var(--line)';
      if (bad && bad.some((b) => b[0] === r && b[1] === c)) {
        f = 'var(--cmp-fill)';
        sk = 'var(--cmp-line)';
      }
      if (at(hl.try, r, c)) {
        f = bad ? 'var(--cmp-fill)' : 'var(--act-fill)';
        sk = bad ? 'var(--cmp-line)' : 'var(--act-line)';
      }
      if (at(hl.back, r, c)) sk = 'var(--cmp-line)';
      o += `<g data-k="q${r}-${c}"><rect x="${r2(x0 + c * cs)}" y="${r2(y0 + r * cs)}" width="${r2(cs)}" height="${r2(cs)}" fill="${f}" stroke="${sk}" stroke-width="${sk === 'var(--line)' ? 1 : 2.5}"/>`;
      if (st.q[r] === c)
        o += `<text x="${r2(x0 + c * cs + cs / 2)}" y="${r2(y0 + r * cs + cs / 2 + 1)}" text-anchor="middle" dominant-baseline="central" font-size="${r2(cs * 0.62)}" fill="${hl.solved ? 'var(--done-line)' : 'var(--ink)'}">♛</text>`;
      else if (at(hl.try, r, c) && bad)
        o += `<text x="${r2(x0 + c * cs + cs / 2)}" y="${r2(y0 + r * cs + cs / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${r2(cs * 0.5)}" fill="var(--cmp-line)">✕</text>`;
      o += '</g>';
    }
  return svgWrap(W, y0 * 2 + n * cs, o, 'Chess board');
}
