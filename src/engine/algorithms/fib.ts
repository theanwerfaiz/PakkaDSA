import { range } from '../helpers';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { Dp1State, NInput, Step } from '../types';

export function fib(inp: NInput): Step<Dp1State>[] {
  const n = Math.min(inp.n, 20);
  const r = new Rec<Dp1State>();
  const vals: (number | string)[] = Array(n + 1).fill('');
  const st = { labels: range(n + 1).map((i) => 'F' + i), vals };
  vals[0] = 0;
  if (n >= 1) vals[1] = 1;
  r.add(st, { cur: [0, 1] }, 0, M('Base cases: F0 = 0 and F1 = 1.', 'आधार: F0 = 0 और F1 = 1।'));
  for (let i = 2; i <= n; i++) {
    vals[i] = (vals[i - 1] as number) + (vals[i - 2] as number);
    const sum = `F${i} = F${i - 1} + F${i - 2} = ${vals[i - 1]} + ${vals[i - 2]} = ${vals[i]}`;
    r.add(st, { cur: [i], from: [i - 1, i - 2] }, 2, M(`${sum}.`, `${sum}।`));
  }
  r.add(
    st,
    { cur: [n] },
    3,
    M(
      `F${n} = ${vals[n]}. Each value was computed once, not over and over.`,
      `F${n} = ${vals[n]}। हर मान एक ही बार निकाला गया, बार-बार नहीं।`,
    ),
  );
  return r.steps;
}
