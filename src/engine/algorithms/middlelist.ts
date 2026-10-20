import { mkList } from '../lists';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrInput, ListState, Step } from '../types';

export function middlelist(inp: ArrInput): Step<ListState>[] {
  const r = new Rec<ListState>();
  const st = mkList(inp.a);
  st.head = 0;
  let s = 0;
  let f = 0;
  r.add(
    st,
    { ptr: { slow: 0, fast: 0 } },
    0,
    M(
      'Slow moves 1 step, fast moves 2. When fast reaches the end, slow is in the middle.',
      'slow 1 कदम चलता है, fast 2। जब fast आखिर तक पहुँचे, slow बीच में होगा।',
    ),
  );
  while (st.next[f] !== -1 && st.next[st.next[f]] !== -1) {
    s = st.next[s];
    f = st.next[st.next[f]];
    r.add(
      st,
      { ptr: { slow: s, fast: f }, active: [s] },
      2,
      M(`slow → ${st.v[s]}, fast → ${st.v[f]}.`, `slow → ${st.v[s]}, fast → ${st.v[f]}।`),
    );
  }
  if (st.next[f] !== -1) {
    s = st.next[s];
    f = st.next[f];
    r.add(
      st,
      { ptr: { slow: s, fast: f }, active: [s] },
      2,
      M(
        'Even length: step once more to pick the second middle.',
        'सम लंबाई: दूसरा बीच वाला चुनने के लिए एक कदम और।',
      ),
    );
  }
  r.add(
    st,
    { ptr: { slow: s }, found: [s] },
    3,
    M(`The middle node is ${st.v[s]}.`, `बीच का नोड ${st.v[s]} है।`),
  );
  return r.steps;
}
