import { M } from '../messages';
import { Rec } from '../recorder';
import type { Dp2State, Pair, Step, TwoInput } from '../types';

export function lcs(inp: TwoInput): Step<Dp2State>[] {
  const a = inp.s1.slice(0, 10);
  const b = inp.s2.slice(0, 10);
  const r = new Rec<Dp2State>();
  const t = [...Array(a.length + 1)].map(() => Array<number>(b.length + 1).fill(0));
  const st: Dp2State = { rows: ['', ...a], cols: ['', ...b], t, base: 'rc' };
  r.add(
    st,
    {},
    0,
    M(
      `Longest common subsequence of "${a}" and "${b}". Row 0 and column 0 are 0.`,
      `"${a}" और "${b}" का सबसे लंबा साझा उप-क्रम। पंक्ति 0 और स्तंभ 0 शून्य हैं।`,
    ),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        t[i][j] = t[i - 1][j - 1] + 1;
        r.add(
          st,
          { cur: [i, j], from: [[i - 1, j - 1]] },
          2,
          M(
            `'${a[i - 1]}' = '${b[j - 1]}': diagonal + 1 = ${t[i][j]}.`,
            `'${a[i - 1]}' = '${b[j - 1]}': तिरछा + 1 = ${t[i][j]}।`,
          ),
        );
      } else {
        t[i][j] = Math.max(t[i - 1][j], t[i][j - 1]);
        r.add(
          st,
          {
            cur: [i, j],
            from: [
              [i - 1, j],
              [i, j - 1],
            ],
          },
          3,
          M(
            `'${a[i - 1]}' ≠ '${b[j - 1]}': take max of top and left = ${t[i][j]}.`,
            `'${a[i - 1]}' ≠ '${b[j - 1]}': ऊपर और बाएँ में से बड़ा = ${t[i][j]}।`,
          ),
        );
      }
    }
  let i = a.length;
  let j = b.length;
  let s = '';
  const path: Pair[] = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      s = a[i - 1] + s;
      path.push([i, j]);
      i--;
      j--;
    } else if (t[i - 1][j] >= t[i][j - 1]) i--;
    else j--;
  }
  st.vars = { lcs: s || '—' };
  r.add(
    st,
    { from: path },
    4,
    M(
      `LCS length ${t[a.length][b.length]}: "${s}".`,
      `LCS की लंबाई ${t[a.length][b.length]}: "${s}"।`,
    ),
  );
  return r.steps;
}
