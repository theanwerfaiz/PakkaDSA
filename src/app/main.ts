/* Entry point for every page: shared header, menu and sidebar, plus the viewer on algorithm pages. */
import type { Lang } from '../content/catalog';
import { $, $maybe } from './dom';
import { initClassroom } from './features/classroom';
import { initHome } from './features/hero';
import { initKeyboard } from './features/keyboard';
import { initNarration } from './features/narration';
import { initSaveImage } from './features/saveimage';
import { initShare, readHash } from './features/share';
import { initPlayback } from './features/playback';
import { S, type CodeLang } from './state';
import { store } from './storage';
import { initMenu, isDark, menuOpen, refreshToggles, setTheme } from './views/menu';
import { initCodePanel } from './views/codepanel';
import { initInputPanel, renderInputPanel } from './views/inputpanel';
import { initQuiz } from './views/quiz';
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
  initQuiz();
  initNarration();
  initKeyboard();
  renderStatic();
  initCodePanel();
  initShare();
  initSaveImage();
  const fromLink = readHash();
  await regen(fromLink.input ?? undefined);
  S.i = Math.min(fromLink.step, S.steps.length - 1);
  initInputPanel();
  render(false);
  window.addEventListener('hashchange', () => {
    const h = readHash();
    void regen(h.input ?? undefined).then(() => {
      S.i = Math.min(h.step, S.steps.length - 1);
      renderInputPanel();
      render(false);
    });
  });
  let rz: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => render(false), 150);
  });
}

loadPrefs();
initHeader();
initClassroom();
initSidebar();
const algoId = document.body.dataset.algo;
if (algoId && $maybe('stage')) void initViewer(algoId);
else if ($maybe('viewHome')) initHome();
