import type { Quiz } from '../../engine/types';
import { $, esc } from '../dom';
import { L, t } from '../i18n';
import { S } from '../state';
import { hooks, resume, stop } from '../features/playback';
import { refreshToggles } from './menu';
import { render } from './viewer';

let resumeAfter = false;
let answered = false;
let returnFocus: HTMLElement | null = null;

const isOpen = () => $('quiz').classList.contains('open');

function openQuiz(q: Quiz): void {
  resumeAfter = S.playing;
  stop();
  answered = false;
  returnFocus = document.activeElement as HTMLElement | null;
  $('quizQ').textContent = L(S.lang, q.q);
  $('quizFb').textContent = '';
  $('quizGo').hidden = true;
  $('quizOpts').innerHTML = q.opts
    .map((o, k) => `<button class="opt" data-k="${k}">${esc(L(S.lang, o))}</button>`)
    .join('');
  $('quiz').classList.add('open');
  $('quizOpts').querySelector<HTMLElement>('button')?.focus();
  $('quizOpts')
    .querySelectorAll<HTMLButtonElement>('.opt')
    .forEach((b) =>
      b.addEventListener('click', () => {
        const k = Number(b.dataset.k);
        const ok = k === q.ans;
        S.score.t++;
        if (ok) S.score.r++;
        answered = true;
        $('quizOpts')
          .querySelectorAll<HTMLButtonElement>('.opt')
          .forEach((x) => {
            x.disabled = true;
            const xk = Number(x.dataset.k);
            if (xk === q.ans) x.classList.add('right');
            else if (xk === k) x.classList.add('wrong');
          });
        $('quizFb').textContent = ok
          ? t(S.lang, 'right')
          : t(S.lang, 'wrong') + L(S.lang, q.opts[q.ans]);
        $('quizGo').hidden = false;
        $('quizGo').focus();
      }),
    );
}

function closeQuiz(): void {
  $('quiz').classList.remove('open');
  S.answered = S.i;
  S.i++;
  render(true);
  (returnFocus && document.contains(returnFocus) ? returnFocus : $('bNext')).focus();
  if (resumeAfter) resume();
}

/** Keeps Tab inside the dialog while it is open. */
function trapFocus(e: KeyboardEvent): void {
  if (e.key !== 'Tab') return;
  const f = [...$('quiz').querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden])')];
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export function initQuiz(): void {
  hooks.beforeNext = () => {
    const st = S.steps[S.i];
    if (S.quiz && st && st.ask && S.answered !== S.i) {
      openQuiz(st.ask);
      return true;
    }
    return false;
  };
  $('quizBtn').addEventListener('click', () => {
    S.quiz = !S.quiz;
    refreshToggles();
    render(false);
  });
  $('quizGo').addEventListener('click', closeQuiz);
  $('quiz').addEventListener('keydown', (e) => {
    trapFocus(e);
    if (e.key === 'Escape' && answered && isOpen()) closeQuiz();
  });
}
