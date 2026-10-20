import { describe, expect, it } from 'vitest';
import { ALGORITHMS } from '../../../src/content/catalog';
import {
  loadSnippet,
  parseSnippet,
  plain,
  pseudoLines,
  type SnippetLang,
} from '../../../src/content/code';

const LANGS: SnippetLang[] = ['py', 'java', 'cpp', 'js'];

describe('code snippets', () => {
  it('parses tags and keeps indentation', () => {
    const lines = parseSnippet('0|for i in x:\n|    pass\n2,3|        y\n');
    expect(lines).toEqual([
      { ln: [0], text: 'for i in x:' },
      { ln: [], text: '    pass' },
      { ln: [2, 3], text: '        y' },
    ]);
    expect(plain(lines)).toBe('for i in x:\n    pass\n        y');
  });

  it('numbers pseudocode lines by index', () => {
    expect(pseudoLines(['a', 'b'])).toEqual([
      { ln: [0], text: 'a' },
      { ln: [1], text: 'b' },
    ]);
  });

  it('every algorithm has four snippets whose tags point at real pseudocode lines', async () => {
    for (const a of ALGORITHMS) {
      for (const lang of LANGS) {
        const lines = await loadSnippet(a.id, lang);
        expect(lines.length, `${a.id}.${lang}`).toBeGreaterThan(1);
        for (const l of lines)
          for (const n of l.ln) expect(n, `${a.id}.${lang}`).toBeLessThan(a.pseudocode.length);
        expect(plain(lines), `${a.id}.${lang}: no tags shipped`).not.toMatch(/^[\d,]*\|/m);
      }
    }
  });

  it('returns nothing for an unknown snippet', async () => {
    expect(await loadSnippet('nope', 'py')).toEqual([]);
  });
});
