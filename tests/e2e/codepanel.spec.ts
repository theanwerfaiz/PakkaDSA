import { expect, test } from '@playwright/test';

test.describe('code panel', () => {
  test('highlights the swap line in every language at bubble sort step 3', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/');
    await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#stepLbl')).toHaveText('Step 3 of 58');
    const expected: Record<string, string> = {
      Pseudo: 'swap',
      Python: 'a[j], a[j + 1] = a[j + 1], a[j]',
      Java: 'int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;',
      'C++': 'swap(a[j], a[j + 1]);',
      JS: '[a[j], a[j + 1]] = [a[j + 1], a[j]];',
    };
    for (const [tab, text] of Object.entries(expected)) {
      await page.click(`#langSeg button:text-is("${tab}")`);
      await expect(page.locator(`#langSeg button:text-is("${tab}")`)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.locator('#code div.on').first()).toContainText(text);
    }
  });

  test('the final "done" step highlights nothing in real code, and the choice is remembered', async ({
    page,
  }) => {
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#langSeg button:text-is("Python")');
    await page.keyboard.press('End');
    await expect(page.locator('#code div.on')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('#langSeg button:text-is("Python")')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#code div').first()).toContainText('def bubble_sort');
  });

  test('copy puts the code without line tags on the clipboard', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/algorithms/linear-search/');
    await page.click('#langSeg button:text-is("JS")');
    await page.click('#copyCode');
    await expect(page.locator('#toast')).toHaveText('Code copied');
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('function linearSearch');
    expect(text).not.toMatch(/^[\d,]*\|/m);
  });
});
