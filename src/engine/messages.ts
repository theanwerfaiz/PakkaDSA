import type { Msg, Quiz } from './types';

export const M = (en: string, hi: string): Msg => ({ en, hi });

export const YES = M('Yes', 'हाँ');
export const NO = M('No', 'नहीं');

/** Message templates shared by several algorithms. */
export const T = {
  start: M(
    'Here is the starting input. Press play or step forward.',
    'यह शुरुआती इनपुट है। प्ले दबाएँ या एक कदम आगे बढ़ें।',
  ),
  cmp: (a: unknown, b: unknown) => M(`Compare ${a} and ${b}.`, `${a} और ${b} की तुलना करें।`),
  swap: (a: unknown, b: unknown) =>
    M(`${a} > ${b}, so they swap places.`, `${a} > ${b}, इसलिए दोनों की जगह बदलती है।`),
  keep: (a: unknown, b: unknown) =>
    M(
      `${a} ≤ ${b}, already in order. No swap.`,
      `${a} ≤ ${b}, पहले से सही क्रम में। जगह नहीं बदलेगी।`,
    ),
  fixed: (v: unknown) => M(`${v} is now in its final place.`, `${v} अब अपनी सही जगह पर पहुँच गया।`),
  sorted: M('Done! The whole array is sorted.', 'हो गया! पूरी ऐरे क्रम में लग गई।'),
  found: (x: unknown, i: unknown) =>
    M(`Found ${x} at index ${i}.`, `${x} इंडेक्स ${i} पर मिल गया।`),
  notFound: (x: unknown) => M(`${x} is not in the array.`, `${x} ऐरे में नहीं है।`),
  done: M('Finished.', 'पूरा हुआ।'),
};

export const ask = (en: string, hi: string, opts: Msg[], ans: number): Quiz => ({
  q: M(en, hi),
  opts,
  ans,
});
