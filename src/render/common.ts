/* Shared rendering helpers. Every renderer is a pure function (state, highlights, width) -> SVG
   string. Elements with data-k are keyed so the app can morph them and let them glide. */
import type { Highlights } from '../engine/types';

/** Drawing widths: wide (desktop) and narrow (phones), chosen by container width < 640 px. */
export const WIDE = 860;
export const NARROW = 420;
export const isNarrow = (w: number) => w < 640;

/** Rounds to 2 decimals so SVG strings stay short and stable. */
export const r2 = (v: number) => Math.round(v * 100) / 100;

/** Escapes text placed into SVG/HTML. */
export const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );

export type Kind = 'def' | 'cmp' | 'act' | 'done' | 'vis' | 'wait';

/** Colour tokens per semantic role: [fill, stroke, ink]. */
const K: Record<Kind, [string, string, string]> = {
  def: ['--node', '--node-line', '--ink'],
  cmp: ['--cmp-fill', '--cmp-line', '--cmp-ink'],
  act: ['--act-fill', '--act-line', '--act-ink'],
  done: ['--done-fill', '--done-line', '--done-ink'],
  vis: ['--vis-fill', '--vis-line', '--vis-ink'],
  wait: ['--wait-fill', '--wait-line', '--ink'],
};
export const fillOf = (k: Kind) => `fill="var(${K[k][0]})" stroke="var(${K[k][1]})"`;
export const inkOf = (k: Kind) => `fill="var(${K[k][2]})"`;

/** True if x is i, or an array containing i. */
export const has = (x: unknown, i: unknown) => (Array.isArray(x) ? x.includes(i) : x === i);

/** A keyed group positioned with a CSS transform, so moving it can be animated. */
export const G = (key: string, x: number, y: number, inner: string) =>
  `<g data-k="${key}" class="k" style="transform:translate(${r2(x)}px,${r2(y)}px)">${inner}</g>`;

/** Colour role of array item i. */
export function aKind(i: number, st: { sorted?: number[] }, hl: Highlights): Kind {
  if (has(hl.swap, i)) return 'act';
  if (hl.found === i || hl.found2 === i || (Array.isArray(hl.found) && hl.found.includes(i)))
    return 'done';
  if (has(hl.cmp, i)) return 'cmp';
  if (has(hl.active, i)) return 'act';
  if (st.sorted && st.sorted.includes(i)) return 'done';
  return 'def';
}

export const svgWrap = (w: number, h: number, inner: string, label?: string) =>
  `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label || 'Algorithm state')}" xmlns="http://www.w3.org/2000/svg" font-family="Instrument Sans, Noto Sans Devanagari, system-ui, sans-serif">${inner}</svg>`;

/** Named pointer labels under (or over) array items; several on one index stack up. */
export function ptrs(
  ptr: Highlights['ptr'],
  xOf: (i: number) => number,
  y0: number,
  dy: number,
  pre: string,
  post: string,
): string {
  const by: Record<number, string[]> = {};
  Object.entries(ptr || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v < 0) return;
    (by[v] = by[v] || []).push(k);
  });
  let o = '';
  Object.entries(by).forEach(([i, names]) =>
    names.forEach((nm, r) => {
      o += G(
        'p-' + nm,
        xOf(+i),
        y0 + r * dy,
        `<text text-anchor="middle" font-size="13" font-weight="600" fill="var(--ptr)">${r === 0 ? pre : ''}${esc(nm)}${r === 0 ? post : ''}</text>`,
      );
    }),
  );
  return o;
}

/** Arrowhead markers: normal (#ah) and highlighted (#ahh). */
export const marker = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="var(--ink-2)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker><marker id="ahh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="var(--act-line)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;

/** Ids for array items in id order, so keyed elements are always emitted in a stable order. */
export const byId = (a: unknown[], ids: number[] | undefined): [number, number][] =>
  (ids || a.map((_, i) => i))
    .map((id, pos): [number, number] => [id, pos])
    .sort((p, q) => p[0] - q[0]);
