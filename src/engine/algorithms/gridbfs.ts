import type { GridInput, GridState, Step } from '../types';
import { gridSearch } from './gridsearch';

export const gridbfs = (inp: GridInput): Step<GridState>[] => gridSearch('bfs', inp);
