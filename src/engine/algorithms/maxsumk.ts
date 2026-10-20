import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrKInput, Step, Vars } from '../types';

export function maxsumk(inp: ArrKInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const k = Math.min(inp.k, a.length);
  const st = { a, vars: {} as Vars };
  let s = 0;
  for (let i = 0; i < k; i++) s += a[i];
  let best = s;
  let bi = 0;
  st.vars = { k, sum: s, best };
  r.add(
    st,
    { win: [0, k - 1] },
    0,
    M(`Sum of the first window of size ${k} is ${s}.`, `${k} आकार की पहली खिड़की का जोड़ ${s} है।`),
  );
  for (let i = k; i < a.length; i++) {
    s += a[i] - a[i - k];
    if (s > best) {
      best = s;
      bi = i - k + 1;
    }
    st.vars = { k, sum: s, best };
    r.add(
      st,
      { win: [i - k + 1, i], cmp: [i], dim: [i - k] },
      2,
      M(
        `Slide right: add ${a[i]}, remove ${a[i - k]}. Sum = ${s}.`,
        `खिड़की दाएँ खिसकाएँ: ${a[i]} जोड़ें, ${a[i - k]} घटाएँ। जोड़ = ${s}।`,
      ),
    );
  }
  r.add(
    st,
    { win: [bi, bi + k - 1], found: bi },
    4,
    M(
      `Best window starts at index ${bi} with sum ${best}.`,
      `सबसे अच्छी खिड़की इंडेक्स ${bi} से शुरू होती है, जोड़ ${best}।`,
    ),
  );
  return r.steps;
}
