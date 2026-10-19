// Plain `tsc` does not understand .astro files (Astro's own checker does). The test setup imports
// pages to render them with the container API, which takes component factories.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const component: AstroComponentFactory;
  export default component;
}
