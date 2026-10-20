import { M } from '../messages';
import { Rec } from '../recorder';
import type { BoardState, NInput, Pair, Step } from '../types';

export function nqueens(inp: NInput): Step<BoardState>[] {
  const n = Math.max(4, Math.min(inp.n, 8));
  const r = new Rec<BoardState>();
  const q: number[] = Array(n).fill(-1);
  const st = { n, q };
  r.add(
    st,
    {},
    0,
    M(
      `Place ${n} queens so no two attack each other. Go row by row.`,
      `${n} रानियाँ ऐसे रखें कि कोई दो एक-दूसरे पर हमला न करें। पंक्ति दर पंक्ति चलें।`,
    ),
  );
  const safe = (row: number, c: number): Pair | null => {
    for (let k = 0; k < row; k++) {
      if (q[k] === c || Math.abs(q[k] - c) === row - k) return [k, q[k]];
    }
    return null;
  };
  function solve(row: number): boolean {
    if (row === n) {
      r.add(
        st,
        { solved: true },
        0,
        M('All queens placed safely: a solution!', 'सभी रानियाँ सुरक्षित रखी गईं: एक हल मिल गया!'),
      );
      return true;
    }
    for (let c = 0; c < n; c++) {
      const bad = safe(row, c);
      r.c.cmp++;
      if (bad) {
        r.add(
          st,
          { try: [row, c], bad: [bad] },
          2,
          M(
            `Row ${row}, column ${c} is attacked by the queen at (${bad[0]}, ${bad[1]}).`,
            `पंक्ति ${row}, स्तंभ ${c} पर (${bad[0]}, ${bad[1]}) वाली रानी हमला करती है।`,
          ),
        );
        continue;
      }
      q[row] = c;
      r.add(
        st,
        { try: [row, c] },
        3,
        M(`Place a queen at row ${row}, column ${c}.`, `पंक्ति ${row}, स्तंभ ${c} पर रानी रखें।`),
      );
      if (solve(row + 1)) return true;
      q[row] = -1;
      r.c.swp++;
      r.add(
        st,
        { back: [row, c] },
        4,
        M(
          `Dead end. Remove the queen from row ${row} and backtrack.`,
          `आगे रास्ता बंद। पंक्ति ${row} से रानी हटाएँ और पीछे लौटें।`,
        ),
      );
    }
    return false;
  }
  if (!solve(0)) r.add(st, {}, 6, M('No solution.', 'कोई हल नहीं।'));
  return r.steps;
}
