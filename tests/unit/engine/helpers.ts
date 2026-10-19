import algorithms from '../../../src/content/algorithms.json';
import { GENERATORS } from '../../../src/engine/algorithms';
import { clone } from '../../../src/engine/recorder';
import type { Input, Step, ViewType } from '../../../src/engine/types';

export const META = Object.fromEntries(algorithms.algorithms.map((a) => [a.id, a]));
export const IDS = algorithms.algorithms.map((a) => a.id);
export const viewOf = (id: string) => META[id].view as ViewType;

/** Runs a generator synchronously on a copy of the input. */
export const run = <S = unknown>(id: string, input: Input): Step<S>[] =>
  GENERATORS[id](clone(input)) as Step<S>[];

export const last = <T>(xs: T[]): T => xs[xs.length - 1];

/** Deterministic PRNG (mulberry32) for tests only. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
