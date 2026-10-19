import { M } from '../messages';
import { Rec } from '../recorder';
import type { ArrayState, Step, StrInput, Vars } from '../types';

export function longestuniq(inp: StrInput): Step<ArrayState>[] {
  const r = new Rec<ArrayState>();
  const a = [...inp.s];
  const st = { a, vars: {} as Vars };
  const seen = new Map<string, number>();
  let L = 0;
  let best = 0;
  let bl = 0;
  r.add(
    st,
    {},
    0,
    M(
      'Find the longest stretch with no repeated letter.',
      'सबसे लंबा हिस्सा ढूँढें जिसमें कोई अक्षर दोबारा न आए।',
    ),
  );
  for (let R = 0; R < a.length; R++) {
    const ch = a[R];
    const prevAt = seen.get(ch);
    if (prevAt !== undefined && prevAt >= L) {
      const old = L;
      L = prevAt + 1;
      st.vars = { window: a.slice(L, R + 1).join(''), best };
      r.add(
        st,
        { win: [L, R], cmp: [R, prevAt] },
        2,
        M(
          `'${ch}' repeats. Move the left edge from ${old} to ${L}.`,
          `'${ch}' दोबारा आया। बायाँ किनारा ${old} से ${L} पर ले जाएँ।`,
        ),
      );
    }
    seen.set(ch, R);
    if (R - L + 1 > best) {
      best = R - L + 1;
      bl = L;
    }
    st.vars = { window: a.slice(L, R + 1).join(''), best };
    r.add(
      st,
      { win: [L, R], active: [R] },
      3,
      M(
        `Add '${ch}'. Window length ${R - L + 1}, best ${best}.`,
        `'${ch}' जोड़ें। खिड़की की लंबाई ${R - L + 1}, सबसे अच्छा ${best}।`,
      ),
    );
  }
  const run = a.slice(bl, bl + best).join('');
  r.add(
    st,
    { win: [bl, bl + best - 1] },
    5,
    M(
      `Longest unique stretch: "${run}" (length ${best}).`,
      `सबसे लंबा अनोखा हिस्सा: "${run}" (लंबाई ${best})।`,
    ),
  );
  return r.steps;
}
