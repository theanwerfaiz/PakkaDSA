import { ask, M, NO, YES } from '../messages';
import { Rec } from '../recorder';
import type { Step, StackState, StrInput } from '../types';

export function parens(inp: StrInput): Step<StackState>[] {
  const r = new Rec<StackState>();
  const a = [...inp.s];
  const st = { a, stack: [] as string[] };
  const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  r.add(
    st,
    {},
    0,
    M(
      'Use a stack: push opening brackets, match closing ones with the top.',
      'स्टैक का उपयोग: खुलने वाले ब्रैकेट डालें, बंद होने वालों को ऊपर वाले से मिलाएँ।',
    ),
  );
  for (let i = 0; i < a.length; i++) {
    const ch = a[i];
    if ('([{'.includes(ch)) {
      st.stack.push(ch);
      r.add(
        st,
        { cur: i, push: true },
        2,
        M(`'${ch}' opens, push it.`, `'${ch}' खुलता है, इसे स्टैक में डालें।`),
      );
    } else {
      const top: string | undefined = st.stack[st.stack.length - 1];
      const ok = top === pair[ch];
      r.add(
        st,
        { cur: i, peek: true },
        4,
        M(
          `'${ch}' closes. Top of stack is '${top ?? 'empty'}'.`,
          `'${ch}' बंद करता है। स्टैक में सबसे ऊपर '${top ?? 'खाली'}' है।`,
        ),
        ask(
          `Does '${top ?? 'nothing'}' match '${ch}'?`,
          `क्या '${top ?? 'कुछ नहीं'}', '${ch}' से मेल खाता है?`,
          [YES, NO],
          ok ? 0 : 1,
        ),
      );
      if (!ok) {
        r.add(
          st,
          { cur: i, bad: true },
          4,
          M(
            'Mismatch, so the string is NOT balanced.',
            'मेल नहीं खाया, इसलिए स्ट्रिंग संतुलित नहीं है।',
          ),
        );
        return r.steps;
      }
      st.stack.pop();
      r.add(st, { cur: i }, 5, M(`Match! Pop '${top}'.`, `मेल खा गया! '${top}' निकालें।`));
    }
  }
  const ok = st.stack.length === 0;
  r.add(
    st,
    { good: ok, bad: !ok },
    6,
    ok
      ? M('Stack is empty: the brackets are balanced.', 'स्टैक खाली है: ब्रैकेट संतुलित हैं।')
      : M('Unclosed brackets remain: not balanced.', 'कुछ ब्रैकेट बंद नहीं हुए: संतुलित नहीं।'),
  );
  return r.steps;
}
