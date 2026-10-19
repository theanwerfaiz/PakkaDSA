import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/algorithms/quick-sort/',
  '/learn/graphs/',
  '/hi/',
  '/hi/algorithms/0-1-knapsack/',
  '/algorithms/',
  '/about/',
  '/privacy/',
];

test.describe('privacy', () => {
  test('pages make zero requests to other origins', async ({ page, baseURL }) => {
    const outside: string[] = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.protocol.startsWith('http') && u.origin !== new URL(baseURL as string).origin)
        outside.push(r.url());
    });
    for (const p of PAGES) {
      await page.goto(p);
      await page.waitForLoadState('networkidle');
    }
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#bPlay');
    await page.waitForTimeout(1500);
    expect(outside).toEqual([]);
  });

  test('no cookies are set', async ({ page, context }) => {
    for (const p of PAGES.slice(0, 3)) await page.goto(p);
    expect(await context.cookies()).toEqual([]);
  });
});

test.describe('pages work without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('an algorithm page has its explanation, complexity, pseudocode, four listings and FAQ in the HTML', async ({
    page,
  }) => {
    await page.goto('/algorithms/merge-sort/');
    await expect(page.locator('h1')).toHaveText('Merge sort');
    await expect(page.locator('.intro')).toContainText('O(n log n)');
    await expect(page.locator('.cxt tbody tr')).toHaveCount(4);
    await expect(page.locator('details.listing-box')).toHaveCount(4);
    await expect(page.locator('.faq dt')).toHaveCount(3);
    await expect(page.locator('.related a').first()).toBeVisible();
    await expect(page.locator('noscript')).toHaveCount(1);
    const code = await page.locator('details.listing-box pre').first().textContent();
    expect(code).toContain('def merge_sort');
    expect(code).not.toMatch(/^[\d,]*\|/m);
  });

  test('the welcome page lists all tracks and links', async ({ page }) => {
    await page.goto('/hi/');
    await expect(page.locator('.track')).toHaveCount(7);
    await expect(page.locator('.track .pill')).toHaveCount(38);
  });
});

test.describe('SEO', () => {
  test('canonical, hreflang, Open Graph and valid JSON-LD on every page type', async ({
    page,
    request,
  }) => {
    for (const p of PAGES) {
      await page.goto(p);
      const head = await page.evaluate(() => ({
        canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
        langs: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) =>
          l.getAttribute('hreflang'),
        ),
        og: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
        title: document.title,
        desc: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
          JSON.parse(s.textContent ?? ''),
        ),
      }));
      expect(head.canonical, p).toMatch(new RegExp(`${p.replace(/\//g, '\\/')}$`));
      expect(head.langs, p).toEqual(['en', 'hi', 'x-default']);
      expect([...head.title].length, p).toBeLessThanOrEqual(75);
      expect(head.desc.length, p).toBeGreaterThan(40);
      expect(head.desc.length, p).toBeLessThanOrEqual(200);
      expect(head.ld.length, p).toBeGreaterThan(0);
      const og = new URL(head.og as string);
      const res = await request.get(og.pathname);
      expect(res.status(), `${p} og image`).toBe(200);
    }
  });

  test('algorithm pages have LearningResource, FAQPage and BreadcrumbList data', async ({
    page,
  }) => {
    await page.goto('/algorithms/dijkstras-shortest-path/');
    const types = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => JSON.parse(s.textContent ?? '')['@type'],
      ),
    );
    expect(types).toEqual(['LearningResource', 'FAQPage', 'BreadcrumbList']);
    expect(await page.title()).toBe("Dijkstra's shortest path Visualization & Code | PakkaDSA");
  });

  test('sitemap lists every page in both languages, and robots.txt points to it', async ({
    request,
  }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml.match(/<url>/g)?.length).toBe(100);
    expect(xml).toContain('/hi/learn/dp/');
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  });

  test('every algorithm page links to at least four others', async ({ page }) => {
    await page.goto('/algorithms/heap-sort/');
    expect(await page.locator('.article a[href*="/algorithms/"]').count()).toBeGreaterThanOrEqual(
      4,
    );
  });

  test('unknown pages get the helpful 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-page/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('Page not found');
    await expect(page.locator('.algo-list a')).toHaveCount(76);
  });
});

test.describe('offline and installable', () => {
  test('after the first visit the site works offline', async ({ page, context, browserName }) => {
    test.skip(
      browserName !== 'chromium',
      'service worker offline emulation is checked in Chromium',
    );
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(async () =>
      (await caches.keys()).some((k) => k.startsWith('pakkadsa-')),
    );
    await page.waitForFunction(async () => {
      const c = await caches.open(
        (await caches.keys()).find((k) => k.startsWith('pakkadsa-')) as string,
      );
      return (await c.keys()).length > 300;
    });
    await context.setOffline(true);
    await page.goto('/hi/algorithms/quick-sort/');
    await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#stepLbl')).toHaveText('कदम 2 में से 42');
    await page.click('#langSeg button:text-is("Java")');
    await expect(page.locator('#code div').first()).toContainText('quickSort');
    await context.setOffline(false);
  });

  test('the manifest has icons for installation', async ({ request }) => {
    const m = await (await request.get('/hi/manifest.webmanifest')).json();
    expect(m.start_url).toBe('/hi/');
    expect(m.icons.map((i: { sizes: string }) => i.sizes)).toContain('512x512');
    for (const i of m.icons) expect((await request.get(i.src)).status()).toBe(200);
  });
});
