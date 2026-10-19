// @ts-check
import { defineConfig } from 'astro/config';
import serviceWorker from './scripts/sw-integration.mjs';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.org',
  output: 'static',
  integrations: [serviceWorker()],
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Styles are inlined (the policy allows inline styles) to save a render-blocking request.
    // Scripts are never inlined, so script-src stays 'self' plus the theme script's hash.
    inlineStylesheets: 'always',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
  devToolbar: { enabled: false },
});
