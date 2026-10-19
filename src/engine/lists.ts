import type { ListState } from './types';

/** A singly linked list as parallel arrays: values and the index of each node's next (-1 = null). */
export function mkList(v: number[]): ListState {
  return { v: [...v], next: v.map((_, i) => (i < v.length - 1 ? i + 1 : -1)) };
}
