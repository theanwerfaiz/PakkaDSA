/* Global setup (runs in Node before the DOM tests): renders the real pages with Astro's container
   API and writes them to a temporary folder, where tests/unit/app/harness.ts loads them. */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import AlgoPage from '../../../src/components/AlgoPage.astro';
import HomePage from '../../../src/pages/[...lang]/index.astro';
import TrackPage from '../../../src/pages/[...lang]/learn/[track].astro';
import { ALGORITHMS, LANGS, TRACKS } from '../../../src/content/catalog';

export const PAGES_DIR = join(tmpdir(), 'pakkadsa-test-pages');

export default async function setup() {
  rmSync(PAGES_DIR, { recursive: true, force: true });
  mkdirSync(PAGES_DIR, { recursive: true });
  const c = await AstroContainer.create({ astroConfig: { site: 'https://example.org' } });
  for (const lang of LANGS) {
    for (const algo of ALGORITHMS)
      writeFileSync(
        join(PAGES_DIR, `algo-${lang}-${algo.id}.html`),
        await c.renderToString(AlgoPage, { props: { lang, algo }, partial: false }),
      );
    writeFileSync(
      join(PAGES_DIR, `home-${lang}.html`),
      await c.renderToString(HomePage, { props: { lang }, partial: false }),
    );
    for (const tr of TRACKS)
      writeFileSync(
        join(PAGES_DIR, `track-${lang}-${tr.id}.html`),
        await c.renderToString(TrackPage, { props: { lang, tr }, partial: false }),
      );
  }
}
