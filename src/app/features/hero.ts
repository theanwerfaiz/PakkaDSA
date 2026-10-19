import { algoPath, byId, type Algorithm } from '../../content/catalog';
import { runAlgorithm } from '../../engine/registry';
import { $maybe, reduceMotion } from '../dom';
import { t } from '../i18n';
import { draw } from '../paint';
import { S } from '../state';
import { store } from '../storage';

const HERO_INPUT = [6, 3, 8, 2, 9, 4, 7, 1];

/** Live bubble sort: 420 ms per step, 2.4 s on the sorted result, 1 s before restarting. */
async function startHero(box: HTMLElement): Promise<void> {
  const steps = await runAlgorithm('bubble', { type: 'arr', a: HERO_INPUT });
  box.style.setProperty('--dur', '300ms');
  const show = (k: number, anim: boolean) => draw(box, 'hero', 'bars', steps[k], anim);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    clearTimeout(timer);
    if (reduceMotion()) {
      show(Math.floor(steps.length / 2), false);
      return;
    }
    let k = 0;
    show(0, false);
    const tick = () => {
      k++;
      let d = 420;
      if (k >= steps.length) {
        k = 0;
        show(0, false);
        d = 1000;
      } else {
        show(k, true);
        if (k === steps.length - 1) d = 2400;
      }
      timer = setTimeout(tick, d);
    };
    timer = setTimeout(tick, 900);
  };
  run();
  let rz: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(run, 150);
  });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', run);
}

/** Welcome screen: hero loop, "Continue" button, and learned ticks and progress on the track cards. */
export function initHome(): void {
  const box = $maybe('heroStage');
  if (box) void startHero(box);
  const last = store.get<{ id: string; i: number } | null>('last', null);
  const la = last && byId(last.id);
  const cont = $maybe<HTMLAnchorElement>('hCont');
  if (cont && la && last) {
    const step = Math.max(0, Math.floor(Number(last.i) || 0));
    cont.textContent = (cont.dataset.template ?? '')
      .replace('{name}', la.name)
      .replace('{step}', String(step + 1));
    cont.href = algoPath(S.lang, la as Algorithm) + `#s=${step}`;
    cont.hidden = false;
  }
  document.querySelectorAll<HTMLElement>('.track').forEach((tr) => {
    const pills = [...tr.querySelectorAll<HTMLElement>('.pill')];
    let done = 0;
    pills.forEach((p) => {
      const on = S.learned.has(p.dataset.id ?? '');
      p.classList.toggle('done', on);
      const tick = p.querySelector<HTMLElement>('.tick');
      if (tick) tick.hidden = !on;
      if (on) done++;
    });
    const count = tr.querySelector<HTMLElement>('.count');
    if (count) count.textContent = `${done} / ${pills.length} ${t(S.lang, 'learned')}`;
    const bar = tr.querySelector<HTMLElement>('.bar i');
    if (bar) bar.style.width = (done / pills.length) * 100 + '%';
  });
}
