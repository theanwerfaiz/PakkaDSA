import { CODE_TABS, loadSnippet, plain, pseudoLines, type CodeLine } from '../../content/code';
import { $, esc, toast } from '../dom';
import { t } from '../i18n';
import { S, type CodeLang } from '../state';
import { store } from '../storage';
import { algo, onRender } from './viewer';

let lines: CodeLine[] = [];

function buildTabs(): void {
  $('langSeg').innerHTML = CODE_TABS.map(
    (c) =>
      `<button data-cl="${c.id}" aria-pressed="${c.id === S.codeLang}" aria-label="${c.full}">${c.short}</button>`,
  ).join('');
}

async function renderCode(): Promise<void> {
  const a = algo();
  const want = S.codeLang;
  const got = want === 'pseudo' ? pseudoLines(a.pseudocode) : await loadSnippet(a.id, want);
  if (want !== S.codeLang) return; // the user switched again while this was loading
  lines = got;
  const box = $('code');
  box.classList.toggle('pseudo', want === 'pseudo');
  box.innerHTML = lines
    .map((l) => `<div data-ln="${l.ln.join(',')}">${esc(l.text) || ' '}</div>`)
    .join('');
  markCode();
}

/** Highlights every line tagged with the current step's pseudocode index. */
export function markCode(): void {
  const st = S.steps[S.i];
  const cur = st && st.ln !== null ? String(st.ln) : null;
  $('code')
    .querySelectorAll<HTMLElement>('div')
    .forEach((d) => {
      const on = cur !== null && !!d.dataset.ln && d.dataset.ln.split(',').includes(cur);
      d.classList.toggle('on', on);
    });
}

async function copyCode(): Promise<void> {
  const txt = plain(lines);
  try {
    await navigator.clipboard.writeText(txt);
    toast(t(S.lang, 'codeCopied'));
  } catch {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast(t(S.lang, 'codeCopied'));
    } catch {
      /* nothing else to try; the code stays visible to copy by hand */
    }
    ta.remove();
  }
}

export function initCodePanel(): void {
  buildTabs();
  void renderCode();
  $('langSeg').addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-cl]');
    if (!b) return;
    S.codeLang = b.dataset.cl as CodeLang;
    store.set('codeLang', S.codeLang);
    buildTabs();
    void renderCode();
  });
  $('copyCode').addEventListener('click', () => void copyCode());
  onRender(markCode);
}
