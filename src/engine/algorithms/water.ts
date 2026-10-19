import { ask, M } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, ArrInput, Step, Vars } from '../types';

export function water(inp: ArrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.a];
  const st = { a, vars: {} as Vars };
  let L = 0;
  let R = a.length - 1;
  let best = 0;
  let bl = 0;
  let br = 0;
  r.add(
    st,
    { ptr: { L, R } },
    0,
    M(
      'Each bar is a wall. Find two walls that hold the most water.',
      'हर बार एक दीवार है। ऐसी दो दीवारें ढूँढें जो सबसे ज़्यादा पानी रोकें।',
    ),
  );
  while (L < R) {
    const h = Math.min(a[L], a[R]);
    const area = h * (R - L);
    if (area > best) {
      best = area;
      bl = L;
      br = R;
    }
    st.vars = { area, best };
    r.c.cmp++;
    r.add(
      st,
      { ptr: { L, R }, water: [L, R, h], cmp: [L, R] },
      2,
      M(
        `Width ${R - L} × height ${h} = ${area}. Best so far: ${best}.`,
        `चौड़ाई ${R - L} × ऊँचाई ${h} = ${area}। अब तक सबसे अच्छा: ${best}।`,
      ),
      ask(
        'Which pointer should move?',
        'कौन-सा पॉइंटर खिसकना चाहिए?',
        [M('L (shorter or equal)', 'L (छोटी या बराबर)'), M('R (shorter)', 'R (छोटी)')],
        a[L] <= a[R] ? 0 : 1,
      ),
    );
    if (a[L] <= a[R]) {
      L++;
      r.add(
        st,
        { ptr: { L, R } },
        3,
        M(
          'Move the shorter wall L inward. Keeping it can never give more water.',
          'छोटी दीवार L को अंदर खिसकाएँ। इसे रखने से पानी कभी ज़्यादा नहीं होगा।',
        ),
      );
    } else {
      R--;
      r.add(
        st,
        { ptr: { L, R } },
        4,
        M('Move the shorter wall R inward.', 'छोटी दीवार R को अंदर खिसकाएँ।'),
      );
    }
  }
  r.add(
    st,
    { water: [bl, br, Math.min(a[bl], a[br])], found: bl, found2: br },
    5,
    M(
      `Maximum water is ${best}, between index ${bl} and ${br}.`,
      `सबसे ज़्यादा पानी ${best} है, इंडेक्स ${bl} और ${br} के बीच।`,
    ),
  );
  return r.steps;
}
