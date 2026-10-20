/* Final-state correctness: every generator's result is checked against a small, independent
   implementation written here, on default, edge-case and seeded random inputs. */
import { describe, expect, it } from 'vitest';
import { adj } from '../../../src/engine/graphs';
import {
  defaultGrid,
  defaultInput,
  G1,
  G2,
  randomInput,
  randomMaze,
} from '../../../src/engine/inputs';
import type {
  ArrayState,
  BoardState,
  Dp1State,
  Dp2State,
  GraphState,
  GridState,
  HanoiState,
  Input,
  ListState,
  SetsState,
  StackState,
  TreeState,
} from '../../../src/engine/types';
import { last, run, seeded, viewOf } from './helpers';

const rng = seeded(20261019);
const randoms = (id: string, n = 40): Input[] =>
  Array.from({ length: n }, () => randomInput(id, viewOf(id), defaultInput(id), rng));
const arr = (a: number[]): Input => ({ type: 'arr', a });
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

/* ---------- Sorting ---------- */

const SORT_CASES = [
  [38, 27, 43, 3, 9, 82, 10, 55],
  [5],
  [2, 1],
  [1, 2],
  [3, 3, 3],
  [4, -2, 4, -2, 0],
  [-5, -1, -999, 999, 0],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6],
  [1, 2, 3, 4, 5, 6, 7, 8],
];

describe('sorting', () => {
  for (const id of ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heapsort']) {
    it(`${id} sorts (duplicates, negatives, 1–2 items, random)`, () => {
      const inputs = [...SORT_CASES.map(arr), ...randoms(id)];
      for (const input of inputs) {
        const a = (input as { a: number[] }).a;
        const end = last(run<ArrayState>(id, input)).st;
        expect(end.a).toEqual([...a].sort((x, y) => x - y));
        expect(end.sorted?.length).toBe(a.length);
      }
    });
  }
});

/* ---------- Searching and arrays ---------- */

describe('searching', () => {
  it('linear search finds the first match or reports none', () => {
    const cases: Input[] = [
      defaultInput('linear'),
      { type: 'arrt', a: [4, 8, 15], t: 3 },
      { type: 'arrt', a: [7, 7, 7], t: 7 },
      ...randoms('linear'),
    ];
    for (const input of cases) {
      const { a, t } = input as { a: number[]; t: number };
      const end = last(run<ArrayState>('linear', input));
      const idx = a.indexOf(t);
      expect(end.hl.found ?? -1).toBe(idx);
    }
  });

  it('binary search finds the target in the sorted array or reports none', () => {
    const cases: Input[] = [
      defaultInput('binary'),
      { type: 'arrt', a: [1, 2], t: 3 },
      { type: 'arrt', a: [5], t: 5 },
      { type: 'arrt', a: [9, 1, 5, 3], t: 0 },
      ...randoms('binary'),
    ];
    for (const input of cases) {
      const { a, t } = input as { a: number[]; t: number };
      const sorted = [...a].sort((x, y) => x - y);
      const end = last(run<ArrayState>('binary', input));
      if (sorted.includes(t)) expect(sorted[end.hl.found as number]).toBe(t);
      else expect(end.hl.found).toBeUndefined();
    }
  });
});

describe('two pointers, windows and Kadane', () => {
  it('pair sum finds a valid pair exactly when one exists', () => {
    const cases: Input[] = [
      defaultInput('pairsum'),
      { type: 'arrt', a: [1, 2, 4], t: 100 },
      ...randoms('pairsum'),
    ];
    for (const input of cases) {
      const { a, t } = input as { a: number[]; t: number };
      const s = [...a].sort((x, y) => x - y);
      const exists = s.some((x, i) => s.some((y, j) => i < j && x + y === t));
      const end = last(run<ArrayState>('pairsum', input));
      if (exists) expect(s[end.hl.found as number] + s[end.hl.found2 as number]).toBe(t);
      else expect(end.hl.found).toBeUndefined();
    }
  });

  it('container with most water equals the brute-force maximum', () => {
    for (const input of [defaultInput('water'), arr([0, 0]), arr([5, 5]), ...randoms('water')]) {
      const a = (input as { a: number[] }).a;
      let best = 0;
      for (let i = 0; i < a.length; i++)
        for (let j = i + 1; j < a.length; j++)
          best = Math.max(best, Math.min(a[i], a[j]) * (j - i));
      const [l, r, h] = last(run<ArrayState>('water', input)).hl.water as number[];
      expect(h * (r - l)).toBe(best);
    }
  });

  it('max sum of k items equals the brute-force best window', () => {
    const cases: Input[] = [
      defaultInput('maxsumk'),
      { type: 'arrk', a: [-3, -1, -2], k: 3 },
      ...randoms('maxsumk'),
    ];
    for (const input of cases) {
      const { a, k } = input as { a: number[]; k: number };
      let best = -Infinity;
      for (let i = 0; i + k <= a.length; i++) best = Math.max(best, sum(a.slice(i, i + k)));
      const [l, r] = last(run<ArrayState>('maxsumk', input)).hl.win as number[];
      expect(sum(a.slice(l, r + 1))).toBe(best);
      expect(r - l + 1).toBe(k);
    }
  });

  it('longest substring without repeats equals the brute-force length', () => {
    const cases: Input[] = [
      defaultInput('longestuniq'),
      { type: 'str', s: 'aaaa' },
      { type: 'str', s: 'a' },
      ...randoms('longestuniq'),
    ];
    for (const input of cases) {
      const s = (input as { s: string }).s;
      let best = 0;
      for (let i = 0; i < s.length; i++)
        for (let j = i; j < s.length; j++)
          if (new Set(s.slice(i, j + 1)).size === j - i + 1) best = Math.max(best, j - i + 1);
      const [l, r] = last(run<ArrayState>('longestuniq', input)).hl.win as number[];
      expect(r - l + 1).toBe(best);
      expect(new Set(s.slice(l, r + 1)).size).toBe(best);
    }
  });

  it("Kadane's result equals the brute-force best subarray (including all-negative input)", () => {
    for (const input of [
      defaultInput('kadane'),
      arr([-4, -2, -7]),
      arr([-1]),
      arr([0, 0]),
      ...randoms('kadane'),
    ]) {
      const a = (input as { a: number[] }).a;
      let best = -Infinity;
      for (let i = 0; i < a.length; i++)
        for (let j = i; j < a.length; j++) best = Math.max(best, sum(a.slice(i, j + 1)));
      const [l, r] = last(run<ArrayState>('kadane', input)).hl.win as number[];
      expect(sum(a.slice(l, r + 1))).toBe(best);
    }
  });
});

/* ---------- Stack ---------- */

describe('stack', () => {
  const balanced = (s: string) => {
    const st: string[] = [];
    const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    for (const ch of s) {
      if ('([{'.includes(ch)) st.push(ch);
      else if (st.pop() !== pair[ch]) return false;
    }
    return st.length === 0;
  };
  it('valid parentheses matches a reference checker', () => {
    const cases = [
      '{[()()]}',
      '([)]',
      '(()[{}])',
      '{[}',
      '((()))[]',
      '[(])',
      '(',
      ')',
      '((',
      '()',
      '{}[]()',
      ']',
    ];
    for (const s of cases) {
      const end = last(run<StackState>('parens', { type: 'str', s }));
      expect(!!end.hl.good, s).toBe(balanced(s));
    }
  });

  it('next greater element matches a brute-force answer', () => {
    for (const input of [
      defaultInput('nextgreater'),
      arr([5, 4, 3]),
      arr([1, 1, 2]),
      ...randoms('nextgreater'),
    ]) {
      const a = (input as { a: number[] }).a;
      const expected = a.map((x, i) => a.slice(i + 1).find((y) => y > x) ?? -1);
      expect(last(run<StackState>('nextgreater', input)).st.res).toEqual(expected);
    }
  });
});

/* ---------- Linked lists ---------- */

const walk = (st: ListState, from: number, limit = 50) => {
  const out: number[] = [];
  for (let k = from; k !== -1 && out.length < limit; k = st.next[k]) out.push(st.v[k]);
  return out;
};

describe('linked lists', () => {
  it('reverses the list', () => {
    for (const input of [
      defaultInput('reverselist'),
      arr([1, 2]),
      arr([9, 9, 1]),
      ...randoms('reverselist'),
    ]) {
      const a = (input as { a: number[] }).a;
      const end = last(run<ListState>('reverselist', input)).st;
      expect(walk(end, end.head as number)).toEqual([...a].reverse());
    }
  });

  it('finds the (second) middle node', () => {
    for (const a of [
      [1, 2],
      [1, 2, 3],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6, 7, 8],
    ]) {
      const end = last(run<ListState>('middlelist', arr(a)));
      expect(end.hl.ptr?.slow).toBe(Math.floor(a.length / 2));
    }
  });

  it('detects a cycle exactly when there is one', () => {
    const cases: Input[] = [
      defaultInput('cyclelist'),
      { type: 'arrc', a: [1, 2, 3], c: -1 },
      { type: 'arrc', a: [1, 2], c: 0 },
      { type: 'arrc', a: [1, 2, 3, 4], c: 3 },
      ...randoms('cyclelist'),
    ];
    for (const input of cases) {
      const c = (input as { c: number }).c;
      const end = last(run<ListState>('cyclelist', input));
      expect(end.hl.ptr && 'slow=fast' in end.hl.ptr).toBe(c >= 0);
    }
  });
});

/* ---------- Trees and heaps ---------- */

interface RefNode {
  v: number;
  l?: RefNode;
  r?: RefNode;
}
const refBST = (vals: number[]) => {
  let root: RefNode | undefined;
  for (const v of vals) {
    const node: RefNode = { v };
    if (!root) {
      root = node;
      continue;
    }
    let c = root;
    for (;;) {
      if (v < c.v) {
        if (!c.l) {
          c.l = node;
          break;
        }
        c = c.l;
      } else {
        if (!c.r) {
          c.r = node;
          break;
        }
        c = c.r;
      }
    }
  }
  return root;
};
const order = (t: RefNode | undefined, kind: 'in' | 'pre' | 'post'): number[] =>
  !t
    ? []
    : kind === 'pre'
      ? [t.v, ...order(t.l, kind), ...order(t.r, kind)]
      : kind === 'in'
        ? [...order(t.l, kind), t.v, ...order(t.r, kind)]
        : [...order(t.l, kind), ...order(t.r, kind), t.v];
const levels = (t: RefNode | undefined) => {
  const out: number[] = [];
  const q = t ? [t] : [];
  while (q.length) {
    const n = q.shift() as RefNode;
    out.push(n.v);
    if (n.l) q.push(n.l);
    if (n.r) q.push(n.r);
  }
  return out;
};
const treeInputs = (id: string): Input[] => [
  defaultInput(id),
  arr([7]),
  arr([3, 3, 3]),
  arr([1, 2, 3, 4, 5]),
  ...randoms(id),
];

describe('trees and heaps', () => {
  it('BST insert builds a valid search tree holding every value', () => {
    for (const input of treeInputs('bstbuild')) {
      const a = (input as { a: number[] }).a;
      const st = last(run<TreeState>('bstbuild', input)).st;
      const ino = (k: number): number[] =>
        k === -1 ? [] : [...ino(st.n[k].l), st.n[k].v, ...ino(st.n[k].r)];
      expect(ino(st.root)).toEqual([...a].sort((x, y) => x - y));
      expect(order(refBST(a), 'pre')).toEqual(
        (function pre(k: number): number[] {
          return k === -1 ? [] : [st.n[k].v, ...pre(st.n[k].l), ...pre(st.n[k].r)];
        })(st.root),
      );
    }
  });

  it('BST search finds a value exactly when it is in the tree', () => {
    const base = [50, 30, 70, 20, 40, 60, 80, 35, 65];
    for (const t of [...base, 0, 45, 99]) {
      const end = last(run<TreeState>('bstsearch', { type: 'arrt', a: base, t }));
      if (base.includes(t)) expect(end.st.n[end.hl.found as number].v).toBe(t);
      else expect(end.hl.found).toBeUndefined();
    }
  });

  for (const [id, kind] of [
    ['inorder', 'in'],
    ['preorder', 'pre'],
    ['postorder', 'post'],
  ] as const) {
    it(`${id} matches a reference traversal`, () => {
      for (const input of treeInputs(id)) {
        const a = (input as { a: number[] }).a;
        expect(last(run<TreeState>(id, input)).st.out).toEqual(order(refBST(a), kind));
      }
    });
  }

  it('level order matches a reference breadth-first walk', () => {
    for (const input of treeInputs('levelorder')) {
      const a = (input as { a: number[] }).a;
      expect(last(run<TreeState>('levelorder', input)).st.out).toEqual(levels(refBST(a)));
    }
  });

  it('min-heap insert ends with a valid min-heap of the same values', () => {
    for (const input of [
      defaultInput('heapinsert'),
      arr([1]),
      arr([5, 4, 3, 2, 1]),
      arr([2, 2, 1, 1]),
      ...randoms('heapinsert'),
    ]) {
      const a = (input as { a: number[] }).a;
      const h = last(run<ArrayState>('heapinsert', input)).st.a as number[];
      expect([...h].sort((x, y) => x - y)).toEqual([...a].sort((x, y) => x - y));
      h.forEach((v, i) => i > 0 && expect(h[(i - 1) >> 1]).toBeLessThanOrEqual(v));
    }
  });
});

/* ---------- Graphs ---------- */

const NODES = G1.nodes.map((n) => n.id);

describe('graphs', () => {
  const A = adj(G1);
  it('BFS visits in breadth-first order from every start node', () => {
    for (const s of NODES) {
      const seen = new Set([s]);
      const q = [s];
      const expected: string[] = [];
      while (q.length) {
        const u = q.shift() as string;
        expected.push(u);
        for (const [v] of A[u])
          if (!seen.has(v)) {
            seen.add(v);
            q.push(v);
          }
      }
      expect(last(run<GraphState>('bfs', { type: 'node', s })).st.out).toEqual(expected);
    }
  });

  it('DFS visits in depth-first order from every start node', () => {
    for (const s of NODES) {
      const seen = new Set<string>();
      const expected: string[] = [];
      const go = (u: string) => {
        seen.add(u);
        expected.push(u);
        for (const [v] of A[u]) if (!seen.has(v)) go(v);
      };
      go(s);
      expect(last(run<GraphState>('dfs', { type: 'node', s })).st.out).toEqual(expected);
    }
  });

  it('Dijkstra distances match Bellman–Ford from every start node', () => {
    for (const s of NODES) {
      const D: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, Infinity]));
      D[s] = 0;
      for (let k = 0; k < NODES.length; k++)
        for (const [u, v, w] of G1.edges) {
          D[v] = Math.min(D[v], D[u] + (w as number));
          D[u] = Math.min(D[u], D[v] + (w as number));
        }
      expect(last(run<GraphState>('dijkstra', { type: 'node', s })).st.lab).toEqual(D);
    }
  });

  it('topological sort returns a valid order of every node', () => {
    const out = last(run<GraphState>('topo', { type: 'none' })).st.out;
    expect([...out].sort()).toEqual(G2.nodes.map((n) => n.id).sort());
    for (const [u, v] of G2.edges) expect(out.indexOf(u)).toBeLessThan(out.indexOf(v));
  });
});

/* ---------- Grid pathfinding ---------- */

describe('grid pathfinding', () => {
  const refDist = (g: ReturnType<typeof defaultGrid>) => {
    const W = new Set(g.walls);
    const start = g.start[0] * g.C + g.start[1];
    const end = g.end[0] * g.C + g.end[1];
    const dist = new Map([[start, 0]]);
    const q = [start];
    while (q.length) {
      const u = q.shift() as number;
      const r = Math.floor(u / g.C);
      const c = u % g.C;
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nr = r + dr;
        const nc = c + dc;
        const v = nr * g.C + nc;
        if (nr < 0 || nc < 0 || nr >= g.R || nc >= g.C || W.has(v) || dist.has(v)) continue;
        dist.set(v, (dist.get(u) as number) + 1);
        q.push(v);
      }
    }
    return dist.get(end) ?? -1;
  };

  it('BFS and A* both find a shortest path (or none) on the default and 40 random mazes', () => {
    const grids = [defaultGrid(), ...Array.from({ length: 40 }, () => randomMaze(rng))];
    const blocked = defaultGrid();
    const at = (r: number, c: number) => r * blocked.C + c;
    blocked.walls = [at(5, 2), at(7, 2), at(6, 1), at(6, 3)]; // start (6, 2) is boxed in
    expect(refDist(blocked)).toBe(-1);
    grids.push(blocked);
    for (const grid of grids) {
      const expected = refDist(grid);
      for (const id of ['gridbfs', 'astar']) {
        const end = last(run<GridState>(id, { type: 'grid', grid })).st;
        expect(end.path.length - 1, id).toBe(expected);
        for (let i = 1; i < end.path.length; i++) {
          const a = end.path[i - 1];
          const b = end.path[i];
          const step =
            Math.abs(Math.floor(a / grid.C) - Math.floor(b / grid.C)) +
            Math.abs((a % grid.C) - (b % grid.C));
          expect(step).toBe(1);
          expect(grid.walls.includes(b)).toBe(false);
        }
      }
    }
  });
});

/* ---------- DP and backtracking ---------- */

describe('dynamic programming', () => {
  it('Fibonacci values are right for every n', () => {
    const F = [0, 1];
    for (let i = 2; i <= 20; i++) F.push(F[i - 1] + F[i - 2]);
    for (let n = 2; n <= 20; n++) {
      const st = last(run<Dp1State>('fib', { type: 'n', n, lo: 2, hi: 20 })).st;
      expect(st.vals).toEqual(F.slice(0, n + 1));
    }
  });

  it('coin change matches a reference DP, including impossible amounts', () => {
    const cases: Input[] = [
      defaultInput('coins'),
      { type: 'coins', amt: 3, coins: [2] },
      { type: 'coins', amt: 30, coins: [7, 11] },
      { type: 'coins', amt: 1, coins: [1] },
      ...randoms('coins'),
    ];
    for (const input of cases) {
      const { amt, coins } = input as { amt: number; coins: number[] };
      const best = Array<number>(amt + 1).fill(Infinity);
      best[0] = 0;
      for (let x = 1; x <= amt; x++)
        for (const c of coins) if (c <= x) best[x] = Math.min(best[x], best[x - c] + 1);
      const v = last(run<Dp1State>('coins', input)).st.vals[amt];
      expect(v).toBe(best[amt] === Infinity ? '∞' : best[amt]);
    }
  });

  it('LCS length and string are right', () => {
    const isSub = (s: string, t: string) => {
      let i = 0;
      for (const ch of t) if (ch === s[i]) i++;
      return i === s.length;
    };
    const cases: Input[] = [
      defaultInput('lcs'),
      { type: 'two', s1: 'A', s2: 'B' },
      { type: 'two', s1: 'SAME', s2: 'SAME' },
      ...randoms('lcs'),
    ];
    for (const input of cases) {
      const { s1, s2 } = input as { s1: string; s2: string };
      const L = Array.from({ length: s1.length + 1 }, () => Array<number>(s2.length + 1).fill(0));
      for (let i = 1; i <= s1.length; i++)
        for (let j = 1; j <= s2.length; j++)
          L[i][j] =
            s1[i - 1] === s2[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
      const st = last(run<Dp2State>('lcs', input)).st;
      expect(st.t[s1.length][s2.length]).toBe(L[s1.length][s2.length]);
      const got = st.vars?.lcs === '—' ? '' : String(st.vars?.lcs);
      expect(got.length).toBe(L[s1.length][s2.length]);
      expect(isSub(got, s1) && isSub(got, s2)).toBe(true);
    }
  });

  it('0/1 knapsack equals the brute-force optimum', () => {
    const cases: Input[] = [
      defaultInput('knap'),
      { type: 'knap', items: [[13, 99]], cap: 12 },
      {
        type: 'knap',
        items: [
          [1, 1],
          [1, 1],
          [1, 1],
          [1, 1],
          [1, 1],
          [1, 1],
        ],
        cap: 4,
      },
      ...randoms('knap'),
    ];
    for (const input of cases) {
      const { items, cap } = input as { items: [number, number][]; cap: number };
      let best = 0;
      for (let mask = 0; mask < 1 << items.length; mask++) {
        let w = 0;
        let v = 0;
        items.forEach(([iw, iv], i) => {
          if (mask & (1 << i)) {
            w += iw;
            v += iv;
          }
        });
        if (w <= cap) best = Math.max(best, v);
      }
      const st = last(run<Dp2State>('knap', input)).st;
      expect(st.t[items.length][cap]).toBe(best);
    }
  });
});

describe('backtracking and recursion', () => {
  it('N-Queens places n non-attacking queens for n = 4…8', () => {
    for (let n = 4; n <= 8; n++) {
      const end = last(run<BoardState>('nqueens', { type: 'n', n, lo: 4, hi: 8 }));
      expect(end.hl.solved).toBe(true);
      const q = end.st.q;
      expect(q.every((c) => c >= 0 && c < n)).toBe(true);
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          expect(q[i]).not.toBe(q[j]);
          expect(Math.abs(q[i] - q[j])).not.toBe(j - i);
        }
    }
  });

  it('all subsets: 2^n distinct subsets', () => {
    for (const a of [[1], [1, 2], [1, 2, 3], [4, 5, 6, 7], [1, 2, 3, 4, 5]]) {
      const out = last(run<SetsState>('subsets', arr(a))).st.out;
      expect(out.length).toBe(2 ** a.length);
      expect(new Set(out).size).toBe(out.length);
    }
  });

  it('Tower of Hanoi: 2^n − 1 legal moves, all disks end on C', () => {
    for (let n = 2; n <= 6; n++) {
      const steps = run<HanoiState>('hanoi', { type: 'n', n, lo: 2, hi: 6 });
      const end = last(steps).st;
      expect(end.vars.moves).toBe(2 ** n - 1);
      expect(end.pegs[2]).toEqual(Array.from({ length: n }, (_, k) => n - k));
      for (const s of steps)
        for (const peg of s.st.pegs)
          peg.forEach((d, i) => i > 0 && expect(d).toBeLessThan(peg[i - 1]));
    }
  });
});
