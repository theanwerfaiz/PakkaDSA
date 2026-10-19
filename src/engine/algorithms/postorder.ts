import type { ArrInput, Step, TreeState } from '../types';
import { traversal } from './traversal';

export const postorder = (inp: ArrInput): Step<TreeState>[] => traversal('post', inp);
