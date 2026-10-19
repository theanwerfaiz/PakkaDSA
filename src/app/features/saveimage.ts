import { $, toast } from '../dom';
import { L, t } from '../i18n';
import { S } from '../state';
import { menuOpen } from '../views/menu';
import { algo } from '../views/viewer';

/**
 * Saves the current step as a PNG at 2×: the drawing plus a footer with the step and its message.
 * CSS variables are resolved and CSS transforms become SVG transforms before rasterising, then the
 * file is offered as an ordinary download. Nothing is uploaded anywhere.
 */
export function saveImage(): void {
  const svg = $('stage').querySelector('svg');
  if (!svg) return;
  const cs = getComputedStyle(document.documentElement);
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.querySelectorAll<SVGElement>('[style]').forEach((el) => {
    const tr = el.style.transform;
    if (tr) {
      el.setAttribute('transform', tr.replace(/px/g, '').replace(/,/g, ' '));
      el.removeAttribute('style');
    }
  });
  const txt = new XMLSerializer()
    .serializeToString(copy)
    .replace(/var\((--[a-z0-9-]+)\)/g, (_, v: string) => cs.getPropertyValue(v).trim() || '#000');
  const vb = svg.viewBox.baseVal;
  const scale = 2;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = vb.width * scale;
    c.height = vb.height * scale + 80;
    const x = c.getContext('2d');
    if (!x) return;
    x.fillStyle = cs.getPropertyValue('--paper').trim();
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0, vb.width * scale, vb.height * scale);
    x.fillStyle = cs.getPropertyValue('--ink').trim();
    x.font = '600 26px Instrument Sans, Noto Sans Devanagari, sans-serif';
    x.fillText(`${algo().name}: ${t(S.lang, 'step')} ${S.i + 1}`, 24, vb.height * scale + 34);
    x.font = '22px Kalam, Noto Sans Devanagari, sans-serif';
    x.fillText(L(S.lang, S.steps[S.i].m).slice(0, 110), 24, vb.height * scale + 66);
    c.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pakkadsa-${algo().id}-step-${S.i + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast(t(S.lang, 'saved'));
    }, 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
}

export function initSaveImage(): void {
  $('saveBtn').addEventListener('click', () => {
    menuOpen(false);
    saveImage();
  });
}
