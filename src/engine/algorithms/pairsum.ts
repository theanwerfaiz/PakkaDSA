import { ask, M } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrTargetInput, Step, Vars } from '../types';

export function pairsum(inp: ArrTargetInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a].sort((x, y) => x - y);
  const t = inp.t;
  const st = { a, vars: { target: t } as Vars };
  let L = 0;
  let R = a.length - 1;
  r.add(
    st,
    { ptr: { L, R } },
    0,
    M(
      `Find two numbers that add up to ${t}. Start with pointers at both ends.`,
      `ऐसे दो अंक ढूँढें जिनका जोड़ ${t} हो। दोनों सिरों पर पॉइंटर रखें।`,
    ),
  );
  while (L < R) {
    const s = a[L] + a[R];
    st.vars = { target: t, sum: s };
    r.c.cmp++;
    const ans = s === t ? 2 : s < t ? 0 : 1;
    r.add(
      st,
      { cmp: [L, R], ptr: { L, R } },
      2,
      M(`${a[L]} + ${a[R]} = ${s}.`, `${a[L]} + ${a[R]} = ${s}।`),
      ask(
        `Sum ${s}, target ${t}. What next?`,
        `जोड़ ${s}, लक्ष्य ${t}। आगे क्या?`,
        [M('Move L right', 'L को दाएँ'), M('Move R left', 'R को बाएँ'), M('Found', 'मिल गया')],
        ans,
      ),
    );
    if (s === t) {
      r.add(
        st,
        { found: L, found2: R, ptr: { L, R } },
        3,
        M(`Found: ${a[L]} + ${a[R]} = ${t}.`, `मिल गया: ${a[L]} + ${a[R]} = ${t}।`),
      );
      return r.steps;
    }
    if (s < t) {
      L++;
      r.add(
        st,
        { ptr: { L, R } },
        4,
        M(
          `Too small, move L right for a bigger number.`,
          `जोड़ छोटा है, बड़ा अंक पाने के लिए L को दाएँ करें।`,
        ),
      );
    } else {
      R--;
      r.add(
        st,
        { ptr: { L, R } },
        5,
        M(
          `Too big, move R left for a smaller number.`,
          `जोड़ बड़ा है, छोटा अंक पाने के लिए R को बाएँ करें।`,
        ),
      );
    }
  }
  r.add(st, {}, 6, M(`No pair adds up to ${t}.`, `ऐसा कोई जोड़ा नहीं जिसका जोड़ ${t} हो।`));
  return r.steps;
}
