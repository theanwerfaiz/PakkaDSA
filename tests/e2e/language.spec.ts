import { expect, test } from '@playwright/test';
import en from '../../src/content/i18n/en.json' with { type: 'json' };
import hi from '../../src/content/i18n/hi.json' with { type: 'json' };

// English UI strings that have a different Hindi translation must never show on a Hindi page.
const english = Object.entries(en)
  .filter(
    ([k, v]) =>
      v !== (hi as Record<string, string>)[k] &&
      v.length > 3 &&
      !k.startsWith('err.') &&
      k !== 'langName',
  )
  .map(([, v]) => v.replace(/\{\w+\}.*$/, '').trim())
  .filter((v) => v.length > 3);

test.describe('Hindi pages', () => {
  for (const path of [
    '/hi/',
    '/hi/algorithms/quick-sort/',
    '/hi/algorithms/bfs-shortest-path/',
    '/hi/algorithms/0-1-knapsack/',
  ]) {
    test(`no English UI text leaks into ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      for (const tab of ['#tInput', '#tAbout'])
        if (await page.locator(tab).count()) await page.click(tab);
      await page.click('#moreBtn');
      const text = await page.evaluate(() => {
        // Key names in <kbd> (Space, Home, End) are the same on every keyboard.
        const copy = document.body.cloneNode(true) as HTMLElement;
        copy.querySelectorAll('kbd').forEach((k) => k.remove());
        document.body.append(copy);
        const txt = copy.innerText;
        copy.remove();
        return txt;
      });
      const aria = await page.evaluate(() =>
        [...document.querySelectorAll('[aria-label]')]
          .map((e) => e.getAttribute('aria-label'))
          .join('\n'),
      );
      for (const s of english) {
        expect(text, `"${s}" in visible text`).not.toContain(s);
        expect(aria, `"${s}" in an aria-label`).not.toContain(s);
      }
    });
  }

  test('the stage label is in Hindi', async ({ page }) => {
    await page.goto('/hi/algorithms/merge-sort/');
    await expect(page.locator('#stage svg')).toHaveAttribute(
      'aria-label',
      'Merge sort, कदम 1 (40 में से)',
    );
  });
});
