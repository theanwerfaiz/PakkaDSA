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
