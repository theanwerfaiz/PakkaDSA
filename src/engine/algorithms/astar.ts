import type { GridInput, GridState, Step } from '../types';
import { gridSearch } from './gridsearch';

export const astar = (inp: GridInput): Step<GridState>[] => gridSearch('astar', inp);
