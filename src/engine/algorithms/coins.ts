import { range } from '../helpers';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { CoinsInput, Dp1State, Step } from '../types';

export function coins(inp: CoinsInput): Step<Dp1State>[] {
  const A = Math.min(inp.amt, 30);
  const cs = inp.coins;
  const r = new Rec<Dp1State>();
  const vals: (number | string)[] = Array(A + 1).fill('∞');
  const st = { labels: range(A + 1).map(String), vals, vars: { coins: cs.join(', ') } };
  vals[0] = 0;
  r.add(
    st,
    { cur: [0] },
    0,
    M(
      `Fewest coins to make each amount up to ${A}. Making 0 needs 0 coins.`,
      `${A} तक हर रकम बनाने के लिए सबसे कम सिक्के। 0 के लिए 0 सिक्के।`,
    ),
  );
  for (let x = 1; x <= A; x++) {
    let best = Infinity;
    let from = -1;
    let coin: number | null = null;
    for (const c of cs) {
      if (c <= x && vals[x - c] !== '∞' && (vals[x - c] as number) + 1 < best) {
        best = (vals[x - c] as number) + 1;
        from = x - c;
        coin = c;
      }
    }
    if (best < Infinity) {
      vals[x] = best;
      r.add(
        st,
        { cur: [x], from: [from] },
        3,
        M(
          `Amount ${x}: use coin ${coin} on top of amount ${from} → ${best} coins.`,
          `रकम ${x}: रकम ${from} पर सिक्का ${coin} लगाएँ → ${best} सिक्के।`,
        ),
      );
    } else
      r.add(
        st,
        { cur: [x] },
        3,
        M(`Amount ${x} cannot be made with these coins.`, `रकम ${x} इन सिक्कों से नहीं बन सकती।`),
      );
  }
  const none = vals[A] === '∞';
  r.add(
    st,
    { cur: [A] },
    4,
    M(
      none ? `${A} cannot be made.` : `Answer: ${vals[A]} coins make ${A}.`,
      none ? `${A} नहीं बन सकता।` : `उत्तर: ${vals[A]} सिक्कों से ${A} बनता है।`,
    ),
  );
  return r.steps;
}
