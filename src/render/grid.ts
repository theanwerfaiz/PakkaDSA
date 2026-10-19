import type { Grid, GridState } from '../engine/types';
import { r2, svgWrap } from './common';

export interface GridGeometry {
  cs: number;
  x0: number;
  y0: number;
  R: number;
  C: number;
  W: number;
}

/** Cell size and origin of the grid drawing; the grid editor uses it to map pointer events to cells. */
export function gridGeometry(grid: Pick<Grid, 'R' | 'C'>, W: number): GridGeometry {
  const cs = Math.min((W - 30) / grid.C, 30);
  return { cs, x0: (W - grid.C * cs) / 2, y0: 14, R: grid.R, C: grid.C, W };
}

export function rGrid(st: GridState, _hl: unknown, W: number): string {
  const { R, C, walls, start, end } = st.grid;
  const { cs, x0, y0 } = gridGeometry(st.grid, W);
  const Wl = new Set(walls);
  const exp = new Set((st.order || []).slice(0, st.k));
  const fr = new Set(st.frontier);
  const pa = new Set(st.path);
  let o = '';
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      const k = r * C + c;
      let f = 'var(--node)';
      if (exp.has(k)) f = 'var(--vis-fill)';
      if (fr.has(k)) f = 'var(--wait-fill)';
      if (pa.has(k)) f = 'var(--act-fill)';
      if (Wl.has(k)) f = 'var(--wall)';
      if (st.cur === k && !pa.size) f = 'var(--act-line)';
      if (r === start[0] && c === start[1]) f = 'var(--done-line)';
      if (r === end[0] && c === end[1]) f = 'var(--cmp-line)';
      o += `<rect x="${r2(x0 + c * cs)}" y="${r2(y0 + r * cs)}" width="${r2(cs)}" height="${r2(cs)}" fill="${f}" stroke="var(--grid-line)" stroke-width="1"/>`;
    }
  o += `<text x="${r2(x0 + start[1] * cs + cs / 2)}" y="${r2(y0 + start[0] * cs + cs / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${r2(cs * 0.5)}" font-weight="700" fill="var(--paper)">S</text><text x="${r2(x0 + end[1] * cs + cs / 2)}" y="${r2(y0 + end[0] * cs + cs / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${r2(cs * 0.5)}" font-weight="700" fill="var(--paper)">G</text>`;
  return svgWrap(W, y0 * 2 + R * cs, o, 'Grid');
}
