import type { Highlights, ListState } from '../engine/types';
import { esc, fillOf, has, inkOf, marker, ptrs, r2, svgWrap, type Kind } from './common';

export function rList(st: ListState, hl: Highlights, W: number): string {
  const n = st.v.length;
  const sp = (W - 60) / n;
  const w = Math.min(64, Math.max(24, sp * 0.62));
  const h = 42;
  const y = 120;
  let o = marker;
  const X = (i: number) => 30 + i * sp + (sp - w) / 2;
  st.v.forEach((v, i) => {
    let k: Kind = 'def';
    if (has(hl.active, i) || has(hl.swap, i)) k = 'act';
    if (has(hl.found, i)) k = 'done';
    o += `<g data-k="n${i}"><rect x="${r2(X(i))}" y="${y}" width="${r2(w)}" height="${h}" rx="8" ${fillOf(k)} stroke-width="1.5"/><text x="${r2(X(i) + w / 2)}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="central" font-size="${w < 36 ? 14 : 17}" font-weight="600" ${inkOf(k)}>${esc(v)}</text></g>`;
    const nx = st.next[i];
    let ar = '';
    if (nx === -1)
      ar = `<text x="${r2(X(i) + w / 2)}" y="${y + h + 18}" text-anchor="middle" font-size="12" fill="var(--muted)">↓ null</text>`;
    else if (nx === i + 1)
      ar = `<line x1="${r2(X(i) + w + 2)}" y1="${y + h / 2}" x2="${r2(X(nx) - 4)}" y2="${y + h / 2}" stroke="var(--ink-2)" stroke-width="1.8" marker-end="url(#ah)"/>`;
    else if (nx === i - 1)
      ar = `<path d="M${r2(X(i))} ${r2(y + h * 0.72)} L${r2(X(nx) + w + 4)} ${r2(y + h * 0.72)}" fill="none" stroke="var(--act-line)" stroke-width="2" marker-end="url(#ahh)"/>`;
    else {
      const x1 = X(i) + w / 2;
      const x2 = X(nx) + w / 2;
      const cy = y + h + 70;
      ar = `<path d="M${r2(x1)} ${y + h + 2} C${r2(x1)} ${cy}, ${r2(x2)} ${cy}, ${r2(x2)} ${y + h + 6}" fill="none" stroke="${nx < i ? 'var(--cmp-line)' : 'var(--ink-2)'}" stroke-width="1.8" marker-end="url(#ah)"/>`;
    }
    o += `<g data-k="a${i}">${ar}</g>`;
  });
  o += ptrs(hl.ptr, (i) => X(i) + w / 2, y - 14, -17, '', '');
  return svgWrap(W, 250, o, 'Linked list');
}
