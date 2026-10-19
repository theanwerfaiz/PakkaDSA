// Runs Lighthouse (mobile profile) on the built site and fails if a score is below the release gate:
// Performance, Accessibility and Best Practices >= 95, SEO = 100. Prints failed accessibility audits.
//   npm run build && node scripts/lighthouse.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const PORT = 4330;
const PAGES = [
  '/',
  '/algorithms/quick-sort/',
  '/learn/graphs/',
  '/hi/',
  '/hi/algorithms/bfs-shortest-path/',
  '/hi/learn/dp/',
  '/about/',
];
const MIN = { performance: 95, accessibility: 95, 'best-practices': 95, seo: 100 };

const server = spawn('npx', ['astro', 'preview', '--ignore-lock', '--port', String(PORT)], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break;
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 500));
}

const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
let failed = false;
const report = [];
try {
  for (const p of PAGES) {
    const { lhr } = await lighthouse(base + p, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
    });
    const scores = Object.fromEntries(
      Object.entries(lhr.categories).map(([k, c]) => [k, Math.round(c.score * 100)]),
    );
    const a11y = lhr.categories.accessibility.auditRefs
      .map((r) => lhr.audits[r.id])
      .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable')
      .map((a) => a.id);
    const low = Object.entries(MIN).filter(([k, min]) => scores[k] < min);
    if (low.length) failed = true;
    report.push({ page: p, scores, a11yFailures: a11y });
    console.log(
      `${low.length ? 'FAIL' : 'ok  '} ${p} ${JSON.stringify(scores)}${a11y.length ? ' a11y: ' + a11y.join(', ') : ''}`,
    );
  }
} finally {
  await chrome.kill();
  server.kill();
}
writeFileSync('lighthouse-report.json', JSON.stringify(report, null, 2));
process.exit(failed ? 1 : 0);
