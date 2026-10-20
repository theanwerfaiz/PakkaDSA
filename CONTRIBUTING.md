# Contributing to PakkaDSA

Thanks for helping! Ground rules: no backend, no tracking, no requests to other sites, original code only. Pull requests that break these will be declined.

## Setup

`npm ci` → `npm run dev`. Before opening a pull request run `npm run check:all` (licences, lint, types, unit tests, golden steps, code-snippet tests, build, browser tests). The snippet tests need Python 3, JDK 17+ and g++.

## Add a new algorithm

The full checklist is in [docs/ADDING_AN_ALGORITHM.md](docs/ADDING_AN_ALGORITHM.md). In short: one pure generator in `src/engine/algorithms/`, an entry in `src/engine/registry.ts` and `src/engine/inputs.ts`, content in `src/content/algorithms.json`, four tagged code snippets in `src/content/code/`, tests, and a regenerated golden file.

## Add a code language

Write the 38 snippets as `src/content/code/<id>.<lang>.txt` in the tagged-line format, add the tab in `src/content/code.ts`, and add a harness under `tests/snippets/` that runs them against known answers, like `build_java_test.sh`. `tests/snippets/cov.cjs` checks that every step's pseudocode line is mapped.

## Add a translation

Copy `src/content/i18n/en.json`, translate every value, and add the language's descriptions, tips and step messages. Partial translations are welcome as a starting point. `npm test` fails if a key is missing or empty.

## The golden files

`tests/golden/golden-steps.json` records every step of every algorithm (line, messages, quiz flag and a hash of the state), and `tests/golden/render-hashes.json` every drawing. If your change intentionally alters steps or drawings, run `npm run golden:update`, commit the result, and explain why in the pull request. Never change an algorithm's output just to make a test pass.

## Commits and pull requests

Conventional commits (`feat:`, `fix:`, `docs:`). Keep pull requests focused; add screenshots or a short recording for UI changes.
