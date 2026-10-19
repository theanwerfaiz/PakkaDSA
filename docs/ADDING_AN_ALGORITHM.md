# Adding an algorithm

An algorithm is a pure function from an input to a list of steps. Everything the viewer shows (drawing, note, watch chips, code highlight, quiz) comes from those steps.

## 1. The generator

Create `src/engine/algorithms/<id>.ts`. Use the recorder:

```ts
const r = new Rec<ArrayState>();
const st = { a: [...inp.a], sorted: [] as number[] };
r.add(st, {}, null, T.start); // state, highlights, pseudocode line, message, quiz?
r.add(
  st,
  { cmp: [i, j] },
  2,
  T.cmp(a[i], a[j]),
  ask('Will they swap?', 'क्या जगह बदलेगी?', [YES, NO], 0),
);
```

- `add` deep-copies the state, so keep mutating `st`.
- Every message is `M(english, hindi)`. Name the actual values ("Compare 38 and 27."). Technical terms stay in English inside Hindi sentences.
- Add a step for the start, each comparison, each change, each "fixed" event, and a final "done" step that states the result.
- A quiz question goes on the step **before** the outcome it asks about, with 2–3 options.
- No randomness, no DOM, no `window`. Keep default runs under about 150 steps and any valid input under 2,000.
- Reuse a view (`bars`, `cells`, `stack`, `list`, `tree`, `heap`, `graph`, `grid`, `dp1`, `dp2`, `board`, `sets`, `hanoi`) and its state shape from `src/engine/types.ts`. A new view needs a renderer in `src/render/` at widths 860 and 420, legend entries and tests.

## 2. Register it

- `src/engine/algorithms/index.ts` and `src/engine/registry.ts`: the generator, its view and input type.
- `src/engine/inputs.ts`: its default input (validation limits come from its input type and view).

## 3. Content

Add an entry to `src/content/algorithms.json`: `id`, `slug`, `name`, `category`, `view`, `input`, `complexity`, `description` and `interviewTip` in English and Hindi, and `pseudocode` (one string per line; the step's line index points into it). Add the id to a track in the same file.

## 4. Code

Write `src/content/code/<id>.{py,java,cpp,js}.txt`. Every line starts with the pseudocode line indexes it implements, then `|`:

```
0|    for i in range(n - 1):
|        swapped = False
2,3|            if a[j] > a[j + 1]:
```

Add answer checks for the new function to each harness in `tests/snippets/` and run `npm run check:snippets`.

## 5. Tests

- Add a final-state check against a simple, independent implementation in `tests/unit/engine/correctness.test.ts`; the invariant and random-input tests pick the algorithm up automatically.
- Run `npm run golden:update` to record its steps and drawings, then `npm run check:all`.
- Run `npm run images` to make its social-preview card.
