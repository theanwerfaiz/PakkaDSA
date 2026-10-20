import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default defineConfig(
  {
    ignores: ['dist/', '.astro/', 'coverage/', 'docs/', 'tests/snippets/', 'node_modules/'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // The engine is pure: no DOM, no browser globals, no app code, no randomness.
    files: ['src/engine/**/*.ts'],
    languageOptions: { globals: { ...globals.es2024 } },
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'localStorage',
        'sessionStorage',
        'location',
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Generators must be deterministic.' },
      ],
      'no-restricted-imports': [
        'error',
        { patterns: ['**/app/**', '**/render/**', '**/pages/**', '**/components/**'] },
      ],
    },
  },
);
