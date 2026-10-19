import { range } from '../helpers';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { Dp2State, KnapInput, Step } from '../types';

export function knap(inp: KnapInput): Step<Dp2State>[] {
  const it = inp.items.slice(0, 6);
  const W = Math.min(inp.cap, 12);
  const r = new Rec<Dp2State>();
  const t = [...Array(it.length + 1)].map(() => Array<number>(W + 1).fill(0));
  const st: Dp2State = {
    rows: ['0', ...it.map((x) => `${x[0]}kg ₹${x[1]}`)],
    cols: range(W + 1).map(String),
    t,
    base: 'r',
  };
  r.add(
    st,
    {},
    0,
    M(
      `0/1 knapsack, capacity ${W}. Cell = best value using the first i items with weight limit w.`,
      `0/1 नैपसैक, क्षमता ${W}। खाना = पहली i चीज़ों और वज़न सीमा w के साथ सबसे अधिक मूल्य।`,
    ),
  );
  for (let i = 1; i <= it.length; i++) {
    const [w, v] = it[i - 1];
    for (let c = 0; c <= W; c++) {
      const skip = t[i - 1][c];
      if (w <= c) {
        const take = t[i - 1][c - w] + v;
        t[i][c] = Math.max(skip, take);
        r.add(
          st,
          {
            cur: [i, c],
            from: [
              [i - 1, c],
              [i - 1, c - w],
            ],
          },
          3,
          M(
            `w=${c}: skip → ${skip}, take → ${t[i - 1][c - w]} + ${v} = ${take}. Best ${t[i][c]}.`,
            `w=${c}: छोड़ें → ${skip}, लें → ${t[i - 1][c - w]} + ${v} = ${take}। सबसे अच्छा ${t[i][c]}।`,
          ),
        );
      } else {
        t[i][c] = skip;
        if (c % 3 === 0)
          r.add(
            st,
            { cur: [i, c], from: [[i - 1, c]] },
            2,
            M(
              `Item (${w}kg) does not fit in ${c}: copy ${skip} from above.`,
              `चीज़ (${w}kg), ${c} में नहीं आती: ऊपर से ${skip} कॉपी करें।`,
            ),
          );
      }
    }
  }
  r.add(
    st,
    { cur: [it.length, W] },
    4,
    M(`Maximum value: ₹${t[it.length][W]}.`, `सबसे अधिक मूल्य: ₹${t[it.length][W]}।`),
  );
  return r.steps;
}
