import { ask, M, T } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrTargetInput, Step } from '../types';

export function binary(inp: ArrTargetInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a].sort((x, y) => x - y);
  const t = inp.t;
  const st = { a };
  let lo = 0;
  let hi = a.length - 1;
  r.add(
    st,
    { ptr: { lo, hi } },
    0,
    M(
      `Binary search needs a sorted array (sorted for you). Search for ${t}.`,
      `बाइनरी सर्च के लिए ऐरे क्रम में होनी चाहिए (आपके लिए कर दी गई)। ${t} ढूँढें।`,
    ),
  );
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    r.c.cmp++;
    const dim: number[] = [];
    for (let k = 0; k < a.length; k++) if (k < lo || k > hi) dim.push(k);
    const ans = a[mid] === t ? 2 : a[mid] < t ? 1 : 0;
    r.add(
      st,
      { cmp: [mid], ptr: { lo, mid, hi }, dim },
      2,
      M(`Middle item is a[${mid}] = ${a[mid]}.`, `बीच का अंक a[${mid}] = ${a[mid]} है।`),
      ask(
        `${a[mid]} vs ${t}: what happens next?`,
        `${a[mid]} बनाम ${t}: आगे क्या होगा?`,
        [M('Go left', 'बाएँ जाएँ'), M('Go right', 'दाएँ जाएँ'), M('Found it', 'मिल गया')],
        ans,
      ),
    );
    if (a[mid] === t) {
      r.add(st, { found: mid, ptr: { mid }, dim }, 3, T.found(t, mid));
      return r.steps;
    }
    if (a[mid] < t) {
      lo = mid + 1;
      r.add(
        st,
        { ptr: { lo, hi }, dim },
        4,
        M(`${a[mid]} < ${t}, so drop the left half.`, `${a[mid]} < ${t}, इसलिए बायाँ आधा हटा दें।`),
      );
    } else {
      hi = mid - 1;
      r.add(
        st,
        { ptr: { lo, hi }, dim },
        5,
        M(
          `${a[mid]} > ${t}, so drop the right half.`,
          `${a[mid]} > ${t}, इसलिए दायाँ आधा हटा दें।`,
        ),
      );
    }
  }
  r.add(st, { dim: [...a.keys()] }, 6, T.notFound(t));
  return r.steps;
}
