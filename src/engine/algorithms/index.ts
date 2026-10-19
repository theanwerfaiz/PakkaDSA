import type { Generator, Input } from '../types';
import { bubble } from './bubble';
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

/** Every generator by algorithm id. Prefer `registry.ts`, which loads them lazily. */
// Each generator accepts one member of the Input union; the registry pairs ids with matching inputs.
export const GENERATORS: Record<string, Generator<never>> = {
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
};

export type AnyGenerator = (input: Input) => ReturnType<Generator>;
