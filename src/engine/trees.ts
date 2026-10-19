import type { TreeState } from './types';

/** Inserts v into a BST stored as a node array; returns the path of node indexes walked. */
export function bstInsert(t: Pick<TreeState, 'n' | 'root'>, v: number): number[] {
  const id = t.n.length;
  t.n.push({ v, l: -1, r: -1 });
  if (t.root === -1) {
    t.root = id;
    return [];
  }
  let c = t.root;
  const path: number[] = [];
  while (true) {
    path.push(c);
    if (v < t.n[c].v) {
      if (t.n[c].l === -1) {
        t.n[c].l = id;
        break;
      }
      c = t.n[c].l;
    } else {
      if (t.n[c].r === -1) {
        t.n[c].r = id;
        break;
      }
      c = t.n[c].r;
    }
  }
  return path;
}

export function buildBST(vals: number[]): Pick<TreeState, 'n' | 'root'> {
  const t: Pick<TreeState, 'n' | 'root'> = { n: [], root: -1 };
  vals.forEach((v) => bstInsert(t, v));
  return t;
}
