import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PakkaDSA/);
});

test('fonts are served from our own origin', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(baseURL ?? '')) external.push(r.url());
  });
  await page.goto('/');
  const loaded = await page.evaluate(async () =>
    Promise.all(
      ['Instrument Sans', 'Kalam', 'JetBrains Mono', 'Noto Sans Devanagari'].map(
        async (family) => (await document.fonts.load(`16px "${family}"`, 'Aa हि')).length > 0,
      ),
    ),
  );
  expect(loaded).toEqual([true, true, true, true]);
  expect(external).toEqual([]);
});
