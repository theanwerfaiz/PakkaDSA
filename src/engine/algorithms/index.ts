import type { AnyGenerator } from '../types';
import { bubble } from './bubble';
import { fib } from './fib';
import { coins } from './coins';
import { lcs } from './lcs';
import { knap } from './knap';
import { nqueens } from './nqueens';
import { subsets } from './subsets';
import { hanoi } from './hanoi';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { dijkstra } from './dijkstra';
import { topo } from './topo';
import { gridbfs } from './gridbfs';
import { astar } from './astar';
import { bstbuild } from './bstbuild';
import { bstsearch } from './bstsearch';
import { inorder } from './inorder';
import { preorder } from './preorder';
import { postorder } from './postorder';
import { levelorder } from './levelorder';
import { heapinsert } from './heapinsert';
import { parens } from './parens';
import { nextgreater } from './nextgreater';
import { reverselist } from './reverselist';
import { middlelist } from './middlelist';
import { cyclelist } from './cyclelist';
import { linear } from './linear';
import { binary } from './binary';
import { pairsum } from './pairsum';
import { water } from './water';
import { maxsumk } from './maxsumk';
import { longestuniq } from './longestuniq';
import { kadane } from './kadane';
import { heapsort } from './heapsort';
import { insertion } from './insertion';
import { merge } from './merge';
import { quick } from './quick';
import { selection } from './selection';

/** Every generator by id, loaded eagerly. Used by tests and build-time pages; the browser app uses `registry.ts`. */
export const GENERATORS: Record<string, AnyGenerator> = {
  bubble,
  selection,
  insertion,
  merge,
  quick,
  heapsort,
  linear,
  binary,
  pairsum,
  water,
  maxsumk,
  longestuniq,
  kadane,
  parens,
  nextgreater,
  reverselist,
  middlelist,
  cyclelist,
  bstbuild,
  bstsearch,
  inorder,
  preorder,
  postorder,
  levelorder,
  heapinsert,
  bfs,
  dfs,
  dijkstra,
  topo,
  gridbfs,
  astar,
  fib,
  coins,
  lcs,
  knap,
  nqueens,
  subsets,
  hanoi,
};
