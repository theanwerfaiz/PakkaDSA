import type { ArrInput, Step, TreeState } from '../types';
import { traversal } from './traversal';

export const preorder = (inp: ArrInput): Step<TreeState>[] => traversal('pre', inp);
