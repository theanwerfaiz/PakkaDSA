import { inputFromData } from '../../engine/inputs';
import type { Input } from '../../engine/types';
import { $, toast } from '../dom';
import { t } from '../i18n';
import { S } from '../state';
import { algo } from '../views/viewer';

/** Link to this exact algorithm, input and step: /algorithms/<slug>/#s=<step>&d=<input JSON>. */
export const shareURL = () =>
  location.origin +
  location.pathname +
  `#s=${S.i}&d=${encodeURIComponent(JSON.stringify(S.input))}`;

/** Reads #s and #d from the URL. Anything malformed or not valid for this algorithm is ignored. */
export function readHash(): { step: number; input: Input | null } {
  const out = { step: 0, input: null as Input | null };
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    const s = Number(p.get('s'));
    if (Number.isInteger(s) && s > 0) out.step = s;
    const d = p.get('d');
    if (d) out.input = inputFromData(algo().id, algo().view, JSON.parse(d));
  } catch {
    /* ignore a broken link and show the default */
  }
  return out;
}

export function initShare(): void {
  $('shareBtn').addEventListener('click', async () => {
    const u = shareURL();
    const inp = $('shareInp') as HTMLInputElement;
    inp.value = u;
    $('shareBox').classList.add('show');
    try {
      await navigator.clipboard.writeText(u);
      toast(t(S.lang, 'copied'));
    } catch {
      inp.focus();
      inp.select();
    }
  });
}
