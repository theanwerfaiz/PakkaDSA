/* Renders a real page with Astro's container API, loads it into happy-dom and starts the app,
   so app code runs against the same markup the site ships. */
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { vi } from 'vitest';
import { byId, type Algorithm, type Lang } from '../../../src/content/catalog';

// Pages rendered by render-pages.setup.ts (Astro's container API needs Node, not the DOM environment).
const page = (name: string) =>
  readFileSync(join(tmpdir(), 'pakkadsa-test-pages', `${name}.html`), 'utf8');

// Every page instance adds listeners to window and document, which outlive the page in tests.
// Record them so the next page starts clean, as it would after a real navigation.
type Listener = [
  EventTarget,
  string,
  EventListenerOrEventListenerObject,
  boolean | AddEventListenerOptions | undefined,
];
export const listeners: Listener[] = [];
for (const target of [window, document] as EventTarget[]) {
  const add = target.addEventListener.bind(target);
  // Wrapped on the objects themselves: happy-dom's window and document do not use the global
  // EventTarget.prototype.
  target.addEventListener = (
    type: string,
    fn: EventListenerOrEventListenerObject | null,
    opts?: boolean | AddEventListenerOptions,
  ) => {
    if (fn) listeners.push([target, type, fn, opts]);
    add(type, fn, opts);
  };
}

// Timers started by a page (the "remember last position" save, playback, the hero loop) are
// cancelled when the next page loads, as a real navigation would.
const timers = new Set<number>();
const realSetTimeout = window.setTimeout.bind(window);
window.setTimeout = ((fn: TimerHandler, ms?: number, ...args: unknown[]) => {
  const id = realSetTimeout(fn, ms, ...args);
  timers.add(id);
  return id;
}) as typeof window.setTimeout;

async function load(html: string, url: string): Promise<void> {
  // Let the previous page's pending work (lazy loads, timers) finish before swapping documents.
  await new Promise((r) => realSetTimeout(r, 60));
  for (const id of timers) clearTimeout(id);
  timers.clear();
  for (const [target, type, fn, opts] of listeners.splice(0))
    target.removeEventListener(type, fn, opts);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script').forEach((s) => s.remove());
  history.replaceState(null, '', url);
  const root = document.documentElement;
  for (const a of [...root.attributes]) root.removeAttribute(a.name);
  for (const a of [...doc.documentElement.attributes]) root.setAttribute(a.name, a.value);
  root.innerHTML = doc.documentElement.innerHTML;
  vi.resetModules();
  await import('../../../src/app/main');
}

export async function openAlgo(id: string, lang: Lang = 'en', hash = ''): Promise<void> {
  const algo = byId(id) as Algorithm;
  await load(
    page(`algo-${lang}-${id}`),
    `${lang === 'hi' ? '/hi' : ''}/algorithms/${algo.slug}/${hash}`,
  );
  // Wait for this page's own app instance to have its steps.
  const { S } = await import('../../../src/app/state');
  await until(() => S.id === id && S.steps.length > 0 && !document.querySelector('#stage svg.ssr'));
}

export async function openHome(lang: Lang = 'en'): Promise<void> {
  await load(page(`home-${lang}`), `${lang === 'hi' ? '/hi' : ''}/`);
}

export async function openTrack(id: string, lang: Lang = 'en'): Promise<void> {
  await load(page(`track-${lang}-${id}`), `/learn/${id}/`);
}

/** Waits for a condition (async steps such as lazy generators and snippets). */
export async function until(check: () => boolean, ms = 3000): Promise<void> {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error('timed out waiting for the page');
    await new Promise((r) => realSetTimeout(r, 5));
  }
}

export const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
export const text = (id: string) => ($(id).textContent ?? '').trim();
export const key = (k: string, target: EventTarget = document.body) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
