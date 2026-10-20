import type { Dp1State, Dp2State, Highlights, Pair } from '../engine/types';
import { esc, fillOf, has, inkOf, isNarrow, r2, svgWrap, type Kind } from './common';

/** One-dimensional DP strip; wraps into several rows when it does not fit. Blank cells are not yet computed. */
export function rDP1(st: Dp1State, hl: Highlights, W: number): string {
  const n = st.vals.length;
  const s0 = isNarrow(W) ? 36 : 46;
  const per = Math.max(1, Math.min(n, Math.floor((W - 40) / (s0 + 6))));
  const s = Math.min(58, (W - 40) / per - 6);
  const x0 = (W - (per * (s + 6) - 6)) / 2;
  const rowH = s + 34;
  const rows = Math.ceil(n / per);
  let o = '';
  st.vals.forEach((v, i) => {
    const c = i % per;
    const r = Math.floor(i / per);
    const x = x0 + c * (s + 6);
    const y = 34 + r * rowH;
    let k: Kind = v === '' ? 'def' : 'vis';
    if (has(hl.from, i)) k = 'cmp';
    if (has(hl.cur, i)) k = 'act';
    o += `<g data-k="c${i}"><text x="${r2(x + s / 2)}" y="${y - 12}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(st.labels[i])}</text><rect x="${r2(x)}" y="${y}" width="${r2(s)}" height="${r2(s)}" rx="8" ${fillOf(k)} stroke-width="1.5"/><text x="${r2(x + s / 2)}" y="${r2(y + s / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${String(v).length > 3 ? 12 : 16}" font-weight="600" ${inkOf(k)}>${esc(v)}</text></g>`;
  });
  return svgWrap(W, 34 + rows * rowH + 10, o, 'DP table');
}

/** Two-dimensional DP table. Cells not yet computed are blank; pre-filled base rows/columns show 0. */
export function rDP2(st: Dp2State, hl: Highlights, W: number): string {
  const R = st.t.length;
  const C = st.t[0].length;
  const lw = st.rows.some((x) => String(x).length > 3) ? (isNarrow(W) ? 70 : 86) : 34;
  const cs = Math.min(46, (W - lw - 30) / C, 420 / (R + 1));
  const x0 = (W - (lw + C * cs)) / 2 + lw;
  const y0 = 18 + cs;
  let o = '';
  st.cols.forEach((c, j) => {
    o += `<text data-k="h${j}" x="${r2(x0 + j * cs + cs / 2)}" y="${r2(y0 - cs / 2)}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="600" fill="var(--ink-2)">${esc(c)}</text>`;
  });
  st.rows.forEach((rw, i) => {
    o += `<text data-k="r${i}" x="${r2(x0 - 10)}" y="${r2(y0 + i * cs + cs / 2)}" text-anchor="end" dominant-baseline="central" font-size="${String(rw).length > 3 ? 11 : 13}" font-weight="600" fill="var(--ink-2)">${esc(rw)}</text>`;
  });
  const cur = hl.cur as Pair | undefined;
  const from = ((hl.from || []) as Pair[]).map((x) => x.join(','));
  const curKey = cur ? cur.join(',') : '';
  const fin = !!st.vars || (!!cur && cur[0] === R - 1 && cur[1] === C - 1);
  const filled = (i: number, j: number) => {
    if (st.base === 'rc' && (i === 0 || j === 0)) return true;
    if (st.base === 'r' && i === 0) return true;
    if (cur) return i < cur[0] || (i === cur[0] && j <= cur[1]);
    return fin;
  };
  for (let i = 0; i < R; i++)
    for (let j = 0; j < C; j++) {
      let k: Kind = 'def';
      if (from.includes(i + ',' + j)) k = 'cmp';
      if (curKey === i + ',' + j) k = 'act';
      o += `<g data-k="x${i}-${j}"><rect x="${r2(x0 + j * cs + 1)}" y="${r2(y0 + i * cs + 1)}" width="${r2(cs - 2)}" height="${r2(cs - 2)}" rx="5" ${fillOf(k)} stroke-width="1.2"/><text x="${r2(x0 + j * cs + cs / 2)}" y="${r2(y0 + i * cs + cs / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${cs < 34 ? 11 : 14}" font-weight="600" ${inkOf(k)}>${filled(i, j) ? st.t[i][j] : ''}</text></g>`;
    }
  return svgWrap(W, y0 + R * cs + 16, o, 'DP grid');
}
