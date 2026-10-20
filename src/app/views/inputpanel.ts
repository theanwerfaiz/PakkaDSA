import {
  defaultInput,
  G1,
  randomInput,
  randomMaze,
  validateInput,
  type InputFields,
} from '../../engine/inputs';
import type { Input } from '../../engine/types';
import { gridGeometry } from '../../render';
import { $, $maybe, esc, toast } from '../dom';
import { L, t, type Key } from '../i18n';
import { S, type GridMode } from '../state';
import { stop } from '../features/playback';
import { algo, regen, render } from './viewer';

const field = (id: string, label: string, val: unknown, extra = '') =>
  `<div class="field"><label for="in-${id}">${esc(label)}</label><input id="in-${id}" data-f="${id}" value="${esc(val)}" ${extra}></div>`;

/** The form for the current algorithm's input type, filled with the current input. */
function formHtml(i: Input): string {
  const lang = S.lang;
  const nums = (a: number[]) => field('a', t(lang, 'nums'), a.join(', '));
  const numeric = 'inputmode="numeric"';
  switch (i.type) {
    case 'arr':
      return nums(i.a);
    case 'arrt':
      return nums(i.a) + field('t', t(lang, 'target'), i.t, numeric);
    case 'arrk':
      return nums(i.a) + field('k', t(lang, 'k'), i.k, numeric);
    case 'arrc':
      return nums(i.a) + field('c', t(lang, 'cyc'), i.c, numeric);
    case 'str':
      return field('s', t(lang, algo().id === 'parens' ? 'brackets' : 'text'), i.s);
    case 'node':
      return `<div class="field"><label for="in-s">${t(lang, 'startN')}</label><select id="in-s" data-f="s">${G1.nodes
        .map((n) => `<option${n.id === i.s ? ' selected' : ''}>${n.id}</option>`)
        .join('')}</select></div><p class="keys">${t(lang, 'fixedG')}</p>`;
    case 'none':
      return `<p class="keys">${t(lang, 'fixedG')}</p>`;
    case 'n':
      return field(
        'n',
        `${t(lang, 'n')} (${i.lo}–${i.hi})`,
        i.n,
        `type="number" min="${i.lo}" max="${i.hi}"`,
      );
    case 'coins':
      return (
        field('amt', t(lang, 'amount') + ' (1–30)', i.amt, numeric) +
        field('coins', t(lang, 'coins'), i.coins.join(', '))
      );
    case 'two':
      return field('s1', t(lang, 's1'), i.s1) + field('s2', t(lang, 's2'), i.s2);
    case 'knap':
      return (
        field('items', t(lang, 'items'), i.items.map((x) => x[0] + ':' + x[1]).join(', ')) +
        field('cap', t(lang, 'cap') + ' (1–12)', i.cap, numeric)
      );
    case 'grid': {
      const modes: [GridMode, Key][] = [
        ['wall', 'wall'],
        ['start', 'mvS'],
        ['end', 'mvG'],
      ];
      return `<div class="seg" role="group" aria-label="${t(lang, 'input')}">${modes
        .map(
          ([k, m]) =>
            `<button data-gm="${k}" aria-pressed="${S.gridMode === k}">${t(lang, m)}</button>`,
        )
        .join(
          '',
        )}</div><p class="keys">${t(lang, 'gridHelp')}</p><div class="row"><button class="btn" id="gMaze">${t(
        lang,
        'maze',
      )}</button><button class="btn" id="gClear">${t(lang, 'clear')}</button></div>`;
    }
  }
}

export function renderInputPanel(): void {
  const i = S.input as Input;
  const editable = i.type !== 'grid' && i.type !== 'none';
  const lang = S.lang;
  $('pInput').innerHTML =
    formHtml(i) +
    (editable
      ? `<div class="row"><button class="btn pri" id="inApply">${t(lang, 'apply')}</button><button class="btn" id="inRand">${t(
          lang,
          'random',
        )}</button><button class="btn" id="inReset">${t(lang, 'reset')}</button></div><p class="err" id="inErr" role="alert"></p>`
      : '');
}

async function run(input: Input, jumpToEnd = false): Promise<void> {
  stop();
  await regen(input);
  if (jumpToEnd) S.i = S.steps.length - 1;
  render(false);
}

function readFields(): InputFields {
  const f: InputFields = {};
  $('pInput')
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-f]')
    .forEach((el) => (f[el.dataset.f as string] = el.value));
  return f;
}

async function apply(): Promise<void> {
  const a = algo();
  const res = validateInput(a.id, a.view, S.input as Input, readFields());
  if (!res.ok) {
    $('inErr').textContent = L(S.lang, res.error);
    return;
  }
  await run(res.input);
  toast(t(S.lang, 'running'));
}

/* ---------- Grid editing ---------- */

let painting: 'draw' | 'erase' | null = null;

function gridCell(e: PointerEvent): [number, number] | null {
  const svg = $('stage').querySelector('svg');
  const i = S.input;
  const ctm = svg?.getScreenCTM();
  if (!svg || !ctm || !i || i.type !== 'grid') return null;
  // Client point -> SVG user units, whatever the drawing's scale or letterboxing.
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  const { cs, x0, y0 } = gridGeometry(i.grid, svg.viewBox.baseVal.width);
  const c = Math.floor((p.x - x0) / cs);
  const r = Math.floor((p.y - y0) / cs);
  if (c < 0 || r < 0 || c >= i.grid.C || r >= i.grid.R) return null;
  return [r, c];
}

function gridEdit(cell: [number, number], first: boolean): void {
  const i = S.input;
  if (!i || i.type !== 'grid') return;
  const g = structuredClone(i.grid);
  const k = cell[0] * g.C + cell[1];
  const isS = cell[0] === g.start[0] && cell[1] === g.start[1];
  const isE = cell[0] === g.end[0] && cell[1] === g.end[1];
  if (S.gridMode === 'start') {
    if (isE || g.walls.includes(k)) return;
    g.start = cell;
  } else if (S.gridMode === 'end') {
    if (isS || g.walls.includes(k)) return;
    g.end = cell;
  } else {
    if (isS || isE) return;
    if (first) painting = g.walls.includes(k) ? 'erase' : 'draw';
    const has = g.walls.includes(k);
    if (painting === 'draw' && !has) g.walls.push(k);
    else if (painting === 'erase' && has) g.walls = g.walls.filter((x) => x !== k);
    else return;
  }
  void run({ type: 'grid', grid: g }, true);
}

function initGridEditing(): void {
  const stg = $('stage');
  stg.addEventListener('pointerdown', (e) => {
    if (algo().view !== 'grid') return;
    const c = gridCell(e);
    if (!c) return;
    e.preventDefault();
    stg.setPointerCapture(e.pointerId);
    gridEdit(c, true);
  });
  stg.addEventListener('pointermove', (e) => {
    if (painting && S.gridMode === 'wall' && e.buttons) {
      const c = gridCell(e);
      if (c) gridEdit(c, false);
    }
  });
  const end = () => (painting = null);
  stg.addEventListener('pointerup', end);
  stg.addEventListener('pointercancel', end);
}

export function initInputPanel(): void {
  renderInputPanel();
  const panel = $('pInput');
  panel.addEventListener('click', (e) => {
    const target = e.target as Element;
    const a = algo();
    if (target.closest('#inApply')) void apply();
    else if (target.closest('#inRand')) {
      void run(randomInput(a.id, a.view, S.input as Input, Math.random)).then(renderInputPanel);
    } else if (target.closest('#inReset')) {
      void run(defaultInput(a.id)).then(renderInputPanel);
    } else if (target.closest('#gMaze')) {
      void run({ type: 'grid', grid: randomMaze(Math.random) });
    } else if (target.closest('#gClear')) {
      const i = S.input;
      if (i && i.type === 'grid') void run({ type: 'grid', grid: { ...i.grid, walls: [] } });
    } else {
      const gm = target.closest<HTMLElement>('[data-gm]');
      if (gm) {
        S.gridMode = gm.dataset.gm as GridMode;
        renderInputPanel();
      }
    }
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as Element).matches('input')) {
      e.preventDefault();
      void apply();
    }
  });
  panel.addEventListener('input', () => {
    const err = $maybe('inErr');
    if (err) err.textContent = '';
  });
  panel.addEventListener('change', (e) => {
    // The start node is a select: picking one runs immediately.
    if ((e.target as Element).matches('select')) void apply();
  });
  initGridEditing();
}
