// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.org',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Never inline scripts or styles, so the strict Content-Security-Policy (script-src 'self') holds.
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
  devToolbar: { enabled: false },
});
