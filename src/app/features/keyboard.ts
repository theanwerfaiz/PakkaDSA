import { $ } from '../dom';
import { menuIsOpen } from '../views/menu';
import { S } from '../state';
import { goTo, next, prev, stop, togglePlay } from './playback';

/**
 * Space play/pause, ←/→ step, Home/End jump, Q quiz, C classroom. Ignored while typing in a field,
 * and while a menu, the drawer or the quiz dialog is open.
 */
export function initKeyboard(): void {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as Element;
    if (target.closest('input,textarea,select,[contenteditable]') || menuIsOpen()) return;
    if ($('quiz').classList.contains('open') || $('side').classList.contains('open')) return;
    if (!S.steps.length) return;
    switch (e.key) {
      case ' ':
        if (target.closest('button,a')) return;
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        if (target.closest('[role="tab"]')) return;
        e.preventDefault();
        stop();
        next(false);
        break;
      case 'ArrowLeft':
        if (target.closest('[role="tab"]')) return;
        e.preventDefault();
        prev();
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(S.steps.length - 1);
        break;
      case 'q':
      case 'Q':
        $('quizBtn').click();
        break;
      case 'c':
      case 'C':
        $('classBtn').click();
        break;
    }
  });
}
