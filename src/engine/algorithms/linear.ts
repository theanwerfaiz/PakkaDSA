import { ask, M, NO, T, YES } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrTargetInput, Step } from '../types';

export function linear(inp: ArrTargetInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const t = inp.t;
  const st = { a };
  r.add(
    st,
    {},
    null,
    M(`Look for ${t} by checking items one by one.`, `${t} को एक-एक करके हर अंक जाँचकर ढूँढें।`),
  );
  for (let i = 0; i < a.length; i++) {
    r.c.cmp++;
    r.add(
      st,
      { cmp: [i], ptr: { i } },
      1,
      M(`Is a[${i}] = ${a[i]} equal to ${t}?`, `क्या a[${i}] = ${a[i]}, ${t} के बराबर है?`),
      ask(`Is ${a[i]} the target ${t}?`, `क्या ${a[i]} ही ${t} है?`, [YES, NO], a[i] === t ? 0 : 1),
    );
    if (a[i] === t) {
      r.add(st, { found: i, ptr: { i } }, 2, T.found(t, i));
      return r.steps;
    }
  }
  r.add(st, {}, 3, T.notFound(t));
  return r.steps;
}
