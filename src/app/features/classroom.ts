import { $ } from '../dom';
import { S } from '../state';
import { menuOpen, refreshToggles } from '../views/menu';
import { render } from '../views/viewer';

/** Classroom mode: hides the sidebar and enlarges the title, note and stage for projecting. */
export function initClassroom(): void {
  $('classBtn').addEventListener('click', () => {
    menuOpen(false);
    S.classroom = !S.classroom;
    document.body.classList.toggle('classroom', S.classroom);
    refreshToggles();
    if (S.steps.length) render(false);
  });
}
