import { $ } from '../dom';
import { t } from '../i18n';
import { S, SPEEDS } from '../state';
import { store } from '../storage';
import { render } from '../views/viewer';

/** Hooks a feature can install: quiz interception and narration-driven pacing. */
export const hooks = {
  /** Return true to stop the step from advancing (the quiz opens instead). */
  beforeNext: (_auto: boolean): boolean => false,
  /** Return true when something else (narration) will schedule the next step. */
  pacedElsewhere: (): boolean => false,
};

function setPlayIcon(): void {
  $('playIco').innerHTML = S.playing
    ? '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>'
    : '<path d="M8 5.5v13l11-6.5z"/>';
  $('bPlay').setAttribute('aria-label', t(S.lang, S.playing ? 'pause' : 'play'));
}

export function stop(): void {
  S.playing = false;
  clearTimeout(S.timer);
  setPlayIcon();
}

export function schedule(): void {
  clearTimeout(S.timer);
  if (!S.playing || hooks.pacedElsewhere()) return;
  S.timer = setTimeout(
    () => {
      if (!next(true)) stop();
      else schedule();
    },
    Math.round(900 / SPEEDS[S.speedIdx]),
  );
}

export function play(): void {
  if (S.i >= S.steps.length - 1) {
    S.i = 0;
    render(false);
  }
  S.playing = true;
  setPlayIcon();
  schedule();
}

/** Resumes auto-play after something paused it (a quiz question). */
export function resume(): void {
  S.playing = true;
  setPlayIcon();
  schedule();
}

/** One step forward. Returns false at the end. */
export function next(auto: boolean): boolean {
  if (S.i >= S.steps.length - 1) return false;
  if (hooks.beforeNext(auto)) return true;
  S.i++;
  render(true);
  return true;
}

export function prev(): void {
  stop();
  if (S.i > 0) {
    S.i--;
    render(true);
  }
}

export function goTo(i: number): void {
  stop();
  S.i = Math.max(0, Math.min(i, S.steps.length - 1));
  render(false);
}

export const togglePlay = () => (S.playing ? stop() : play());

export function setSpeed(idx: number): void {
  S.speedIdx = idx;
  ($('speed') as HTMLInputElement).value = String(idx);
  $('speedLbl').textContent = SPEEDS[idx] + '×';
  store.set('speed', idx);
  if (S.playing) schedule();
}

export function initPlayback(): void {
  $('bPlay').addEventListener('click', togglePlay);
  $('bNext').addEventListener('click', () => {
    stop();
    next(false);
  });
  $('bPrev').addEventListener('click', prev);
  $('bStart').addEventListener('click', () => goTo(0));
  $('bEnd').addEventListener('click', () => goTo(S.steps.length - 1));
  $('scrub').addEventListener('input', (e) => goTo(+(e.target as HTMLInputElement).value));
  $('speed').addEventListener('input', (e) => setSpeed(+(e.target as HTMLInputElement).value));
  setSpeed(S.speedIdx);
  setPlayIcon();
}
