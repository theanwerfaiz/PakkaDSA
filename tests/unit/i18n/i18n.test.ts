import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { t } from '../../../src/app/i18n';
import { ALGORITHMS, CATEGORIES, TRACKS } from '../../../src/content/catalog';
import en from '../../../src/content/i18n/en.json';
import hi from '../../../src/content/i18n/hi.json';
import review from '../../../src/content/i18n/hi.review.json';

describe('dictionaries', () => {
  it('have the same keys in English and Hindi', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });

  it('have no empty strings', () => {
    for (const d of [en, hi])
      for (const [k, v] of Object.entries(d)) expect(v.trim(), k).not.toBe('');
  });

  it('use the same {placeholders} in both languages', () => {
    const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const k of Object.keys(en) as (keyof typeof en)[]) expect(ph(hi[k]), k).toEqual(ph(en[k]));
  });

  it('flag every Hindi string as not yet reviewed by a native speaker', () => {
    expect(Object.keys(review).sort()).toEqual(Object.keys(hi).sort());
    expect(Object.values(review).every((v) => v === false)).toBe(true);
  });

  it('fills placeholders', () => {
    expect(t('en', 'cont', { name: 'Bubble sort', step: 4 })).toBe('Continue: Bubble sort, step 4');
    expect(t('hi', 'stageLabel', { name: 'Quick sort', step: 2, total: 9 })).toBe(
      'Quick sort, कदम 2 (9 में से)',
    );
  });
});

describe('content in both languages', () => {
  it('every algorithm, category and track has non-empty English and Hindi text', () => {
    for (const a of ALGORITHMS) {
      for (const m of [a.description, a.interviewTip]) {
        expect(m.en.trim(), a.id).not.toBe('');
        expect(m.hi.trim(), a.id).not.toBe('');
      }
      expect(a.pseudocode.length, a.id).toBeGreaterThan(1);
    }
    for (const c of CATEGORIES) expect(c.name.en && c.name.hi, c.id).toBeTruthy();
    for (const tr of TRACKS)
      expect(
        tr.name.en && tr.name.hi && tr.description.en && tr.description.hi,
        tr.id,
      ).toBeTruthy();
  });
});

/** Text a user can read must come from the dictionaries (the browser tests also check the built Hindi pages). */
describe('no hard-coded user-visible text', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
    );
  it('app code puts no sentence literals on screen', () => {
    for (const f of walk('src/app').filter((x) => x.endsWith('.ts'))) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/(textContent|placeholder|title)\s*=\s*(['"])([^'"]*)\2/g))
        expect(
          !m[3].includes('${') && /[A-Za-z]{3,}|\p{Script=Devanagari}{2,}/u.test(m[3]),
          `${f}: ${m[0]}`,
        ).toBe(false);
    }
  });
});
