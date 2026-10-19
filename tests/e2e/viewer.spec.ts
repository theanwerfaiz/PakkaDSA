import { expect, test, type Page } from '@playwright/test';
import algorithms from '../../src/content/algorithms.json' with { type: 'json' };

const SLUGS = algorithms.algorithms.map((a) => a.slug);
const ready = async (page: Page) => expect(page.locator('#stage svg')).toBeVisible();

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

test.describe('animation identity', () => {
  test('a swap keeps the same bar nodes and moves exactly the swapped bars', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/');
    await ready(page);
    await page.keyboard.press('ArrowRight'); // step 2: compare 38 and 27; step 3 swaps them
    await page.waitForTimeout(500);
    const before = await page.evaluate(() =>
      [...document.querySelectorAll<SVGGElement>('#stage svg g[data-k^="b"]')].map((g, i) => {
        (g as unknown as { __mark: number }).__mark = i;
        return [g.dataset.k, g.style.transform];
      }),
    );
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120); // mid-glide
    const mid = await page.evaluate(() => {
      const g = document.querySelector<SVGGElement>('#stage svg g[data-k="b0"]') as SVGGElement;
      const cs = getComputedStyle(g);
      return {
        m: new DOMMatrix(cs.transform).e,
        prop: cs.transitionProperty,
        dur: cs.transitionDuration,
      };
    });
    await page.waitForTimeout(600);
    const after = await page.evaluate(() =>
      [...document.querySelectorAll<SVGGElement>('#stage svg g[data-k^="b"]')].map((g) => [
        g.dataset.k,
        g.style.transform,
        (g as unknown as { __mark?: number }).__mark,
      ]),
    );
    expect(after.map((x) => x[0])).toEqual(before.map((x) => x[0]));
    expect(after.every((x, i) => x[2] === i)).toBe(true); // the very same DOM nodes
    const moved = after.filter((x, i) => x[1] !== before[i][1]).map((x) => x[0]);
    expect(moved.sort()).toEqual(['b0', 'b1']);
    expect(mid.prop).toContain('transform');
    expect(mid.dur.split(',')[0].trim()).toBe('0.357s'); // clamp(70, 850 / 1 × 0.42, 420) ms
    const x = (s: string) => Number(/translate\(([\d.]+)px/.exec(s)?.[1]);
    const start = x(before[0][1] as string);
    const end = x(after[0][1] as string);
    expect(mid.m).toBeGreaterThan(Math.min(start, end));
    expect(mid.m).toBeLessThan(Math.max(start, end));
  });

  test('scrubbing does not animate, and Animations off removes transitions', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/');
    await ready(page);
    // Jump and check in the same task: the class is removed again on the next animation frame.
    const during = await page.evaluate(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      return document.getElementById('stage')?.classList.contains('nojump');
    });
    expect(during).toBe(true);
    await page.click('#moreBtn');
    await page.click('#animBtn');
    const tr = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector('#stage svg g.k') as Element).transitionProperty,
    );
    expect(tr).toBe('none');
    await page.reload();
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.classList.contains('noanim'))).toBe(
      true,
    );
  });

  test('reduced motion turns transitions off', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/algorithms/bubble-sort/');
    await ready(page);
    const dur = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector('#stage svg g.k') as Element).transitionDuration,
    );
    expect(dur).toMatch(/^0s/);
    await ctx.close();
  });
});

test.describe('every algorithm', () => {
  test('steps through without errors and never overflows horizontally', async ({ page }, info) => {
    test.skip(
      !['chromium', 'mobile'].includes(info.project.name),
      'full walk-through runs on Chromium desktop and mobile',
    );
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await page.addInitScript(() => localStorage.setItem('pakkadsa:anim', 'false'));
    for (const slug of SLUGS) {
      await page.goto(`/algorithms/${slug}/`);
      await ready(page);
      const total = Number(await page.locator('#scrub').getAttribute('max'));
      for (let i = 0; i < total; i++) await page.keyboard.press('ArrowRight');
      await expect(page.locator('#stepLbl')).toContainText(`${total + 1}`);
      const box = await page.evaluate(() => {
        const svg = document.querySelector('#stage svg') as SVGSVGElement;
        const stage = document.getElementById('stage') as HTMLElement;
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          fits: svg.getBoundingClientRect().width <= stage.getBoundingClientRect().width + 0.5,
        };
      });
      expect(box, slug).toEqual({ overflow: false, fits: true });
    }
    expect(errors).toEqual([]);
  });
});

test.describe('controls stay reachable', () => {
  test('playback bar is fully visible on a 1366 × 680 laptop', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1366, height: 680 } });
    for (const slug of [
      'bubble-sort',
      'bfs-shortest-path',
      'longest-common-subsequence',
      'valid-parentheses',
    ]) {
      await page.goto(`/algorithms/${slug}/`);
      await ready(page);
      const r = await page.locator('.ctrls').boundingBox();
      expect(r && r.y >= 0 && r.y + r.height <= 680, slug).toBe(true);
    }
    await page.close();
  });

  test('on a 390 × 844 phone the bar is fixed to the bottom', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('/algorithms/quick-sort/');
    await ready(page);
    expect(await page.locator('.ctrls').evaluate((e) => getComputedStyle(e).position)).toBe(
      'fixed',
    );
    const r = await page.locator('.ctrls').boundingBox();
    expect(Math.round((r?.y ?? 0) + (r?.height ?? 0))).toBe(844);
    await page.close();
  });
});

test.describe('header, menu, sidebar and keyboard', () => {
  test('menu opens, moves with arrow keys, closes on Escape and returns focus', async ({
    page,
  }) => {
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#moreBtn');
    await expect(page.locator('#moreMenu')).toBeVisible();
    await expect(page.locator('#voiceBtn')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#classBtn')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#saveBtn')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#moreMenu')).toBeHidden();
    await expect(page.locator('#moreBtn')).toBeFocused();
    await page.click('#moreBtn');
    await page.click('#algoTitle');
    await expect(page.locator('#moreMenu')).toBeHidden();
  });

  test('dark mode toggle shows On/Off text and survives reload', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#moreBtn');
    await expect(page.locator('#themeBtn .st')).toHaveText('Off');
    await page.click('#themeBtn');
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
    await page.reload();
    await page.click('#moreBtn');
    await expect(page.locator('#themeBtn .st')).toHaveText('On');
    await expect(page.locator('#themeBtn')).toHaveAttribute('aria-checked', 'true');
  });

  test('search filters by name or category in either language', async ({ page }) => {
    await page.goto('/hi/algorithms/bubble-sort/');
    await page.fill('#search', 'ट्री');
    await expect(page.locator('#nav .al:visible')).toHaveCount(6);
    await page.fill('#search', 'KADANE');
    await expect(page.locator('#nav .al:visible')).toHaveCount(1);
    await page.fill('#search', 'zzz');
    await expect(page.locator('#noMatch')).toBeVisible();
    await expect(page.locator('#nav [aria-current="page"]')).toHaveCount(1);
  });

  test('keyboard shortcuts step, jump and play, but not while typing', async ({ page }) => {
    await page.goto('/algorithms/linear-search/');
    await ready(page);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#stepLbl')).toHaveText('Step 2 of 7');
    await page.keyboard.press('End');
    await expect(page.locator('#stepLbl')).toHaveText('Step 7 of 7');
    await page.keyboard.press('Home');
    await expect(page.locator('#stepLbl')).toHaveText('Step 1 of 7');
    await page.focus('#search');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('End');
    await expect(page.locator('#stepLbl')).toHaveText('Step 1 of 7');
    await page.click('#algoTitle');
    await page.keyboard.press(' ');
    await expect(page.locator('#bPlay')).toHaveAttribute('aria-label', 'Pause');
    await expect(page.locator('#stepLbl')).toHaveText('Step 3 of 7', { timeout: 3000 });
  });

  test('mark as learned updates the sidebar and survives reload; up next goes to the next page', async ({
    page,
  }) => {
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#learnBtn');
    await expect(page.locator('#progTxt')).toHaveText('1 / 38 learned');
    await page.reload();
    await expect(page.locator('#learnBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#nav [data-id="bubble"] .tick')).toBeVisible();
    await page.click('#nextAlgo');
    await expect(page).toHaveURL(/\/algorithms\/selection-sort\/$/);
  });

  test('the drawer opens from the menu button on phones and closes on outside tap', async ({
    browser,
  }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#menuBtn');
    await expect(page.locator('#side')).toHaveClass(/open/);
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.click(370, 400);
    await expect(page.locator('#side')).not.toHaveClass(/open/);
    await page.close();
  });

  test('works with localStorage blocked', async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    });
    await page.goto('/algorithms/merge-sort/');
    await ready(page);
    await page.keyboard.press('ArrowRight');
    await page.click('#learnBtn');
    expect(errors).toEqual([]);
  });

  test('language link keeps the step and input', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/#s=4');
    await page.click('#langBtn');
    await expect(page).toHaveURL(/\/hi\/algorithms\/bubble-sort\/#s=4$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  });
});
