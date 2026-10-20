import en from '../content/i18n/en.json';
import hi from '../content/i18n/hi.json';
import type { Lang } from '../content/catalog';
import type { Msg } from '../engine/types';

export type Key = keyof typeof en;
const DICT: Record<Lang, Record<Key, string>> = { en, hi };

/** A UI string in the given language, with {placeholders} filled in. */
export function t(lang: Lang, key: Key, params: Record<string, string | number> = {}): string {
  return DICT[lang][key].replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? `{${p}}`));
}

/** Picks the right language out of a bilingual message. */
export const L = (lang: Lang, m: Msg | null | undefined): string => (m ? m[lang] || m.en : '');
