# Decisions

Choices made where the spec was ambiguous, or where it could not be followed exactly. Newest last.

## D1. Toolchain versions (Phase 0)

Astro 7.3.5 (requires Node ≥ 22.12, so CI uses Node 22, not the 20 in the workflow template), TypeScript 6.0.3 (7.x is not yet supported by `typescript-eslint` or `@astrojs/check`), Vitest 5.0.3, Playwright 1.56.1. All versions are pinned exactly and were released more than two weeks before they were added.

## D2. npm peer-dependency resolution

npm 10's resolver crashes (`Cannot read properties of null (reading 'edgesOut')`) on Vitest 5's optional peer set. Vitest was added once with `--legacy-peer-deps`; the resulting lockfile installs cleanly with plain `npm ci`, so no `.npmrc` override is needed.

## D3. Fonts are content, not code dependencies

The four font families (Instrument Sans, Kalam, JetBrains Mono, Noto Sans Devanagari) are licensed under the SIL Open Font License 1.1, which is not on the code-licence allow-list (MIT, Apache-2.0, BSD, ISC). The spec requires these fonts, and OFL permits bundling and redistribution, so they are treated as content assets. The `.woff2` files are copied from the `@fontsource/*` packages (dev-only) into `public/fonts/` with their licence text, and are served from our own origin.

## D4. Preview server in E2E

Astro 7's `astro preview` keeps a lock file for background servers. Playwright starts it with `--ignore-lock` so a stale lock never blocks a test run.

## D5. No inlined scripts or styles

`build.inlineStylesheets: 'never'` and `vite.build.assetsInlineLimit: 0` keep every script and stylesheet as a same-origin file, so the CSP `script-src 'self'` needs no `'unsafe-inline'` for scripts.

## D6. Transitive build-only packages with other licences

Astro and Vite pull in two build-time packages outside the allow-list: `lightningcss` (MPL-2.0, Vite's CSS tool) and the `@img/sharp-libvips-*` binaries (LGPL-3.0, Astro's optional image service). Neither is a direct dependency, neither is shipped in `dist/`, and we do not modify them, so their licences place no obligations on the site. The allow-list is applied to every package we add directly. Re-check this table when upgrading Astro: `node scripts/check-licences.mjs` lists anything new.

## D7. Snippet harness reads the project's own content

The original harness loaded the snippets and generators from the prototype source. In this repository the snippets live in `src/content/code/<id>.<lang>.txt` (tagged lines, as in `06` §1), so `tests/snippets/extract.cjs` and `cov.cjs` read from there. Until the TypeScript engine exists, `cov.cjs` takes each step's pseudocode line from `tests/golden/golden-steps.json`; the 45 allowed final "done" gaps are listed explicitly in the script and any change to that set fails the check. The scripts use `.cjs` because the package is an ES module. Output goes to `tests/snippets/out/` (git-ignored).

## D8. `noUncheckedIndexedAccess` is off

The project uses TypeScript `strict` plus Astro's "strictest" preset, except `noUncheckedIndexedAccess`. That flag is not part of `strict`; with it, every `a[i]` in the generators becomes `number | undefined`, which would force hundreds of non-null assertions into code whose indexes are already bounded by its loops, and would make the port harder to compare line by line with the prototype.

## D9. Snapshots use a JSON round-trip

`Rec.add` deep-copies state with `JSON.parse(JSON.stringify(…))`, exactly as the prototype does. `structuredClone` would be faster but keeps `undefined` and `Infinity`, which would change the golden hashes. Highlight objects are stored by reference, as in the prototype; generators never mutate a highlight after recording it.

## D10. Grid steps share a private copy of the grid

The prototype's grid search stored the caller's input grid in every step by reference (`runAlgo` always cloned the input first, so the app was never affected). The "no mutation leak" invariant tests generators directly, so `gridSearch` now copies the grid once and shares that copy across its steps. Every step's content is unchanged and the golden hashes still match.

## D11. Render parity is checked byte for byte; the stage reserves the tallest step

`tests/golden/render-hashes.json` holds a SHA-1 of every SVG the reference renderers drew for 7 inputs per algorithm (the default plus 6 seeded random inputs) at widths 860 and 420: 18,842 drawings. It was generated once from the prototype, like the golden steps, and the TypeScript renderers must match it exactly.
Two views are taller on some steps than others in the prototype: the heap during min-heap insert (it grows as items arrive) and trees deeper than four levels. Changing the renderers would break parity, so instead `stageHeight()` returns the tallest drawing of a run and the app reserves that height for the stage. Nothing below the stage moves between steps.

## D12. One page per algorithm, with full page loads between them

The prototype switched algorithms inside one page with hash routing. The site has a real, pre-rendered URL per algorithm and language (`/algorithms/<slug>/`, `/hi/algorithms/<slug>/`) so each page carries its own indexable text. Choosing an algorithm (sidebar, learning path, "Up next") is an ordinary link to that page; settings, progress and the last position persist through `localStorage`. Client-side routing would leave each page's static text out of date, and the pages are small and cached, so a full load stays fast. The language button links to the mirror page and carries the hash (step and input) across.

## D13. Narrated playback starts on Play

In the prototype, turning on narration and then pressing Play did nothing: playback waited for the end of an utterance that was never started. Play now advances after 250 ms when nothing is being spoken, and each spoken step then schedules the next one, as specified in F9. This is a UI fix; no algorithm output changes.
