import type { ArrayState, Highlights } from '../engine/types';
import { aKind, byId, fillOf, G, has, isNarrow, ptrs, r2, svgWrap } from './common';

export function rBars(st: ArrayState, hl: Highlights, W: number): string {
  const a = st.a as number[];
  const n = a.length;
  const slot = (W - 40) / n;
  const bw = Math.min(slot * 0.72, 64);
  const mx = Math.max(...a.map((v) => Math.abs(v)), 1);
  const base = 250;
  const fs = n > 14 || (isNarrow(W) && n > 9) ? 11 : 14;
  let o = '';
  const rg = hl.region;
  const wt = hl.water;
  o += G(
    'region',
    rg ? 20 + rg[0] * slot + 2 : 20,
    20,
    `<rect width="${rg ? r2((rg[1] - rg[0] + 1) * slot - 4) : 0}" height="${base - 14}" rx="10" fill="var(--paper-2)" opacity="${rg ? 1 : 0}"/>`,
  );
  o += G(
    'water',
    wt ? 20 + (wt[0] + 0.5) * slot : 20,
    wt ? base - (wt[2] / mx) * 205 : base,
    `<rect width="${wt ? r2((wt[1] - wt[0]) * slot) : 0}" height="${wt ? r2((wt[2] / mx) * 205) : 0}" fill="var(--water)"/>`,
  );
  byId(a, st.ids).forEach(([id, pos]) => {
    const v = a[pos];
    const h = Math.max(4, (Math.abs(v) / mx) * 205);
    const y = base - h;
    const k = aKind(pos, st, hl);
    const dim = has(hl.dim, pos) ? 0.3 : 1;
    const pivot =
      hl.pivot === pos
        ? `<rect x="-4" y="${r2(y - 4)}" width="${r2(bw + 8)}" height="${r2(h + 8)}" rx="7" fill="none" stroke="var(--act-line)" stroke-width="2" stroke-dasharray="5 4"/>`
        : '';
    const label =
      n <= 24
        ? `<text x="${r2(bw / 2)}" y="${r2(y - 8)}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="var(--ink)">${v}</text>`
        : '';
    o += G(
      'b' + id,
      20 + pos * slot + (slot - bw) / 2,
      0,
      `<g opacity="${dim}"><rect y="${r2(y)}" width="${r2(bw)}" height="${r2(h)}" rx="5" ${fillOf(k)} stroke-width="1.5"/>${pivot}${label}</g>`,
    );
  });
  for (let i = 0; i < n; i++)
    o += `<text data-k="i${i}" x="${r2(20 + (i + 0.5) * slot)}" y="${base + 18}" text-anchor="middle" font-size="11" fill="var(--muted)">${i}</text>`;
  o += ptrs(hl.ptr, (i) => 20 + (i + 0.5) * slot, base + 40, 17, '▲ ', '');
  o += G(
    'pivotlbl',
    hl.pivot !== undefined ? 20 + (hl.pivot + 0.5) * slot : 20,
    14,
    `<text text-anchor="middle" font-size="12" font-weight="600" fill="var(--act-ink-strong)" opacity="${hl.pivot !== undefined ? 1 : 0}">pivot</text>`,
  );
  return svgWrap(W, base + 50 + 34, o, 'Bar chart of the array');
}
