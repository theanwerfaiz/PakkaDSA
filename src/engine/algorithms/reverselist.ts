import { mkList } from '../lists';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrInput, ListState, Step } from '../types';

export function reverselist(inp: ArrInput): Step<ListState>[] {
  const r = new Rec<ListState>();
  const st = mkList(inp.a);
  let prev = -1;
  let cur = 0;
  st.head = 0;
  const name = (k: number) => (k === -1 ? 'null' : st.v[k]);
  r.add(
    st,
    { ptr: { head: 0, curr: 0 } },
    0,
    M(
      'Reverse the list by flipping each arrow, one node at a time.',
      'हर तीर को एक-एक नोड पर पलटकर लिस्ट को उल्टा करें।',
    ),
  );
  while (cur !== -1) {
    const nx = st.next[cur];
    r.add(
      st,
      { ptr: { prev, curr: cur, next: nx }, active: [cur] },
      2,
      M(`Save next = ${name(nx)}.`, `next = ${name(nx)} सहेजें।`),
    );
    st.next[cur] = prev;
    r.c.swp++;
    r.add(
      st,
      { ptr: { prev, curr: cur, next: nx }, swap: [cur] },
      3,
      M(
        `Point ${st.v[cur]} back to ${name(prev)}.`,
        `${st.v[cur]} को पीछे ${name(prev)} की ओर मोड़ें।`,
      ),
    );
    prev = cur;
    cur = nx;
    r.add(
      st,
      { ptr: { prev, curr: cur } },
      4,
      M('Move prev and curr one step forward.', 'prev और curr को एक कदम आगे बढ़ाएँ।'),
    );
  }
  st.head = prev;
  r.add(
    st,
    { ptr: { head: prev } },
    5,
    M(`Done. The new head is ${st.v[prev]}.`, `हो गया। नया head ${st.v[prev]} है।`),
  );
  return r.steps;
}
