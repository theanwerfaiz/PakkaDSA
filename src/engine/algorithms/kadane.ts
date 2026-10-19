import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step, Vars } from '../types';

export function kadane(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const st = { a, vars: {} as Vars };
  let cur = 0;
  let best = -Infinity;
  let s = 0;
  let bl = 0;
  let br = 0;
  const shown = () => (best === -Infinity ? '—' : best);
  r.add(
    st,
    {},
    0,
    M(
      'Find the contiguous part with the largest sum (Kadane).',
      'सबसे बड़े जोड़ वाला लगातार हिस्सा ढूँढें (कडाने)।',
    ),
  );
  for (let i = 0; i < a.length; i++) {
    if (cur + a[i] < a[i]) {
      cur = a[i];
      s = i;
      r.c.cmp++;
      st.vars = { current: cur, best: shown() };
      r.add(
        st,
        { win: [s, i], active: [i] },
        2,
        M(
          `Starting fresh at ${a[i]} beats carrying the old sum.`,
          `पुराना जोड़ ढोने से अच्छा है ${a[i]} से नई शुरुआत करना।`,
        ),
      );
    } else {
      cur += a[i];
      st.vars = { current: cur, best: shown() };
      r.add(
        st,
        { win: [s, i], active: [i] },
        2,
        M(
          `Extend the run with ${a[i]}. Current sum ${cur}.`,
          `${a[i]} जोड़कर हिस्सा बढ़ाएँ। मौजूदा जोड़ ${cur}।`,
        ),
      );
    }
    if (cur > best) {
      best = cur;
      bl = s;
      br = i;
      st.vars = { current: cur, best };
      r.add(
        st,
        { win: [s, i], found: i },
        3,
        M(`New best sum: ${best}.`, `नया सबसे अच्छा जोड़: ${best}।`),
      );
    }
  }
  r.add(
    st,
    { win: [bl, br] },
    4,
    M(
      `Maximum subarray sum is ${best} (index ${bl} to ${br}).`,
      `सबसे बड़ा जोड़ ${best} है (इंडेक्स ${bl} से ${br})।`,
    ),
  );
  return r.steps;
}
