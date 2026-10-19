import type { Highlights, StackState } from '../engine/types';
import { esc, fillOf, G, inkOf, isNarrow, r2, svgWrap, type Kind } from './common';

export function rStack(st: StackState, hl: Highlights, W: number): string {
  const a = st.a;
  const n = a.length;
  const nar = isNarrow(W);
  const gp = nar ? 6 : 8;
  const s = nar ? Math.min(38, (W - 30) / n - gp) : Math.min(52, 560 / n - 8);
  const x0 = nar ? (W - (n * (s + gp) - gp)) / 2 : 24;
  const y = nar ? 24 : 40;
  const cur = hl.cur as number | undefined;
  let o = '';
  a.forEach((v, i) => {
    const x = x0 + i * (s + gp);
    let k: Kind = i === cur ? (hl.bad ? 'cmp' : 'act') : i < (cur ?? -1) ? 'vis' : 'def';
    if (hl.ans === i) k = 'done';
    if (hl.good) k = 'done';
    o += `<g data-k="a${i}"><rect x="${r2(x)}" y="${y}" width="${r2(s)}" height="${r2(s)}" rx="8" ${fillOf(k)} stroke-width="1.5"/><text x="${r2(x + s / 2)}" y="${r2(y + s / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${nar ? 15 : 17}" font-weight="600" ${inkOf(k)}>${esc(v)}</text><text x="${r2(x + s / 2)}" y="${r2(y + s + 16)}" text-anchor="middle" font-size="11" fill="var(--muted)">${i}</text></g>`;
    if (st.res) {
      const rv = st.res[i];
      const open = rv === '?';
      o += `<g data-k="r${i}"><rect x="${r2(x)}" y="${r2(y + s + 30)}" width="${r2(s)}" height="${r2(s * 0.8)}" rx="8" fill="${open ? 'var(--paper-2)' : 'var(--done-fill)'}" stroke="${open ? 'var(--line)' : 'var(--done-line)'}" stroke-width="1.2"/><text x="${r2(x + s / 2)}" y="${r2(y + s + 30 + s * 0.4)}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="var(--ink)">${esc(rv)}</text></g>`;
    }
  });
  o += `<text data-k="resl" x="${r2(x0)}" y="${r2(y + s + 30 + s * 0.8 + 20)}" font-size="12" fill="var(--muted)" opacity="${st.res ? 1 : 0}">next greater ↑</text>`;
  const bw = nar ? 150 : 130;
  const sx = nar ? (W - bw) / 2 : W - 180;
  const base = nar ? 410 : 300;
  const bh = nar ? 30 : 36;
  o += `<path d="M${r2(sx - 8)} ${nar ? 170 : 70} L${r2(sx - 8)} ${base + 6} L${r2(sx + bw + 8)} ${base + 6} L${r2(sx + bw + 8)} ${nar ? 170 : 70}" fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-linecap="round"/><text x="${r2(sx + bw / 2)}" y="${base + 28}" text-anchor="middle" font-size="12" fill="var(--muted)">stack</text>`;
  const maxShow = nar ? 7 : 8;
  const from = Math.max(0, st.stack.length - maxShow);
  st.stack.forEach((v, i) => {
    if (i < from) return;
    const yy = base - (i - from + 1) * (bh + 4);
    const top = i === st.stack.length - 1;
    const k: Kind = top && (hl.push || hl.peek) ? 'act' : 'def';
    o += G(
      's' + i,
      sx,
      yy,
      `<rect width="${bw}" height="${bh}" rx="7" ${fillOf(k)} stroke-width="1.5"/><text x="${bw / 2}" y="${bh / 2}" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="600" ${inkOf(k)}>${esc(v)}</text>${top ? `<text x="-16" y="${bh / 2}" text-anchor="end" dominant-baseline="central" font-size="12" font-weight="600" fill="var(--ptr)">top</text>` : ''}`,
    );
  });
  return svgWrap(W, nar ? 450 : 340, o, 'Input and stack');
}
