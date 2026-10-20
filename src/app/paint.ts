import type { Highlights, ViewType } from '../engine/types';
import { NARROW, render, WIDE } from '../render';
import { morphEl } from './morph';

/** Drawing width for a stage: narrow below 640 px of container width. */
export const widthFor = (box: HTMLElement) =>
  box.clientWidth && box.clientWidth < 640 ? NARROW : WIDE;

/** Parses an SVG string produced by our own renderers (all text in it is escaped). */
function parseSvg(html: string): SVGSVGElement | null {
  const doc = new DOMParser().parseFromString(html, 'image/svg+xml');
  const svg = doc.documentElement;
  return svg && svg.nodeName === 'svg'
    ? (document.importNode(svg, true) as unknown as SVGSVGElement)
    : null;
}

/**
 * Puts an SVG into the box. With the same signature (algorithm | view | width) it morphs the existing
 * drawing so keyed items glide; otherwise it replaces it. Without `animate`, transitions are
 * suppressed for this change (scrubbing, jumping, input changes, resizing).
 */
export function paint(box: HTMLElement, html: string, sig: string, animate: boolean): void {
  const nsvg = parseSvg(html);
  if (!nsvg) return;
  nsvg.setAttribute('data-sig', sig);
  const osvg = box.querySelector('svg');
  if (osvg && osvg.getAttribute('data-sig') === sig) {
    if (!animate) box.classList.add('nojump');
    morphEl(osvg, nsvg);
    if (!animate) {
      void box.offsetWidth;
      requestAnimationFrame(() => box.classList.remove('nojump'));
    }
  } else box.replaceChildren(nsvg);
}

export function draw(
  box: HTMLElement,
  sig: string,
  view: ViewType,
  step: { st: unknown; hl: Highlights },
  animate: boolean,
): number {
  const W = widthFor(box);
  paint(box, render(view, step.st, step.hl, W), `${sig}|${view}|${W}`, animate);
  return W;
}

/** Glide duration for a speed multiplier: clamp(70, 850 / speed × 0.42, 420) ms. */
export const glideMs = (speed: number) =>
  Math.max(70, Math.min(420, Math.round((850 / speed) * 0.42)));
