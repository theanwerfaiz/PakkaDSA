// Takes the README screenshots from the built site: npm run build && node scripts/screenshots.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const PORT = 4342;
const server = spawn('npx', ['astro', 'preview', '--ignore-lock', '--port', String(PORT)], {
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 3000));
const base = `http://localhost:${PORT}`;
const shots = [
  {
    path: '/algorithms/quick-sort/#s=14',
    out: 'viewer.png',
    w: 1366,
    h: 820,
    dark: false,
    tab: 'Python',
  },
  { path: '/algorithms/bfs-shortest-path/#s=90', out: 'phone.png', w: 390, h: 844, dark: false },
  { path: '/hi/', out: 'hindi-dark.png', w: 1366, h: 820, dark: true },
];
const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 1,
    colorScheme: s.dark ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(base + s.path);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  if (s.tab) await page.click(`#langSeg button:text-is("${s.tab}")`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `docs/screenshots/${s.out}` });
  await ctx.close();
}
await browser.close();
server.kill();
console.log('screenshots written');
