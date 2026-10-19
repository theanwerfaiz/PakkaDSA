import type { Step } from './types';

/**
 * Gives each item of an array state (`st.a`) a stable id across steps, so a renderer can key
 * elements and let them glide. Unchanged positions keep their id; others take the id of the nearest
 * unused previous position with the same value; anything left gets a fresh id. Mutates the steps.
 */
export function assignIds(steps: Step[]): void {
  let prev: { vals: unknown[]; ids: number[] } | null = null;
  let next = 0;
  for (const s of steps) {
    const st = s.st as { a?: unknown; ids?: number[] } | null;
    const a = st && st.a;
    if (!st || !Array.isArray(a)) continue;
    const n = a.length;
    if (!prev) {
      const ids = a.map((_, i) => i);
      next = n;
      st.ids = ids;
      prev = { vals: [...a], ids };
      continue;
    }
    const ids: number[] = Array(n).fill(-1);
    const used = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (i < prev.vals.length && a[i] === prev.vals[i]) {
        ids[i] = prev.ids[i];
        used.add(i);
      }
    }
    for (let i = 0; i < n; i++) {
      if (ids[i] !== -1) continue;
      let best = -1;
      let bd = 1e9;
      for (let j = 0; j < prev.vals.length; j++) {
        if (used.has(j) || prev.vals[j] !== a[i]) continue;
        const d = Math.abs(j - i);
        if (d < bd) {
          bd = d;
          best = j;
        }
      }
      if (best >= 0) {
        ids[i] = prev.ids[best];
        used.add(best);
      } else ids[i] = next++;
    }
    st.ids = ids;
    prev = { vals: [...a], ids };
  }
}
