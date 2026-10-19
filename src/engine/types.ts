/** A message in every language the app supports. */
export interface Msg {
  en: string;
  hi: string;
}

/** A "predict the next step" question. `ans` is the index of the correct option. */
export interface Quiz {
  q: Msg;
  opts: Msg[];
  ans: number;
}

export interface Counters {
  cmp: number;
  swp: number;
}

export type Pair = [number, number];

/** What to emphasise in a step. Renderers read only the keys their view knows (see the engine spec, section 4). */
export interface Highlights {
  cmp?: number[];
  swap?: number[];
  active?: number[];
  region?: Pair;
  pivot?: number;
  ptr?: Record<string, number | undefined>;
  water?: [number, number, number];
  found?: number | number[];
  found2?: number;
  dim?: number[];
  win?: Pair;
  cur?: number | string | number[];
  push?: boolean;
  peek?: boolean;
  good?: boolean;
  bad?: boolean | Pair[];
  ans?: number;
  path?: number[];
  visited?: number[];
  edge?: [string, string] | null;
  upd?: string;
  from?: number[] | Pair[];
  try?: Pair;
  back?: Pair;
  solved?: boolean;
  at?: number;
  inc?: boolean;
  rec?: boolean;
  move?: Pair;
  disk?: number;
}

export interface Step<S = unknown> {
  /** Deep-copied snapshot of the data structure at this moment. */
  st: S;
  hl: Highlights;
  /** Index of the pseudocode line this step executes; null = none. */
  ln: number | null;
  m: Msg;
  ask: Quiz | null;
  c: Counters;
}

export type Vars = Record<string, string | number>;

/* ---------- State shapes per view ---------- */

export interface ArrayState {
  a: (number | string)[];
  sorted?: number[];
  size?: number;
  vars?: Vars;
  /** Added by assignIds after generation, never by generators. */
  ids?: number[];
}

export interface StackState {
  a: (number | string)[];
  stack: (number | string)[];
  res?: (number | string)[];
}

export interface ListState {
  v: number[];
  next: number[];
  head?: number;
}

export interface TreeNode {
  v: number;
  l: number;
  r: number;
}

export interface TreeState {
  n: TreeNode[];
  root: number;
  out: number[];
  vars?: Vars;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export type GraphEdge = [string, string, number?];

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

export interface GraphState {
  g: { nodes: GraphNode[]; edges: GraphEdge[]; directed: boolean };
  visited: string[];
  frontier: string[];
  done: string[];
  lab: Record<string, string | number>;
  vars: Vars;
  out: string[];
}

export interface Grid {
  R: number;
  C: number;
  walls: number[];
  start: Pair;
  end: Pair;
}

export interface GridState {
  grid: Grid;
  k: number;
  order: number[] | null;
  frontier: number[];
  path: number[];
  cur: number | null;
}

export interface Dp1State {
  labels: string[];
  vals: (number | string)[];
  vars?: Vars;
}

export interface Dp2State {
  rows: string[];
  cols: string[];
  t: number[][];
  base: 'rc' | 'r';
  vars?: Vars;
}

export interface BoardState {
  n: number;
  q: number[];
}

export interface SetsState {
  a: number[];
  cur: number[];
  out: string[];
}

export interface HanoiState {
  n: number;
  pegs: number[][];
  vars: { moves: number };
}

/* ---------- Inputs ---------- */

export interface ArrInput {
  type: 'arr';
  a: number[];
}
export interface ArrTargetInput {
  type: 'arrt';
  a: number[];
  t: number;
}
export interface ArrKInput {
  type: 'arrk';
  a: number[];
  k: number;
}
export interface ArrCycleInput {
  type: 'arrc';
  a: number[];
  c: number;
}
export interface StrInput {
  type: 'str';
  s: string;
}
export interface NodeInput {
  type: 'node';
  s: string;
}
export interface NoneInput {
  type: 'none';
}
export interface NInput {
  type: 'n';
  n: number;
  lo: number;
  hi: number;
}
export interface CoinsInput {
  type: 'coins';
  amt: number;
  coins: number[];
}
export interface TwoInput {
  type: 'two';
  s1: string;
  s2: string;
}
export interface KnapInput {
  type: 'knap';
  items: Pair[];
  cap: number;
}
export interface GridInput {
  type: 'grid';
  grid: Grid;
}

export type Input =
  | ArrInput
  | ArrTargetInput
  | ArrKInput
  | ArrCycleInput
  | StrInput
  | NodeInput
  | NoneInput
  | NInput
  | CoinsInput
  | TwoInput
  | KnapInput
  | GridInput;

export type InputType = Input['type'];

export type ViewType =
  | 'bars'
  | 'heap'
  | 'cells'
  | 'stack'
  | 'list'
  | 'tree'
  | 'graph'
  | 'grid'
  | 'dp1'
  | 'dp2'
  | 'board'
  | 'sets'
  | 'hanoi';

export type Generator<I extends Input = Input, S = unknown> = (input: I) => Step<S>[];
