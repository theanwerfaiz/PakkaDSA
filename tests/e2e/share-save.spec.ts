import { expect, test } from '@playwright/test';

test.describe('share link', () => {
  test('opens the same algorithm, input and step in a fresh page', async ({ page, browser }) => {
    await page.goto('/algorithms/quick-sort/');
    await expect(page.locator('#stage svg')).toBeVisible();
    await page.click('#tInput');
    await page.fill('#in-a', '5, 1, 4, 2');
    await page.click('#inApply');
    for (let k = 0; k < 6; k++) await page.click('#bNext');
    await page.click('#shareBtn');
    const url = await page.inputValue('#shareInp');
    expect(url).toMatch(/\/algorithms\/quick-sort\/#s=6&d=/);
    const note = await page.locator('#note').textContent();
    const fresh = await browser.newPage();
    await fresh.goto(url);
    await expect(fresh.locator('#stepLbl')).toHaveText(/^Step 7 of \d+$/);
    await expect(fresh.locator('#note')).toHaveText(note ?? '');
    await fresh.click('#tInput');
    await expect(fresh.locator('#in-a')).toHaveValue('5, 1, 4, 2');
    await fresh.close();
  });

  test('malformed or mismatched hashes are ignored safely', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const hash of [
      '#s=abc&d=%7Bbroken',
      '#s=99999&d=' + encodeURIComponent('{"type":"str","s":"x"}'),
      '#d=' + encodeURIComponent('{"type":"arr","a":[1,"<img src=x onerror=alert(1)>"]}'),
      '#s=-5',
    ]) {
      await page.goto('/algorithms/bubble-sort/' + hash);
      await expect(page.locator('#stage svg')).toBeVisible();
      await page.click('#tInput');
      await expect(page.locator('#in-a')).toHaveValue('38, 27, 43, 3, 9, 82, 10, 55');
    }
    await page.goto('/algorithms/bubble-sort/#s=99999');
    await expect(page.locator('#stepLbl')).toHaveText('Step 58 of 58');
    expect(errors).toEqual([]);
  });

  test('a shared grid with custom walls opens with those walls', async ({ page }) => {
    const grid = { R: 13, C: 25, walls: [30, 31, 32], start: [0, 0], end: [12, 24] };
    await page.goto(
      '/algorithms/a-star-search/#d=' + encodeURIComponent(JSON.stringify({ type: 'grid', grid })),
    );
    await expect(page.locator('#stage svg rect[fill="var(--wall)"]')).toHaveCount(3);
  });
});

test.describe('save image', () => {
  test('downloads a PNG of the current step', async ({ page }) => {
    await page.goto('/algorithms/merge-sort/');
    await expect(page.locator('#stage svg')).toBeVisible();
    await page.click('#bNext');
    await page.click('#moreBtn');
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#saveBtn')]);
    expect(download.suggestedFilename()).toBe('pakkadsa-merge-step-2.png');
    const path = await download.path();
    const { readFileSync } = await import('node:fs');
    const bytes = readFileSync(path);
    expect([...bytes.subarray(1, 4)].map((b) => String.fromCharCode(b)).join('')).toBe('PNG');
    await expect(page.locator('#toast')).toHaveText('Image saved');
  });
});
