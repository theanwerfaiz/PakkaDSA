import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrInput, SetsState, Step } from '../types';

export function subsets(inp: ArrInput): Step<SetsState>[] {
  const a = inp.a.slice(0, 5);
  const r = new Rec<SetsState>();
  const st: SetsState = { a, cur: [], out: [] };
  r.add(
    st,
    {},
    0,
    M(
      'Build every subset: for each item, choose to include it or not.',
      'हर उपसमुच्चय बनाएँ: हर चीज़ के लिए तय करें कि उसे लें या नहीं।',
    ),
  );
  function go(i: number): void {
    if (i === a.length) {
      const set = st.cur.map((k) => a[k]).join(', ');
      st.out.push('{' + set + '}');
      r.add(st, { rec: true }, 1, M(`Record subset {${set}}.`, `उपसमुच्चय {${set}} लिखें।`));
      return;
    }
    st.cur.push(i);
    r.add(st, { at: i, inc: true }, 2, M(`Include ${a[i]}.`, `${a[i]} को शामिल करें।`));
    go(i + 1);
    st.cur.pop();
    r.add(st, { at: i, inc: false }, 3, M(`Exclude ${a[i]}.`, `${a[i]} को छोड़ें।`));
    go(i + 1);
  }
  go(0);
  r.add(
    st,
    {},
    5,
    M(
      `All ${st.out.length} subsets found (2^${a.length}).`,
      `सभी ${st.out.length} उपसमुच्चय मिल गए (2^${a.length})।`,
    ),
  );
  return r.steps;
}
