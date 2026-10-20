import type { Counters, Highlights, Msg, Quiz, Step } from './types';

/**
 * Deep copy through JSON. This is deliberate: snapshots must match the golden hashes exactly,
 * including JSON's handling of `undefined` (dropped) and non-finite numbers (become null).
 */
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

/** Records steps. `add` snapshots the state, so later mutation cannot change earlier steps. */
export class Rec<S> {
  steps: Step<S>[] = [];
  c: Counters = { cmp: 0, swp: 0 };

  add(
    st: S,
    hl: Highlights | null | undefined,
    ln: number | null | undefined,
    m: Msg,
    ask?: Quiz | null,
  ): void {
    this.steps.push({
      st: clone(st),
      hl: hl || {},
      ln: ln ?? null,
      m,
      ask: ask || null,
      c: { ...this.c },
    });
  }
}
