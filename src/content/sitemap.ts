import { ALGORITHMS, TRACKS } from './catalog';

/** Every indexable page, as a path without the language prefix. */
export const PAGE_PATHS = [
  '/',
  '/algorithms/',
  ...ALGORITHMS.map((a) => `/algorithms/${a.slug}/`),
  ...TRACKS.map((t) => `/learn/${t.id}/`),
  '/about/',
  '/privacy/',
  '/contribute/',
];

/** sitemap.xml with both languages and their hreflang alternates. */
export function sitemapXml(site: string): string {
  const abs = (p: string) => new URL(p, site).href;
  const entries = PAGE_PATHS.flatMap((p) =>
    [p, '/hi' + p].map(
      (loc) => `  <url>
    <loc>${abs(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(p)}"/>
    <xhtml:link rel="alternate" hreflang="hi" href="${abs('/hi' + p)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(p)}"/>
  </url>`,
    ),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}
