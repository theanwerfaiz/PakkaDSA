import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/golden/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      thresholds: { 'src/engine/**': { statements: 95, branches: 95, functions: 95, lines: 95 } },
      reporter: ['text-summary', 'html'],
    },
  },
});
