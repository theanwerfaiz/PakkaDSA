import { expect, test } from '@playwright/test';

test.describe('narration', () => {
  test('speaks each step in the page language at a clamped rate', async ({ page }) => {
    await page.addInitScript(() => {
      const spoken: { text: string; lang: string; rate: number }[] = [];
      (window as unknown as { __spoken: typeof spoken }).__spoken = spoken;
      class FakeUtterance {
        lang = '';
        rate = 1;
        voice = null;
        onend: (() => void) | null = null;
        constructor(public text: string) {}
      }
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        value: FakeUtterance,
        configurable: true,
      });
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          cancel() {},
          getVoices: () => [],
          speak(u: FakeUtterance) {
            spoken.push({ text: u.text, lang: u.lang, rate: u.rate });
            setTimeout(() => u.onend?.(), 50);
          },
        },
      });
    });
    await page.goto('/hi/algorithms/linear-search/');
    await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
    await page.click('#moreBtn');
    await page.click('#voiceBtn');
    await page.click('#moreBtn');
    await expect(page.locator('#voiceBtn .st')).toHaveText('चालू');
    await page.keyboard.press('Escape');
    await page.locator('#speed').fill('0');
    await page.click('#bPlay');
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __spoken: unknown[] }).__spoken.length),
      )
      .toBeGreaterThan(2);
    const spoken = await page.evaluate(
      () =>
        (window as unknown as { __spoken: { text: string; lang: string; rate: number }[] })
          .__spoken,
    );
    const first = spoken[spoken.length - 1]; // spoken after the speed was set to 0.25×
    expect(first.lang).toBe('hi-IN');
    expect(first.rate).toBe(0.7);
    expect(spoken[0].text).toContain('56');
  });

  test('explains when the browser cannot speak and stays off', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    });
    await page.goto('/algorithms/linear-search/');
    await page.click('#moreBtn');
    await page.click('#voiceBtn');
    await expect(page.locator('#toast')).toHaveText('Narration is not supported in this browser.');
    await page.click('#moreBtn');
    await expect(page.locator('#voiceBtn')).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('classroom mode', () => {
  test('hides the sidebar and enlarges the note; C toggles it', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 800 });
    await page.goto('/algorithms/merge-sort/');
    await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
    const before = await page
      .locator('#note')
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    await page.keyboard.press('c');
    await expect(page.locator('body')).toHaveClass(/classroom/);
    await expect(page.locator('#side')).toBeHidden();
    const after = await page
      .locator('#note')
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(after).toBe(28);
    expect(after).toBeGreaterThan(before);
    await page.click('#moreBtn');
    await expect(page.locator('#classBtn .st')).toHaveText('On');
    await page.click('#classBtn');
    await expect(page.locator('#side')).toBeVisible();
  });
});
