import { byId, homePath, type Algorithm } from '../../content/catalog';
import { defaultInput } from '../../engine/inputs';
import { runAlgorithm } from '../../engine/registry';
import type { Input } from '../../engine/types';
import { stageHeight } from '../../render';
import { $ } from '../dom';
import { legendHtml, nextLink, noteHtml, watchHtml } from './viewer-html';
import { t } from '../i18n';
import { draw, glideMs, widthFor } from '../paint';
import { S, SPEEDS } from '../state';
import { store } from '../storage';
import { refreshProgress } from './sidebar';

export const algo = (): Algorithm => byId(S.id as string) as Algorithm;

/** Tallest drawing of the current run per width, so the stage never changes height between steps. */
const reserved = new Map<number, number>();

/**
 * The page ships step 1 of the default input already drawn at both widths. If the app starts there,
 * it adopts that drawing (and its reserved height) instead of drawing it again.
 */
let ssrPending = true;
function adoptBuildTimeDrawing(stg: HTMLElement, W: number, sig: string): boolean {
  if (!ssrPending) return false;
  ssrPending = false;
  const svgs = [...stg.querySelectorAll<SVGSVGElement>('svg.ssr')];
  const mine = svgs.find((s) => s.viewBox.baseVal.width === W);
  if (!mine || S.i !== 0 || !isDefaultInput()) {
    svgs.forEach((s) => s.remove());
    return false;
  }
  svgs.forEach((s) => s !== mine && s.remove());
  mine.removeAttribute('class');
  mine.setAttribute('data-sig', sig);
  reserved.set(W, mine.viewBox.baseVal.height);
  return true;
}
const isDefaultInput = () => JSON.stringify(S.input) === JSON.stringify(defaultInput(algo().id));

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
  const W = widthFor(stg);
  if (!adoptBuildTimeDrawing(stg, W, `${a.id}|${a.view}|${W}`))
    draw(stg, a.id, a.view, st, animate && S.anim);
  const svg = stg.querySelector('svg');
  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${W} ${reserveFor(W)}`);
    svg.setAttribute(
      'aria-label',
      t(S.lang, 'stageLabel', { name: a.name, step: S.i + 1, total: S.steps.length }),
    );
  }
  const note = $('note');
  note.innerHTML = noteHtml(S.lang, st);
  note.dataset.step = `${S.i + 1}.`;
  $('watch').innerHTML = watchHtml(S.lang, a, st);
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
  $('legend').innerHTML = legendHtml(S.lang, a.view);
  const lr = S.learned.has(a.id);
  const learn = $('learnBtn');
  learn.setAttribute('aria-pressed', String(lr));
  learn.textContent = t(S.lang, lr ? 'isL' : 'markL');
  const next = $('nextAlgo');
  const link = nextLink(S.lang, a);
  next.dataset.go = link.href;
  next.innerHTML = link.html;
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
