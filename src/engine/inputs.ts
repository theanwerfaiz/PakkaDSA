import en from '../content/i18n/en.json';
import hi from '../content/i18n/hi.json';
import { M } from './messages';
import type { Graph, Grid, Input, Msg, Pair, ViewType } from './types';

/* ---------- Fixed data ---------- */

const ARR8 = [38, 27, 43, 3, 9, 82, 10, 55];
const TREEV = [50, 30, 70, 20, 40, 60, 80, 35, 65];

/** The default 13 × 25 pathfinding grid. Walls are cell indexes (row * C + col). */
export function defaultGrid(): Grid {
  const R = 13;
  const C = 25;
  const walls: number[] = [];
  for (let r = 1; r < 12; r++) if (r !== 3) walls.push(r * C + 12);
  for (let c = 4; c < 10; c++) walls.push(9 * C + c);
  for (let r = 2; r < 8; r++) walls.push(r * C + 18);
  return { R, C, walls, start: [6, 2], end: [6, 22] };
}

/** G1: 8 nodes, weighted, undirected. Used by BFS, DFS and Dijkstra. */
export const G1: Graph = {
  nodes: [
    { id: 'A', x: 90, y: 180 },
    { id: 'B', x: 230, y: 70 },
    { id: 'C', x: 230, y: 290 },
    { id: 'D', x: 400, y: 180 },
    { id: 'E', x: 560, y: 70 },
    { id: 'F', x: 560, y: 290 },
    { id: 'G', x: 720, y: 180 },
    { id: 'H', x: 400, y: 330 },
  ],
  edges: [
    ['A', 'B', 4],
    ['A', 'C', 2],
    ['B', 'D', 5],
    ['C', 'D', 8],
    ['C', 'H', 3],
    ['B', 'E', 10],
    ['D', 'E', 2],
    ['D', 'F', 6],
    ['H', 'F', 7],
    ['E', 'G', 3],
    ['F', 'G', 1],
  ],
};

/** G2: 7 nodes, directed. Used by topological sort. */
export const G2: Graph = {
  nodes: [
    { id: 'A', x: 90, y: 90 },
    { id: 'B', x: 90, y: 270 },
    { id: 'C', x: 280, y: 180 },
    { id: 'D', x: 450, y: 80 },
    { id: 'E', x: 450, y: 280 },
    { id: 'F', x: 620, y: 180 },
    { id: 'G', x: 770, y: 180 },
  ],
  edges: [
    ['A', 'C'],
    ['B', 'C'],
    ['C', 'D'],
    ['C', 'E'],
    ['D', 'F'],
    ['E', 'F'],
    ['F', 'G'],
    ['B', 'E'],
  ],
  directed: true,
};

/** Default input per algorithm. The grid algorithms get `defaultGrid()` filled in by `defaultInput`. */
const DEFAULTS: Record<string, Input | { type: 'grid' }> = {
  bubble: { type: 'arr', a: ARR8 },
  selection: { type: 'arr', a: ARR8 },
  insertion: { type: 'arr', a: ARR8 },
  merge: { type: 'arr', a: ARR8 },
  quick: { type: 'arr', a: ARR8 },
  heapsort: { type: 'arr', a: ARR8 },
  linear: { type: 'arrt', a: [12, 45, 7, 23, 56, 89, 34], t: 56 },
  binary: { type: 'arrt', a: [3, 8, 15, 21, 27, 34, 42, 56, 63, 77], t: 42 },
  pairsum: { type: 'arrt', a: [2, 4, 7, 11, 15, 18, 21], t: 22 },
  water: { type: 'arr', a: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
  maxsumk: { type: 'arrk', a: [2, 1, 5, 1, 3, 2, 9, 1, 4], k: 3 },
  longestuniq: { type: 'str', s: 'abcabcbbpq' },
  kadane: { type: 'arr', a: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
  parens: { type: 'str', s: '{[()()]}' },
  nextgreater: { type: 'arr', a: [4, 5, 2, 25, 7, 8, 1] },
  reverselist: { type: 'arr', a: [1, 2, 3, 4, 5] },
  middlelist: { type: 'arr', a: [1, 2, 3, 4, 5, 6, 7] },
  cyclelist: { type: 'arrc', a: [3, 7, 1, 9, 4, 6], c: 2 },
  bstbuild: { type: 'arr', a: TREEV },
  bstsearch: { type: 'arrt', a: TREEV, t: 65 },
  inorder: { type: 'arr', a: TREEV },
  preorder: { type: 'arr', a: TREEV },
  postorder: { type: 'arr', a: TREEV },
  levelorder: { type: 'arr', a: TREEV },
  heapinsert: { type: 'arr', a: [9, 4, 7, 1, 8, 2, 6] },
  bfs: { type: 'node', s: 'A' },
  dfs: { type: 'node', s: 'A' },
  dijkstra: { type: 'node', s: 'A' },
  topo: { type: 'none' },
  gridbfs: { type: 'grid' },
  astar: { type: 'grid' },
  fib: { type: 'n', n: 12, lo: 2, hi: 20 },
  coins: { type: 'coins', amt: 11, coins: [1, 2, 5] },
  lcs: { type: 'two', s1: 'ABCBDAB', s2: 'BDCABA' },
  knap: {
    type: 'knap',
    items: [
      [1, 1],
      [3, 4],
      [4, 5],
      [5, 7],
    ],
    cap: 7,
  },
  nqueens: { type: 'n', n: 5, lo: 4, hi: 8 },
  subsets: { type: 'arr', a: [1, 2, 3] },
  hanoi: { type: 'n', n: 3, lo: 2, hi: 6 },
};

/** A fresh copy of the default input for an algorithm. */
export function defaultInput(id: string): Input {
  const d = DEFAULTS[id];
  if (!d) throw new Error(`Unknown algorithm: ${id}`);
  const i = JSON.parse(JSON.stringify(d)) as Input;
  if (i.type === 'grid') i.grid = defaultGrid();
  return i;
}

/* ---------- Validation ---------- */

/** How many array items each view can draw. */
export const ARRAY_LIMITS: Partial<Record<ViewType, Pair>> = {
  bars: [2, 16],
  cells: [2, 14],
  stack: [2, 10],
  list: [2, 8],
  tree: [1, 12],
  heap: [1, 12],
  sets: [1, 5],
};
const DEFAULT_LIMIT: Pair = [1, 14];

/** A dictionary message in both languages, with {placeholders} filled in. */
const msg = (key: keyof typeof en, params: Record<string, number> = {}): Msg => {
  const fill = (text: string) => text.replace(/\{(\w+)\}/g, (_, p: string) => String(params[p]));
  return M(fill(en[key]), fill(hi[key]));
};

export const ERR = {
  nums: msg('err.nums'),
  count: (lo: number, hi: number) => msg('err.count', { lo, hi }),
  range: msg('err.range'),
  negWall: msg('err.negWall'),
  target: msg('err.target'),
  k: (n: number) => msg('err.k', { n }),
  cycle: (n: number) => msg('err.cycle', { max: n - 1 }),
  str: msg('err.str'),
  parens: msg('err.parens'),
  n: (lo: number, hi: number) => msg('err.n', { lo, hi }),
  amt: msg('err.amt'),
  coins: msg('err.coins'),
  two: msg('err.two'),
  items: msg('err.items'),
  cap: msg('err.cap'),
  node: msg('err.node'),
};

/** Parses "5, 3 8" into whole numbers; null if anything is not a whole number. */
export function parseNums(s: string): number[] | null {
  const p = s
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  return p.some((x) => !Number.isFinite(x) || !Number.isInteger(x)) ? null : p;
}

/** Raw text from the input form, keyed by field: a, t, k, c, s, n, amt, coins, s1, s2, items, cap. */
export type InputFields = Partial<Record<string, string>>;

export type ValidationResult = { ok: true; input: Input } | { ok: false; error: Msg };

/**
 * Builds a new input from form text, starting from the current input of the same algorithm.
 * Never throws; returns a bilingual error for anything outside the limits.
 */
export function validateInput(
  id: string,
  view: ViewType,
  current: Input,
  fields: InputFields,
): ValidationResult {
  const i = JSON.parse(JSON.stringify(current)) as Input;
  const v = (k: string) => (fields[k] ?? '').trim();
  const fail = (error: Msg): ValidationResult => ({ ok: false, error });
  const lim = ARRAY_LIMITS[view] ?? DEFAULT_LIMIT;

  if ('a' in i) {
    const p = parseNums(v('a'));
    if (!p) return fail(ERR.nums);
    if (p.length < lim[0] || p.length > lim[1]) return fail(ERR.count(lim[0], lim[1]));
    if (p.some((x) => Math.abs(x) > 999)) return fail(ERR.range);
    if (id === 'water' && p.some((x) => x < 0)) return fail(ERR.negWall);
    i.a = p;
  }
  if (i.type === 'arrt') {
    const t = Number(v('t'));
    if (!Number.isInteger(t)) return fail(ERR.target);
    i.t = t;
  }
  if (i.type === 'arrk') {
    const k = Number(v('k'));
    if (!Number.isInteger(k) || k < 1 || k > i.a.length) return fail(ERR.k(i.a.length));
    i.k = k;
  }
  if (i.type === 'arrc') {
    const c = Number(v('c'));
    if (!Number.isInteger(c) || c < -1 || c >= i.a.length) return fail(ERR.cycle(i.a.length));
    i.c = c;
  }
  if (i.type === 'str') {
    const s = v('s');
    if (!s || s.length > 14) return fail(ERR.str);
    if (id === 'parens' && /[^()[\]{}]/.test(s)) return fail(ERR.parens);
    i.s = s;
  }
  if (i.type === 'node') {
    const s = v('s');
    if (!G1.nodes.some((n) => n.id === s)) return fail(ERR.node);
    i.s = s;
  }
  if (i.type === 'n') {
    const n = Number(v('n'));
    if (!Number.isInteger(n) || n < i.lo || n > i.hi) return fail(ERR.n(i.lo, i.hi));
    i.n = n;
  }
  if (i.type === 'coins') {
    const amt = Number(v('amt'));
    const c = parseNums(v('coins'));
    if (!Number.isInteger(amt) || amt < 1 || amt > 30) return fail(ERR.amt);
    if (!c || !c.length || c.some((x) => x < 1 || x > 30)) return fail(ERR.coins);
    i.amt = amt;
    i.coins = [...new Set(c)].sort((x, y) => x - y);
  }
  if (i.type === 'two') {
    const s1 = v('s1').toUpperCase();
    const s2 = v('s2').toUpperCase();
    if (!s1 || !s2 || s1.length > 10 || s2.length > 10) return fail(ERR.two);
    i.s1 = s1;
    i.s2 = s2;
  }
  if (i.type === 'knap') {
    const it = v('items')
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((x) => x.split(':').map(Number));
    const cap = Number(v('cap'));
    if (
      !it.length ||
      it.length > 6 ||
      it.some((x) => x.length !== 2 || !x.every((y) => Number.isInteger(y) && y > 0 && y < 100))
    )
      return fail(ERR.items);
    if (!Number.isInteger(cap) || cap < 1 || cap > 12) return fail(ERR.cap);
    i.items = it as Pair[];
    i.cap = cap;
  }
  return { ok: true, input: i };
}

/* ---------- Random inputs (the only randomness; the caller supplies the random source) ---------- */

/** Returns a float in [0, 1), like Math.random. The UI passes Math.random; tests pass a seeded RNG. */
export type Rng = () => number;

export function randomMaze(rng: Rng): Grid {
  const g = defaultGrid();
  g.walls = [];
  for (let r = 0; r < g.R; r++)
    for (let c = 0; c < g.C; c++) {
      if ((r === g.start[0] && c === g.start[1]) || (r === g.end[0] && c === g.end[1])) continue;
      if (rng() < 0.27) g.walls.push(r * g.C + c);
    }
  return g;
}

/** A random valid input for an algorithm, based on its current input. */
export function randomInput(id: string, view: ViewType, current: Input, rng: Rng): Input {
  const rnd = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
  const uniq = (cnt: number, lo: number, hi: number) => {
    const s = new Set<number>();
    while (s.size < cnt) s.add(rnd(lo, hi));
    return [...s];
  };
  const i = JSON.parse(JSON.stringify(current)) as Input;
  const n = view === 'bars' ? rnd(7, 12) : view === 'list' ? rnd(4, 7) : rnd(6, 10);
  switch (i.type) {
    case 'arr':
      i.a =
        id === 'kadane'
          ? Array.from({ length: n }, () => rnd(-9, 9))
          : id === 'subsets'
            ? uniq(rnd(2, 4), 1, 9)
            : view === 'tree'
              ? uniq(n, 10, 99)
              : Array.from({ length: n }, () =>
                  rnd(id === 'water' ? 1 : 2, id === 'water' ? 9 : 95),
                );
      break;
    case 'arrt':
      i.a = view === 'tree' ? uniq(n, 10, 99) : uniq(n, 1, 60);
      if (id === 'pairsum' || id === 'binary') i.a.sort((x, y) => x - y);
      i.t =
        id === 'pairsum'
          ? i.a[rnd(0, 2)] + i.a[rnd(i.a.length - 3, i.a.length - 1)]
          : i.a[rnd(0, i.a.length - 1)];
      break;
    case 'arrk':
      i.a = Array.from({ length: rnd(7, 11) }, () => rnd(1, 9));
      i.k = rnd(2, 4);
      break;
    case 'arrc':
      i.a = uniq(rnd(4, 7), 1, 9);
      i.c = rnd(-1, i.a.length - 2);
      break;
    case 'str':
      i.s =
        id === 'parens'
          ? ['{[()()]}', '([)]', '(()[{}])', '{[}', '((()))[]', '[(])'][rnd(0, 5)]
          : Array.from({ length: rnd(7, 11) }, () => 'abcdpqk'[rnd(0, 6)]).join('');
      break;
    case 'node':
      i.s = 'ABCDEFGH'[rnd(0, 7)];
      break;
    case 'n':
      i.n = rnd(i.lo, i.hi);
      break;
    case 'coins':
      i.coins = [
        [1, 2, 5],
        [1, 3, 4],
        [1, 5, 10],
        [2, 3, 7],
      ][rnd(0, 3)];
      i.amt = rnd(6, 18);
      break;
    case 'two': {
      const w = ['ABCBDAB', 'BDCABA', 'AGGTAB', 'GXTXAYB', 'PAKKA', 'KAPPA', 'DYNAMIC', 'PYTHON'];
      i.s1 = w[rnd(0, 7)];
      i.s2 = w[rnd(0, 7)];
      break;
    }
    case 'knap':
      i.items = Array.from({ length: rnd(3, 5) }, (): Pair => [rnd(1, 5), rnd(1, 9)]);
      i.cap = rnd(5, 10);
      break;
    case 'grid':
      i.grid = randomMaze(rng);
      break;
    case 'none':
      break;
  }
  return i;
}

/* ---------- Inputs from share links ---------- */

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);

/** Checks a grid from outside: fixed 13 × 25, cells in range, start and goal open and distinct. */
function validGrid(g: unknown): Grid | null {
  if (!g || typeof g !== 'object') return null;
  const d = defaultGrid();
  const { R, C, walls, start, end } = g as Record<string, unknown>;
  if (
    R !== d.R ||
    C !== d.C ||
    !Array.isArray(walls) ||
    !Array.isArray(start) ||
    !Array.isArray(end)
  )
    return null;
  const cell = (p: unknown[]): p is Pair =>
    p.length === 2 &&
    isInt(p[0]) &&
    isInt(p[1]) &&
    p[0] >= 0 &&
    p[0] < d.R &&
    p[1] >= 0 &&
    p[1] < d.C;
  if (!cell(start) || !cell(end) || (start[0] === end[0] && start[1] === end[1])) return null;
  if (walls.length > d.R * d.C || !walls.every((k) => isInt(k) && k >= 0 && k < d.R * d.C))
    return null;
  const w = [...new Set(walls as number[])];
  if (w.includes(start[0] * d.C + start[1]) || w.includes(end[0] * d.C + end[1])) return null;
  return { R: d.R, C: d.C, walls: w, start: [start[0], start[1]], end: [end[0], end[1]] };
}

/**
 * Turns untrusted data (a share link) into a valid input for this algorithm, or null. The data must
 * have the algorithm's input type and pass exactly the same checks as the input form.
 */
export function inputFromData(id: string, view: ViewType, raw: unknown): Input | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const base = defaultInput(id);
  if (o.type !== base.type) return null;
  const s = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '');
  const list = (v: unknown) => (Array.isArray(v) ? v.map(s).join(', ') : '');
  let fields: InputFields;
  switch (base.type) {
    case 'grid': {
      const grid = validGrid(o.grid);
      return grid ? { type: 'grid', grid } : null;
    }
    case 'none':
      return base;
    case 'knap':
      fields = {
        items: Array.isArray(o.items)
          ? o.items.map((x) => (Array.isArray(x) ? x.map(s).join(':') : '')).join(', ')
          : '',
        cap: s(o.cap),
      };
      break;
    case 'coins':
      fields = { amt: s(o.amt), coins: list(o.coins) };
      break;
    default:
      fields = {
        a: list(o.a),
        t: s(o.t),
        k: s(o.k),
        c: s(o.c),
        s: s(o.s),
        n: s(o.n),
        s1: s(o.s1),
        s2: s(o.s2),
      };
  }
  const res = validateInput(id, view, base, fields);
  return res.ok ? res.input : null;
}
