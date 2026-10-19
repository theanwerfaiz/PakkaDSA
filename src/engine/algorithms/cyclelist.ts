import { mkList } from '../lists';
import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrCycleInput, ListState, Step } from '../types';

export function cyclelist(inp: ArrCycleInput): Step<ListState>[] {
  const r = new Rec<ListState>();
  const st = mkList(inp.a);
  const n = st.v.length;
  const cp = inp.c;
  st.head = 0;
  if (cp >= 0 && cp < n) st.next[n - 1] = cp;
  let s = 0;
  let f = 0;
  r.add(
    st,
    { ptr: { slow: 0, fast: 0 } },
    0,
    M(
      cp >= 0
        ? `The last node points back to index ${cp}. Can we detect the loop?`
        : 'Is there a loop? Slow moves 1, fast moves 2.',
      cp >= 0
        ? `आखिरी नोड वापस इंडेक्स ${cp} की ओर इशारा करता है। क्या हम लूप पकड़ सकते हैं?`
        : 'क्या कोई लूप है? slow 1 कदम, fast 2 कदम।',
    ),
  );
  let guard = 0;
  while (guard++ < 200) {
    if (f === -1 || st.next[f] === -1) {
      r.add(
        st,
        { ptr: { slow: s } },
        4,
        M('Fast reached the end: no cycle.', 'fast आखिर तक पहुँच गया: कोई लूप नहीं।'),
      );
      return r.steps;
    }
    s = st.next[s];
    f = st.next[st.next[f]];
    r.c.cmp++;
    const fastPart = f !== -1 ? `, fast → ${st.v[f]}` : '';
    r.add(
      st,
      { ptr: { slow: s, fast: f === -1 ? undefined : f }, active: [s] },
      2,
      M(`slow → ${st.v[s]}${fastPart}.`, `slow → ${st.v[s]}${fastPart}।`),
    );
    if (f !== -1 && s === f) {
      r.add(
        st,
        { ptr: { 'slow=fast': s }, found: [s] },
        3,
        M(`They meet at ${st.v[s]}: there is a cycle!`, `दोनों ${st.v[s]} पर मिलते हैं: लूप है!`),
      );
      return r.steps;
    }
  }
  return r.steps;
}
