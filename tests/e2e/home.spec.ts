import { expect, test } from '@playwright/test';

test.describe('welcome screen', () => {
  test('hero, start button and seven learning-path tracks', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero h1')).toHaveText('Watch an algorithm think.');
    await expect(page.locator('.track')).toHaveCount(7);
    await expect(page.locator('.track .pill')).toHaveCount(38);
    await expect(page.locator('#hCont')).toBeHidden();
    await page.click('#hStart');
    await expect(page).toHaveURL(/\/algorithms\/bubble-sort\/$/);
  });

  test('the hero animates bubble sort, and shows one still frame with reduced motion', async ({
    page,
    browser,
  }) => {
    await page.goto('/');
    const keys = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<SVGGElement>('#heroStage g[data-k^="b"]')]
          .map((g) => g.style.transform)
          .join('|'),
      );
    await expect(page.locator('#heroStage svg')).toBeVisible();
    const a = await keys();
    await page.waitForTimeout(2500);
    expect(await keys()).not.toBe(a);
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const still = await ctx.newPage();
    await still.goto('/');
    await expect(still.locator('#heroStage svg')).toBeVisible();
    const s1 = await still.locator('#heroStage svg').innerHTML();
    await still.waitForTimeout(1500);
    expect(await still.locator('#heroStage svg').innerHTML()).toBe(s1);
    await ctx.close();
  });

  test('progress updates after "Mark as learned" and Continue resumes the exact step', async ({
    page,
  }) => {
    await page.goto('/algorithms/linear-search/');
    await expect(page.locator('#stage svg')).toBeVisible();
    await page.click('#learnBtn');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700); // the last position is saved after half a second
    await page.goto('/');
    await expect(page.locator('.pill[data-id="linear"]')).toHaveClass(/done/);
    await expect(page.locator('[data-track="basics"] .count')).toHaveText('1 / 5 learned');
    await expect(page.locator('#hCont')).toHaveText('Continue: Linear search, step 3');
    await page.click('#hCont');
    await expect(page.locator('#stepLbl')).toHaveText('Step 3 of 7');
  });

  test('works in Hindi', async ({ page }) => {
    await page.goto('/hi/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await expect(page.locator('.hero h1')).toHaveText('एल्गोरिदम को सोचते हुए देखिए।');
    await page.click('.pill[data-id="kadane"]');
    await expect(page).toHaveURL(/\/hi\/algorithms\/kadanes-max-subarray\/$/);
  });
});

test.describe('about tab', () => {
  test('shows complexity, description and the interview tip', async ({ page }) => {
    await page.goto('/algorithms/quick-sort/');
    await page.click('#tAbout');
    await expect(page.locator('#pAbout .cx')).toContainText('O(n²)');
    await expect(page.locator('#pAbout .tip')).toContainText('Interview tip:');
  });
});
