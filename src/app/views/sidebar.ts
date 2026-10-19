import { ALGORITHMS } from '../../content/catalog';
import { $ } from '../dom';
import { t } from '../i18n';
import { S } from '../state';

/** Filters the list by algorithm name or category name in either language, case-insensitive. */
export function filterNav(): void {
  const q = ($('search') as HTMLInputElement).value.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll<HTMLElement>('#nav .cat').forEach((cat) => {
    const catHit =
      !!q && ((cat.dataset.catEn ?? '').includes(q) || (cat.dataset.catHi ?? '').includes(q));
    let any = false;
    cat.querySelectorAll<HTMLElement>('.al').forEach((a) => {
      const hit = !q || catHit || (a.dataset.name ?? '').includes(q);
      a.hidden = !hit;
      if (hit) any = true;
    });
    cat.hidden = !any;
    if (any) shown++;
  });
  $('noMatch').hidden = shown > 0;
}

/** Ticks for learned algorithms and the overall progress bar. */
export function refreshProgress(): void {
  document.querySelectorAll<HTMLElement>('#nav .al').forEach((a) => {
    const tick = a.querySelector<HTMLElement>('.tick');
    if (tick) tick.hidden = !S.learned.has(a.dataset.id ?? '');
  });
  const n = S.learned.size;
  $('progTxt').textContent = `${n} / ${ALGORITHMS.length} ${t(S.lang, 'learned')}`;
  $('progBar').style.width = (n / ALGORITHMS.length) * 100 + '%';
}

const openDrawer = (open: boolean) => {
  $('side').classList.toggle('open', open);
  $('menuBtn').setAttribute('aria-expanded', String(open));
  if (open) $('search').focus();
};

/** Search box, progress, and the slide-in drawer used on screens up to 900 px. */
export function initSidebar(): void {
  $('search').addEventListener('input', filterNav);
  $('menuBtn').addEventListener('click', () => openDrawer(!$('side').classList.contains('open')));
  $('side').addEventListener('click', (e) => {
    if (e.target === $('side')) openDrawer(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('side').classList.contains('open')) {
      openDrawer(false);
      $('menuBtn').focus();
    }
  });
  // Tapping outside the open drawer closes it.
  document.addEventListener('pointerdown', (e) => {
    const side = $('side');
    if (
      side.classList.contains('open') &&
      !side.contains(e.target as Node) &&
      !$('menuBtn').contains(e.target as Node)
    )
      openDrawer(false);
  });
  refreshProgress();
}
