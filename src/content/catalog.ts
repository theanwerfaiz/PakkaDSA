/* Typed access to the algorithm content. Pages (at build time) and the app (in the browser) read
   the same data, so the static text and the interactive viewer can never disagree. */
import data from './algorithms.json';
import type { Input, Msg, ViewType } from '../engine/types';

export type Lang = 'en' | 'hi';
export const LANGS: Lang[] = ['en', 'hi'];

export interface Algorithm {
  id: string;
  slug: string;
  name: string;
  category: string;
  view: ViewType;
  input: Input;
  complexity: { best: string; average: string; worst: string; space: string };
  description: Msg;
  interviewTip: Msg;
  pseudocode: string[];
}
export interface Category {
  id: string;
  name: Msg;
}
export interface Track {
  id: string;
  name: Msg;
  description: Msg;
  algorithms: string[];
}

export const ALGORITHMS = data.algorithms as Algorithm[];
export const CATEGORIES = data.categories as Category[];
export const TRACKS = data.tracks as Track[];

const BY_ID = new Map(ALGORITHMS.map((a) => [a.id, a]));
const BY_SLUG = new Map(ALGORITHMS.map((a) => [a.slug, a]));

export const byId = (id: string): Algorithm | undefined => BY_ID.get(id);
export const bySlug = (slug: string): Algorithm | undefined => BY_SLUG.get(slug);
export const categoryOf = (a: Algorithm): Category =>
  CATEGORIES.find((c) => c.id === a.category) as Category;

/** Learning-path order: every algorithm, track by track. */
export const ORDER = TRACKS.flatMap((t) => t.algorithms);
export const nextOf = (id: string): string | null => {
  const i = ORDER.indexOf(id);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
};
export const trackOf = (id: string): Track | undefined =>
  TRACKS.find((t) => t.algorithms.includes(id));

/** Path prefix for a language: '' for English, '/hi' for Hindi. */
export const langPrefix = (lang: Lang) => (lang === 'hi' ? '/hi' : '');
export const algoPath = (lang: Lang, a: Algorithm) => `${langPrefix(lang)}/algorithms/${a.slug}/`;
export const homePath = (lang: Lang) => `${langPrefix(lang)}/`;
export const trackPath = (lang: Lang, t: Track) => `${langPrefix(lang)}/learn/${t.id}/`;
