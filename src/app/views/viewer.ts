import { algoPath, byId, homePath, nextOf, type Algorithm } from '../../content/catalog';
import { defaultInput } from '../../engine/inputs';
import { runAlgorithm } from '../../engine/registry';
import type { Input } from '../../engine/types';
import { stageHeight } from '../../render';
import { $, esc } from '../dom';
import { L, t, type Key } from '../i18n';
import { draw, glideMs, widthFor } from '../paint';
import { S, SPEEDS } from '../state';
import { store } from '../storage';
import { refreshProgress } from './sidebar';

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

export const algo = (): Algorithm => byId(S.id as string) as Algorithm;

/** Tallest drawing of the current run per width, so the stage never changes height between steps. */
const reserved = new Map<number, number>();

/** (Re)generates the steps for the current input and resets to step 1. */
export async function regen(input?: Input): Promise<void> {
  const a = algo();
  S.input = input ?? S.input ?? defaultInput(a.id);
  S.steps = await runAlgorithm(a.id, S.input);
  S.i = 0;
  S.answered = -1;
  reserved.clear();
  const scrub = $('scrub') as HTMLInputElement;
  scrub.max = String(S.steps.length - 1);
}

function reserveFor(W: number): number {
  let h = reserved.get(W);
  if (h === undefined) {
    h = stageHeight(algo().view, S.steps, W);
    reserved.set(W, h);
  }
  return h;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
const renderHooks: ((animate: boolean) => void)[] = [];
/** Lets features (code highlight, narration, …) react to every rendered step. */
export const onRender = (fn: (animate: boolean) => void) => renderHooks.push(fn);

/** Draws the current step and updates everything that depends on it. */
export function render(animate = false): void {
  const a = algo();
  const st = S.steps[S.i];
  if (!st) return;
  const stg = $('stage');
  stg.style.setProperty('--dur', glideMs(SPEEDS[S.speedIdx]) + 'ms');
  document.getElementById('loading')?.remove();
  const W = widthFor(stg);
  draw(stg, a.id, a.view, st, animate && S.anim);
  const svg = stg.querySelector('svg');
  if (svg) svg.setAttribute('viewBox', `0 0 ${W} ${reserveFor(W)}`);
  const m = L(S.lang, st.m);
  const note = $('note');
  note.innerHTML = esc(m).replace(/(\d+(\.\d+)?|'[^']*'|&quot;[^&]*&quot;)/g, '<mark>$1</mark>');
  note.dataset.step = `${S.i + 1}.`;
  let w = '';
  const s = st.st as { vars?: Record<string, unknown>; out?: unknown[] };
  for (const [k, v] of Object.entries(s.vars || {}))
    w += `<span class="wv"><b>${esc(k)}</b>${esc(v)}</span>`;
  if (
    ['bars', 'cells', 'heap'].includes(a.view) &&
    !['two', 'window', 'array'].includes(a.category)
  )
    w += `<span class="wv"><b>${t(S.lang, 'cmp')}</b>${st.c.cmp}</span><span class="wv"><b>${t(S.lang, 'swp')}</b>${st.c.swp}</span>`;
  if (s.out && s.out.length)
    w += `<span class="wv out"><b>${t(S.lang, 'out')}</b>${esc(s.out.join(a.view === 'graph' ? ' → ' : ', '))}</span>`;
  $('watch').innerHTML = w;
  ($('scrub') as HTMLInputElement).value = String(S.i);
  $('stepLbl').textContent = `${t(S.lang, 'step')} ${S.i + 1} ${t(S.lang, 'of')} ${S.steps.length}`;
  $('score').textContent =
    S.quiz || S.score.t ? `${t(S.lang, 'scoreL')} ${S.score.r}/${S.score.t}` : '';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.set('last', { id: S.id, i: S.i }), 500);
  renderHooks.forEach((fn) => fn(animate));
}

/** Parts that change per algorithm or language, not per step. */
export function renderStatic(): void {
  const a = algo();
  $('legend').innerHTML =
    (LEGEND[a.view] || [])
      .map(
        (k) =>
          `<span><i style="background:var(${SWATCH[k][0]});border-color:var(${SWATCH[k][1]})"></i>${t(S.lang, `lg.${k}` as Key)}</span>`,
      )
      .join('') +
    (['bars', 'cells', 'list'].includes(a.view)
      ? `<span><i style="background:transparent;border-color:var(--ptr)"></i>${t(S.lang, 'lg.ptr')}</span>`
      : '');
  const lr = S.learned.has(a.id);
  const learn = $('learnBtn');
  learn.setAttribute('aria-pressed', String(lr));
  learn.textContent = t(S.lang, lr ? 'isL' : 'markL');
  const n = nextOf(a.id);
  const next = $('nextAlgo');
  next.dataset.go = n ? algoPath(S.lang, byId(n) as Algorithm) : homePath(S.lang);
  next.innerHTML = `<span>${esc(n ? t(S.lang, 'upNext') + ': ' + (byId(n) as Algorithm).name : t(S.lang, 'pathEnd'))}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;
  $('stage').classList.toggle('gridmode', a.view === 'grid');
}

export function initViewerStatic(): void {
  $('learnBtn').addEventListener('click', () => {
    const id = algo().id;
    if (S.learned.has(id)) S.learned.delete(id);
    else S.learned.add(id);
    store.set('learned', [...S.learned]);
    refreshProgress();
    renderStatic();
  });
  $('nextAlgo').addEventListener('click', () => {
    location.href = $('nextAlgo').dataset.go || homePath(S.lang);
  });
  const tabs = [
    ['tCode', 'pCode'],
    ['tInput', 'pInput'],
    ['tAbout', 'pAbout'],
  ];
  const select = (id: string, focus: boolean) =>
    tabs.forEach(([tb, p]) => {
      const on = tb === id;
      $(tb).setAttribute('aria-selected', String(on));
      $(tb).tabIndex = on ? 0 : -1;
      $(p).hidden = !on;
      if (on && focus) $(tb).focus();
    });
  tabs.forEach(([tb], k) => {
    $(tb).addEventListener('click', () => select(tb, false));
    $(tb).addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(k + d + tabs.length) % tabs.length][0], true);
    });
  });
}
