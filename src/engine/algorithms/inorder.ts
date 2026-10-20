import type { ArrInput, Step, TreeState } from '../types';
import { traversal } from './traversal';

export const inorder = (inp: ArrInput): Step<TreeState>[] => traversal('in', inp);
