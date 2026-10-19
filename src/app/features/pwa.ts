import { $ } from '../dom';
import { t } from '../i18n';
import { S } from '../state';
import { store } from '../storage';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
}

/** Registers the offline service worker (production builds only). */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const register = () =>
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is optional; the site works without it */
    });
  // Register after the page has loaded so caching never competes with the first view.
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => void register(), { once: true });
}

/** A polite, one-time offer to install the app, where the browser supports it. */
export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    if (store.get('install', false)) return;
    e.preventDefault();
    const evt = e as InstallPrompt;
    const bar = document.createElement('div');
    bar.className = 'install';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', t(S.lang, 'install.btn'));
    bar.innerHTML = `<span></span><button class="btn pri sm" type="button"></button><button class="btn sm" type="button"></button>`;
    const [text, yes, no] = [bar.children[0], bar.children[1], bar.children[2]] as HTMLElement[];
    text.textContent = t(S.lang, 'install.text');
    yes.textContent = t(S.lang, 'install.btn');
    no.textContent = t(S.lang, 'install.later');
    const done = () => {
      store.set('install', true);
      bar.remove();
    };
    yes.addEventListener('click', () => {
      done();
      void evt.prompt();
    });
    no.addEventListener('click', done);
    $('main').prepend(bar);
  });
}
