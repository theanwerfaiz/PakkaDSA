import type { Generator, Input } from '../types';
import { bubble } from './bubble';
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
};

export type AnyGenerator = (input: Input) => ReturnType<Generator>;
