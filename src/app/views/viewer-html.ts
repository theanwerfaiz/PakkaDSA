/* Pure HTML builders for the viewer, shared by the build (first paint) and the app (every step),
   so the page looks the same before and after scripts run. All text is escaped. */
import { algoPath, byId, homePath, nextOf, type Algorithm, type Lang } from '../../content/catalog';
import { CODE_TABS, type CodeLine } from '../../content/code';
import type { Step } from '../../engine/types';
import { L, t, type Key } from '../i18n';

const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );

/** Colour keys shown in the legend for each view. */
const LEGEND: Record<string, string[]> = {
  bars: ['def', 'cmp', 'act', 'done'],
  cells: ['def', 'cmp', 'act', 'done'],
  stack: ['vis', 'act', 'done', 'cmp'],
  list: ['def', 'act', 'done'],
  tree: ['def', 'cmp', 'act', 'vis', 'done'],
  heap: ['def', 'cmp', 'act', 'done'],
  graph: ['def', 'wait', 'act', 'vis', 'done'],
  grid: ['vis', 'wait', 'act'],
  dp1: ['vis', 'cmp', 'act'],
  dp2: ['def', 'cmp', 'act'],
  board: ['act', 'cmp'],
  hanoi: ['def', 'act'],
  sets: ['def', 'done', 'act'],
};
const SWATCH: Record<string, [string, string]> = {
  def: ['--node', '--node-line'],
  cmp: ['--cmp-fill', '--cmp-line'],
  act: ['--act-fill', '--act-line'],
  done: ['--done-fill', '--done-line'],
  vis: ['--vis-fill', '--vis-line'],
  wait: ['--wait-fill', '--wait-line'],
};

export const legendHtml = (lang: Lang, view: string) =>
  (LEGEND[view] || [])
    .map(
      (k) =>
        `<span><i style="background:var(${SWATCH[k][0]});border-color:var(${SWATCH[k][1]})"></i>${t(lang, `lg.${k}` as Key)}</span>`,
    )
    .join('') +
  (['bars', 'cells', 'list'].includes(view)
    ? `<span><i style="background:transparent;border-color:var(--ptr)"></i>${t(lang, 'lg.ptr')}</span>`
    : '');

/** The step note with numbers and quoted text softly highlighted. */
export const noteHtml = (lang: Lang, step: Step) =>
  esc(L(lang, step.m)).replace(/(\d+(\.\d+)?|'[^']*'|&quot;[^&]*&quot;)/g, '<mark>$1</mark>');

/** Watch chips: named variables, comparison and swap counters for sorting views, output so far. */
export function watchHtml(lang: Lang, a: Algorithm, step: Step): string {
  let w = '';
  const s = step.st as { vars?: Record<string, unknown>; out?: unknown[] };
  for (const [k, v] of Object.entries(s.vars || {}))
    w += `<span class="wv"><b>${esc(k)}</b>${esc(v)}</span>`;
  if (
    ['bars', 'cells', 'heap'].includes(a.view) &&
    !['two', 'window', 'array'].includes(a.category)
  )
    w += `<span class="wv"><b>${t(lang, 'cmp')}</b>${step.c.cmp}</span><span class="wv"><b>${t(lang, 'swp')}</b>${step.c.swp}</span>`;
  if (s.out && s.out.length)
    w += `<span class="wv out"><b>${t(lang, 'out')}</b>${esc(s.out.join(a.view === 'graph' ? ' → ' : ', '))}</span>`;
  return w;
}

export function nextLink(lang: Lang, a: Algorithm): { href: string; html: string } {
  const n = nextOf(a.id);
  const next = n ? byId(n) : undefined;
  return {
    href: next ? algoPath(lang, next) : homePath(lang),
    html: `<span>${esc(next ? t(lang, 'upNext') + ': ' + next.name : t(lang, 'pathEnd'))}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`,
  };
}

export const codeTabsHtml = (current: string) =>
  CODE_TABS.map(
    (c) =>
      `<button data-cl="${c.id}" aria-pressed="${c.id === current}" title="${c.full}">${c.short}</button>`,
  ).join('');

/** Code lines; the ones tagged with the step's pseudocode line are highlighted. */
export const codeHtml = (lines: CodeLine[], ln: number | null) =>
  lines
    .map(
      (l) =>
        `<div data-ln="${l.ln.join(',')}"${ln !== null && l.ln.includes(ln) ? ' class="on"' : ''}>${esc(l.text) || ' '}</div>`,
    )
    .join('');
