import { assignIds } from './ids';
import { clone } from './recorder';
import type { AnyGenerator, Input, InputType, Step, ViewType } from './types';

export interface AlgorithmEntry {
  view: ViewType;
  inputType: InputType;
  /** Loads the generator lazily, so each one is its own chunk in the browser build. */
  load: () => Promise<AnyGenerator>;
}

/** Every algorithm by id, in catalog order. */
export const REGISTRY: Record<string, AlgorithmEntry> = {
  bubble: {
    view: 'bars',
    inputType: 'arr',
    load: () => import('./algorithms/bubble').then((m) => m.bubble as AnyGenerator),
  },
  selection: {
    view: 'bars',
    inputType: 'arr',
    load: () => import('./algorithms/selection').then((m) => m.selection as AnyGenerator),
  },
  insertion: {
    view: 'bars',
    inputType: 'arr',
    load: () => import('./algorithms/insertion').then((m) => m.insertion as AnyGenerator),
  },
  merge: {
    view: 'bars',
    inputType: 'arr',
    load: () => import('./algorithms/merge').then((m) => m.merge as AnyGenerator),
  },
  quick: {
    view: 'bars',
    inputType: 'arr',
    load: () => import('./algorithms/quick').then((m) => m.quick as AnyGenerator),
  },
  heapsort: {
    view: 'heap',
    inputType: 'arr',
    load: () => import('./algorithms/heapsort').then((m) => m.heapsort as AnyGenerator),
  },
  linear: {
    view: 'cells',
    inputType: 'arrt',
    load: () => import('./algorithms/linear').then((m) => m.linear as AnyGenerator),
  },
  binary: {
    view: 'cells',
    inputType: 'arrt',
    load: () => import('./algorithms/binary').then((m) => m.binary as AnyGenerator),
  },
  pairsum: {
    view: 'cells',
    inputType: 'arrt',
    load: () => import('./algorithms/pairsum').then((m) => m.pairsum as AnyGenerator),
  },
  water: {
    view: 'bars',
    inputType: 'arr',
    load: () => import('./algorithms/water').then((m) => m.water as AnyGenerator),
  },
  maxsumk: {
    view: 'cells',
    inputType: 'arrk',
    load: () => import('./algorithms/maxsumk').then((m) => m.maxsumk as AnyGenerator),
  },
  longestuniq: {
    view: 'cells',
    inputType: 'str',
    load: () => import('./algorithms/longestuniq').then((m) => m.longestuniq as AnyGenerator),
  },
  kadane: {
    view: 'cells',
    inputType: 'arr',
    load: () => import('./algorithms/kadane').then((m) => m.kadane as AnyGenerator),
  },
  parens: {
    view: 'stack',
    inputType: 'str',
    load: () => import('./algorithms/parens').then((m) => m.parens as AnyGenerator),
  },
  nextgreater: {
    view: 'stack',
    inputType: 'arr',
    load: () => import('./algorithms/nextgreater').then((m) => m.nextgreater as AnyGenerator),
  },
  reverselist: {
    view: 'list',
    inputType: 'arr',
    load: () => import('./algorithms/reverselist').then((m) => m.reverselist as AnyGenerator),
  },
  middlelist: {
    view: 'list',
    inputType: 'arr',
    load: () => import('./algorithms/middlelist').then((m) => m.middlelist as AnyGenerator),
  },
  cyclelist: {
    view: 'list',
    inputType: 'arrc',
    load: () => import('./algorithms/cyclelist').then((m) => m.cyclelist as AnyGenerator),
  },
  bstbuild: {
    view: 'tree',
    inputType: 'arr',
    load: () => import('./algorithms/bstbuild').then((m) => m.bstbuild as AnyGenerator),
  },
  bstsearch: {
    view: 'tree',
    inputType: 'arrt',
    load: () => import('./algorithms/bstsearch').then((m) => m.bstsearch as AnyGenerator),
  },
  inorder: {
    view: 'tree',
    inputType: 'arr',
    load: () => import('./algorithms/inorder').then((m) => m.inorder as AnyGenerator),
  },
  preorder: {
    view: 'tree',
    inputType: 'arr',
    load: () => import('./algorithms/preorder').then((m) => m.preorder as AnyGenerator),
  },
  postorder: {
    view: 'tree',
    inputType: 'arr',
    load: () => import('./algorithms/postorder').then((m) => m.postorder as AnyGenerator),
  },
  levelorder: {
    view: 'tree',
    inputType: 'arr',
    load: () => import('./algorithms/levelorder').then((m) => m.levelorder as AnyGenerator),
  },
  heapinsert: {
    view: 'heap',
    inputType: 'arr',
    load: () => import('./algorithms/heapinsert').then((m) => m.heapinsert as AnyGenerator),
  },
  bfs: {
    view: 'graph',
    inputType: 'node',
    load: () => import('./algorithms/bfs').then((m) => m.bfs as AnyGenerator),
  },
  dfs: {
    view: 'graph',
    inputType: 'node',
    load: () => import('./algorithms/dfs').then((m) => m.dfs as AnyGenerator),
  },
  dijkstra: {
    view: 'graph',
    inputType: 'node',
    load: () => import('./algorithms/dijkstra').then((m) => m.dijkstra as AnyGenerator),
  },
  topo: {
    view: 'graph',
    inputType: 'none',
    load: () => import('./algorithms/topo').then((m) => m.topo as AnyGenerator),
  },
  gridbfs: {
    view: 'grid',
    inputType: 'grid',
    load: () => import('./algorithms/gridbfs').then((m) => m.gridbfs as AnyGenerator),
  },
  astar: {
    view: 'grid',
    inputType: 'grid',
    load: () => import('./algorithms/astar').then((m) => m.astar as AnyGenerator),
  },
  fib: {
    view: 'dp1',
    inputType: 'n',
    load: () => import('./algorithms/fib').then((m) => m.fib as AnyGenerator),
  },
  coins: {
    view: 'dp1',
    inputType: 'coins',
    load: () => import('./algorithms/coins').then((m) => m.coins as AnyGenerator),
  },
  lcs: {
    view: 'dp2',
    inputType: 'two',
    load: () => import('./algorithms/lcs').then((m) => m.lcs as AnyGenerator),
  },
  knap: {
    view: 'dp2',
    inputType: 'knap',
    load: () => import('./algorithms/knap').then((m) => m.knap as AnyGenerator),
  },
  nqueens: {
    view: 'board',
    inputType: 'n',
    load: () => import('./algorithms/nqueens').then((m) => m.nqueens as AnyGenerator),
  },
  subsets: {
    view: 'sets',
    inputType: 'arr',
    load: () => import('./algorithms/subsets').then((m) => m.subsets as AnyGenerator),
  },
  hanoi: {
    view: 'hanoi',
    inputType: 'n',
    load: () => import('./algorithms/hanoi').then((m) => m.hanoi as AnyGenerator),
  },
};

export const ALGORITHM_IDS = Object.keys(REGISTRY);

/**
 * Runs an algorithm on an input: loads the generator, generates the steps from a copy of the input,
 * then adds identity ids so items can glide between steps.
 */
export async function runAlgorithm(id: string, input: Input): Promise<Step[]> {
  const entry = REGISTRY[id];
  if (!entry) throw new Error(`Unknown algorithm: ${id}`);
  const gen = await entry.load();
  const steps = gen(clone(input));
  assignIds(steps);
  return steps;
}
