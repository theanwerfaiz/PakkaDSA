import type { Lang } from '../content/catalog';
import type { Input, Step } from '../engine/types';

export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];
export type CodeLang = 'pseudo' | 'py' | 'java' | 'cpp' | 'js';
export type GridMode = 'wall' | 'start' | 'end';

/** The one small store for the page (see architecture §7). */
export interface AppState {
  lang: Lang;
  id: string | null;
  steps: Step[];
  i: number;
  playing: boolean;
  timer: ReturnType<typeof setTimeout> | undefined;
  speedIdx: number;
  quiz: boolean;
  voice: boolean;
  classroom: boolean;
  anim: boolean;
  codeLang: CodeLang;
  answered: number;
  score: { r: number; t: number };
  input: Input | null;
  learned: Set<string>;
  gridMode: GridMode;
}

export const S: AppState = {
  lang: 'en',
  id: null,
  steps: [],
  i: 0,
  playing: false,
  timer: undefined,
  speedIdx: 3,
  quiz: false,
  voice: false,
  classroom: false,
  anim: true,
  codeLang: 'pseudo',
  answered: -1,
  score: { r: 0, t: 0 },
  input: null,
  learned: new Set(),
  gridMode: 'wall',
};
