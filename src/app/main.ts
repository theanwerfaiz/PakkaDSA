/* Entry point for every page: shared header, menu and sidebar, plus the viewer on algorithm pages. */
import type { Lang } from '../content/catalog';
import { $, $maybe } from './dom';
import { initKeyboard } from './features/keyboard';
import { initPlayback } from './features/playback';
import { S, type CodeLang } from './state';
import { store } from './storage';
import { initMenu, isDark, menuOpen, refreshToggles, setTheme } from './views/menu';
import { initCodePanel } from './views/codepanel';
import { initSidebar } from './views/sidebar';
import { initViewerStatic, regen, render, renderStatic } from './views/viewer';

function loadPrefs(): void {
  S.lang = (document.documentElement.lang === 'hi' ? 'hi' : 'en') as Lang;
  store.set('lang', S.lang);
  S.learned = new Set(store.get<string[]>('learned', []));
  S.speedIdx = Math.max(0, Math.min(6, store.get('speed', 3)));
  S.anim = store.get('anim', true);
  const cl = store.get<CodeLang>('codeLang', 'pseudo');
  S.codeLang = ['pseudo', 'py', 'java', 'cpp', 'js'].includes(cl) ? cl : 'pseudo';
  document.documentElement.classList.toggle('noanim', !S.anim);
}

function initHeader(): void {
  initMenu();
  // The language link goes to the same page in the other language and keeps the step and input.
  $('langBtn').addEventListener('click', (e) => {
    if (!location.hash) return;
    e.preventDefault();
    location.href = ($('langBtn') as HTMLAnchorElement).href.split('#')[0] + location.hash;
  });
  $('themeBtn').addEventListener('click', () => {
    setTheme(isDark() ? 'light' : 'dark');
    menuOpen(false);
    refreshToggles();
    if (S.steps.length) render(false);
  });
  $('animBtn').addEventListener('click', () => {
    menuOpen(false);
    S.anim = !S.anim;
    store.set('anim', S.anim);
    document.documentElement.classList.toggle('noanim', !S.anim);
    refreshToggles();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refreshToggles);
  refreshToggles();
}

async function initViewer(id: string): Promise<void> {
  S.id = id;
  initViewerStatic();
  initPlayback();
  initKeyboard();
  renderStatic();
  initCodePanel();
  await regen();
  render(false);
  let rz: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => render(false), 150);
  });
}

loadPrefs();
initHeader();
initSidebar();
const algoId = document.body.dataset.algo;
if (algoId && $maybe('stage')) void initViewer(algoId);
