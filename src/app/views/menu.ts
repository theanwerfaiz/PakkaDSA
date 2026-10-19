import { $ } from '../dom';
import { t } from '../i18n';
import { S } from '../state';
import { store } from '../storage';

/** Is the page currently dark (by choice or by system setting)? */
export const isDark = () => getComputedStyle(document.documentElement).colorScheme === 'dark';

export function setTheme(theme: 'light' | 'dark' | null): void {
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
  store.set('theme', theme);
}

/** Toggle buttons in the More menu and their On/Off text (state is never shown by colour alone). */
const TOGGLES: Record<string, () => boolean> = {
  voiceBtn: () => S.voice,
  classBtn: () => S.classroom,
  animBtn: () => S.anim,
  themeBtn: isDark,
};

export function refreshToggles(): void {
  for (const [id, on] of Object.entries(TOGGLES)) {
    const b = $(id);
    const v = on();
    b.setAttribute('aria-checked', String(v));
    const st = b.querySelector('.st');
    if (st) st.textContent = t(S.lang, v ? 'on' : 'off');
  }
  $('quizBtn').setAttribute('aria-pressed', String(S.quiz));
}

const items = () => [...$('moreMenu').querySelectorAll<HTMLElement>('.mi:not([hidden])')];

export function menuOpen(open: boolean): void {
  const m = $('moreMenu');
  m.hidden = !open;
  $('moreBtn').setAttribute('aria-expanded', String(open));
  if (open) {
    refreshToggles();
    items()[0]?.focus();
  }
}

export const menuIsOpen = () => !$('moreMenu').hidden;

/** Wires the More menu: button, outside click, arrow keys, Escape (focus returns to the button), Tab. */
export function initMenu(): void {
  $('moreBtn').addEventListener('click', () => menuOpen(!menuIsOpen()));
  document.addEventListener('click', (e) => {
    if (menuIsOpen() && !(e.target as Element).closest('.menu-wrap')) menuOpen(false);
  });
  $('moreMenu').addEventListener('keydown', (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[(i + 1) % list.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      list[(i - 1 + list.length) % list.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      list[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      list[list.length - 1].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      menuOpen(false);
      $('moreBtn').focus();
    } else if (e.key === 'Tab') menuOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuIsOpen()) {
      menuOpen(false);
      $('moreBtn').focus();
    }
  });
}
