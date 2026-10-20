/** Element by id. The page markup is ours, so a missing element is a bug: fail loudly. */
export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}
export const $maybe = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T | null;

/** Escapes text for HTML. */
export const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );

let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** Shows a short status message (role="status"), dismissed after about 2.2 s. */
export function toast(text: string): void {
  const e = $('toast');
  e.textContent = text;
  e.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => e.classList.remove('show'), 2200);
}

export const reduceMotion = () =>
  !!window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
