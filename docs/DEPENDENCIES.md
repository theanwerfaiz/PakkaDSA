# Dependencies

Every dependency, its exact version and its licence. The shipped site has **no runtime dependencies**; everything below is used only to build, check or test it.

| Package               | Version  | Licence    | Used for                          |
| --------------------- | -------- | ---------- | --------------------------------- |
| astro                 | 7.3.5    | MIT        | Static site build                 |
| @astrojs/check        | 0.9.10   | MIT        | Type-checking `.astro` files      |
| typescript            | 6.0.3    | Apache-2.0 | Type checking                     |
| @types/node           | 22.19.21 | MIT        | Node types for tests and scripts  |
| vitest                | 5.0.3    | MIT        | Unit, golden and render tests     |
| @vitest/coverage-v8   | 5.0.3    | MIT        | Coverage reports                  |
| @playwright/test      | 1.56.1   | Apache-2.0 | End-to-end tests                  |
| eslint                | 10.12.0  | MIT        | Linting                           |
| @eslint/js            | 10.0.1   | MIT        | ESLint recommended rules          |
| typescript-eslint     | 8.71.0   | MIT        | TypeScript lint rules             |
| eslint-plugin-astro   | 3.2.1    | MIT        | Astro lint rules                  |
| astro-eslint-parser   | 3.2.0    | MIT        | Parsing `.astro` files for ESLint |
| globals               | 17.13.0  | MIT        | Global variable lists for ESLint  |
| prettier              | 3.9.9    | MIT        | Formatting                        |
| prettier-plugin-astro | 1.1.0    | MIT        | Formatting `.astro` files         |

## Font assets (content, see DECISIONS D3)

| Package (source of files)        | Version | Licence |
| -------------------------------- | ------- | ------- |
| @fontsource/instrument-sans      | 5.3.0   | OFL-1.1 |
| @fontsource/kalam                | 5.3.0   | OFL-1.1 |
| @fontsource/jetbrains-mono       | 5.3.0   | OFL-1.1 |
| @fontsource/noto-sans-devanagari | 5.3.0   | OFL-1.1 |
