import type { Highlights, ViewType } from '../engine/types';
import { rBars } from './bars';
import { rBoard } from './board';
import { rCells } from './cells';
import { rDP1, rDP2 } from './dp';
import { rGraph } from './graph';
import { rGrid } from './grid';
import { rHanoi } from './hanoi';
import { rHeap } from './heap';
import { rList } from './list';
import { rSets } from './sets';
import { rStack } from './stack';
import { rTree } from './tree';

export { NARROW, WIDE, isNarrow } from './common';
export { gridGeometry, type GridGeometry } from './grid';

// Each renderer takes the state shape of its own view; `render` pairs them by view type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see the comment above.
type Renderer = (st: any, hl: Highlights, W: number) => string;

export const RENDERERS: Record<ViewType, Renderer> = {
  bars: rBars,
  cells: rCells,
  stack: rStack,
  list: rList,
  tree: rTree,
  heap: rHeap,
  graph: rGraph,
  grid: rGrid,
  dp1: rDP1,
  dp2: rDP2,
  board: rBoard,
  hanoi: rHanoi,
  sets: rSets,
};

/** Draws one step of an algorithm as an SVG string, at drawing width W (860 or 420). */
export const render = (view: ViewType, st: unknown, hl: Highlights, W: number): string =>
  RENDERERS[view](st, hl, W);
