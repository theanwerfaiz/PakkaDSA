import type { Lang } from './catalog';

/** Static paths for both languages: English at the root, Hindi under /hi. */
export const langPaths = () => [
  { params: { lang: undefined }, props: { lang: 'en' as Lang } },
  { params: { lang: 'hi' }, props: { lang: 'hi' as Lang } },
];

/** Combines language paths with per-page paths. */
export function withLangs<P extends Record<string, string>, X extends object>(
  items: { params: P; props: X }[],
) {
  return langPaths().flatMap((l) =>
    items.map((it) => ({
      params: { ...l.params, ...it.params },
      props: { ...l.props, ...it.props },
    })),
  );
}
