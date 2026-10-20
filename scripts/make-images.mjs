// Renders the app icons and the 1200 × 630 Open Graph cards with Chromium (Playwright, a dev
// dependency) from the site's own fonts and colours. Run after changing names or the brand:
//   node scripts/make-images.mjs
// The PNGs are committed, so building the site does not need a browser (see docs/DECISIONS.md, D14).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('src/content/algorithms.json', 'utf8'));
// Fonts are inlined: pages made with setContent cannot load file:// fonts.
const font = (f) =>
  `data:font/woff2;base64,${readFileSync(`public/fonts/${f}`).toString('base64')}`;
const FACES = `
@font-face{font-family:IS;font-weight:700;src:url(${font('instrument-sans-latin-700-normal.woff2')})}
@font-face{font-family:IS;font-weight:500;src:url(${font('instrument-sans-latin-500-normal.woff2')})}
@font-face{font-family:Kalam;font-weight:700;src:url(${font('kalam-latin-700-normal.woff2')})}
@font-face{font-family:Kalam;font-weight:700;src:url(${font('kalam-devanagari-700-normal.woff2')});unicode-range:U+0900-097F}
@font-face{font-family:Noto;font-weight:500;src:url(${font('noto-sans-devanagari-devanagari-500-normal.woff2')})}`;
const LOGO = readFileSync('public/icons/favicon.svg', 'utf8');

const bars = (vals, hl) =>
  `<svg viewBox="0 0 400 260" width="400" height="260">${vals
    .map((v, i) => {
      const h = v * 22;
      const [f, s] = hl.includes(i)
        ? ['#FFD94A', '#C99A00']
        : i >= vals.length - 2
          ? ['#CDEFD9', '#1F8A55']
          : ['#FFFFFF', '#9AA0B8'];
      return `<rect x="${12 + i * 48}" y="${240 - h}" width="36" height="${h}" rx="6" fill="${f}" stroke="${s}" stroke-width="2.5"/>`;
    })
    .join('')}</svg>`;

const card = (title, kicker, sub) => `<!doctype html><html><head><style>${FACES}
body{margin:0;width:1200px;height:630px;background:#F7F8F4;font-family:IS,Noto,sans-serif;color:#1F2A5C;overflow:hidden;
background-image:linear-gradient(#E3E5DC 1px,transparent 1px),linear-gradient(90deg,#E3E5DC 1px,transparent 1px);background-size:30px 30px}
.wrap{position:absolute;inset:56px 64px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;font-weight:700;font-size:34px}.brand svg{width:56px;height:56px}
.k{margin-top:auto;font-weight:500;font-size:30px;color:#4B5480}
h1{font-family:Kalam,Noto,sans-serif;font-weight:700;font-size:${title.length > 22 ? 62 : 84}px;line-height:1.08;margin:10px 0 18px;max-width:600px}
.sub{font-size:28px;color:#4B5480;font-family:IS,Noto,sans-serif}
.art{position:absolute;right:64px;bottom:70px;background:#fff;border:2px solid #DCDED3;border-radius:24px;padding:20px}
</style></head><body><div class="wrap"><div class="brand">${LOGO}PakkaDSA</div><div class="k">${kicker}</div><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="art">${bars([4, 7, 3, 9, 5, 8, 10], [2, 3])}</div></body></html>`;

const icon = (
  size,
  pad,
) => `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:${pad ? '#FFD94A' : 'transparent'};display:grid;place-items:center">
<div style="width:${pad ? size * 0.7 : size}px;height:${pad ? size * 0.7 : size}px">${LOGO.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, w, h, out, transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: transparent });
}

await shot(icon(192, false), 192, 192, 'public/icons/icon-192.png', true);
await shot(icon(512, false), 512, 512, 'public/icons/icon-512.png', true);
await shot(icon(512, true), 512, 512, 'public/icons/icon-maskable-512.png');
await shot(icon(180, true), 180, 180, 'public/icons/apple-touch-icon.png');

const cats = Object.fromEntries(data.categories.map((c) => [c.id, c.name]));
await shot(
  card(
    'Watch an algorithm think.',
    'Free algorithm visualizer',
    '38 algorithms · Python, Java, C++, JS · हिन्दी',
  ),
  1200,
  630,
  'public/og/home.png',
);
for (const a of data.algorithms) {
  const c = cats[a.category];
  await shot(
    card(a.name, `${c.en} · ${c.hi}`, 'Step by step · Python, Java, C++, JS · हिन्दी'),
    1200,
    630,
    `public/og/${a.slug}.png`,
  );
}
for (const t of data.tracks) {
  await shot(
    card(t.name.en, 'Learning path · सीखने का रास्ता', t.name.hi),
    1200,
    630,
    `public/og/track-${t.id}.png`,
  );
}
await browser.close();
console.log('images written');
