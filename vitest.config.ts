/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Astro's Vite setup lets tests render real .astro components (see tests/unit/app).
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/golden/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['tests/unit/app/render-pages.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text-summary', 'html'],
      thresholds: {
        statements: 80,
        'src/engine/**': { statements: 95, branches: 95, functions: 95, lines: 95 },
      },
    },
  },
});
