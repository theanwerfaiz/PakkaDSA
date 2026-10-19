import { range } from '../helpers';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { HanoiState, NInput, Step } from '../types';

export function hanoi(inp: NInput): Step<HanoiState>[] {
  const n = Math.max(2, Math.min(inp.n, 6));
  const r = new Rec<HanoiState>();
  const st: HanoiState = { n, pegs: [range(n).map((k) => n - k), [], []], vars: { moves: 0 } };
  const nm = ['A', 'B', 'C'];
  r.add(
    st,
    {},
    0,
    M(
      `Move all ${n} disks from A to C. Never put a bigger disk on a smaller one.`,
      `सभी ${n} डिस्क A से C पर ले जाएँ। बड़ी डिस्क कभी छोटी पर न रखें।`,
    ),
  );
  function mv(k: number, f: number, t: number, via: number): void {
    if (k === 0) return;
    mv(k - 1, f, via, t);
    const d = st.pegs[f].pop() as number;
    st.pegs[t].push(d);
    st.vars = { moves: st.vars.moves + 1 };
    r.c.swp++;
    r.add(
      st,
      { move: [f, t], disk: d },
      2,
      M(
        `Move disk ${d} from ${nm[f]} to ${nm[t]}.`,
        `डिस्क ${d} को ${nm[f]} से ${nm[t]} पर ले जाएँ।`,
      ),
    );
    mv(k - 1, via, t, f);
  }
  mv(n, 0, 2, 1);
  r.add(
    st,
    {},
    4,
    M(`Solved in ${2 ** n - 1} moves (2^${n} − 1).`, `${2 ** n - 1} चालों में हल (2^${n} − 1)।`),
  );
  return r.steps;
}
