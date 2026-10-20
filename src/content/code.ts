/* Tagged code snippets: each line is "<pseudocode indexes>|<source line>" (see the snippet spec). */

export type SnippetLang = 'py' | 'java' | 'cpp' | 'js';
export interface CodeLine {
  /** Pseudocode line indexes this source line implements. */
  ln: number[];
  text: string;
}

/** Splits a tagged snippet into lines; the tags never reach the user. */
export function parseSnippet(src: string): CodeLine[] {
  return src
    .replace(/\n$/, '')
    .split('\n')
    .map((l) => {
      const m = /^([\d,]*)\|(.*)$/.exec(l);
      return {
        ln: m && m[1] ? m[1].split(',').map(Number) : [],
        text: m ? m[2] : l,
      };
    });
}

export const pseudoLines = (pseudocode: string[]): CodeLine[] =>
  pseudocode.map((text, i) => ({ ln: [i], text }));

/** Plain source with tags stripped (for Copy and the static listings). */
export const plain = (lines: CodeLine[]) => lines.map((l) => l.text).join('\n');

export const CODE_TABS: { id: 'pseudo' | SnippetLang; short: string; full: string }[] = [
  { id: 'pseudo', short: 'Pseudo', full: 'Pseudocode' },
  { id: 'py', short: 'Python', full: 'Python' },
  { id: 'java', short: 'Java', full: 'Java' },
  { id: 'cpp', short: 'C++', full: 'C++' },
  { id: 'js', short: 'JS', full: 'JavaScript' },
];

/** Lazy loaders for every snippet file, so the browser fetches only the ones it shows. */
const LOADERS = import.meta.glob<string>('./code/*.txt', { query: '?raw', import: 'default' });

export async function loadSnippet(id: string, lang: SnippetLang): Promise<CodeLine[]> {
  const load = LOADERS[`./code/${id}.${lang}.txt`];
  return load ? parseSnippet(await load()) : [];
}
