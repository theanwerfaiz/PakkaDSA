import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page, path: string) => {
  await page.goto(path);
  await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
  await page.click('#tInput');
};

test.describe('input panel', () => {
  test('valid input regenerates steps and resets to step 1; Enter runs', async ({ page }) => {
    await open(page, '/algorithms/bubble-sort/');
    await page.keyboard.press('End');
    await page.fill('#in-a', '3, 1, 2');
    await page.press('#in-a', 'Enter');
    await expect(page.locator('#stepLbl')).toHaveText(/^Step 1 of \d+$/);
    await expect(page.locator('#toast')).toHaveText('Running with your input');
    await expect(page.locator('#stage svg g[data-k^="b"]')).toHaveCount(3);
  });

  test('invalid input shows a bilingual error, changes nothing, and clears when typing', async ({
    page,
  }) => {
    await page.goto('/algorithms/bubble-sort/');
    await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.click('#tInput'); // after stepping: arrow keys on a focused tab move between tabs
    await page.fill('#in-a', '1, x');
    await page.click('#inApply');
    await expect(page.locator('#inErr')).toHaveText(
      'Use whole numbers separated by commas, like 5, 3, 8.',
    );
    await expect(page.locator('#stepLbl')).toHaveText('Step 2 of 58');
    await page.type('#in-a', '1');
    await expect(page.locator('#inErr')).toHaveText('');
    await open(page, '/hi/algorithms/bubble-sort/');
    await page.fill('#in-a', '1');
    await page.click('#inApply');
    await expect(page.locator('#inErr')).toHaveText('2 से 16 अंक लिखें।');
  });

  for (const [path, fields, bad, error] of [
    [
      '/algorithms/linear-search/',
      { '#in-a': '4, 8, 15', '#in-t': '15' },
      { '#in-t': '1.5' },
      'Target must be a whole number.',
    ],
    [
      '/algorithms/max-sum-of-k-items/',
      { '#in-a': '1, 2, 3', '#in-k': '2' },
      { '#in-k': '9' },
      'k must be between 1 and 3.',
    ],
    [
      '/algorithms/cycle-detection-floyd/',
      { '#in-a': '1, 2, 3', '#in-c': '-1' },
      { '#in-c': '3' },
      'Cycle index must be −1 to 2.',
    ],
    [
      '/algorithms/valid-parentheses/',
      { '#in-s': '([])' },
      { '#in-s': '(a)' },
      'Only ( ) [ ] { } are allowed here.',
    ],
    ['/algorithms/n-queens/', { '#in-n': '6' }, { '#in-n': '9' }, 'Choose n from 4 to 8.'],
    [
      '/algorithms/coin-change-fewest-coins/',
      { '#in-amt': '7', '#in-coins': '1, 3' },
      { '#in-amt': '31' },
      'Amount must be 1 to 30.',
    ],
    [
      '/algorithms/longest-common-subsequence/',
      { '#in-s1': 'abc', '#in-s2': 'ac' },
      { '#in-s1': 'ABCDEFGHIJK' },
      'Each string needs 1 to 10 characters.',
    ],
    [
      '/algorithms/0-1-knapsack/',
      { '#in-items': '2:3, 3:4', '#in-cap': '5' },
      { '#in-cap': '13' },
      'Capacity must be 1 to 12.',
    ],
  ] as const) {
    test(`fields for ${path}`, async ({ page }) => {
      await open(page, path);
      for (const [sel, v] of Object.entries(fields)) await page.fill(sel, v);
      await page.click('#inApply');
      await expect(page.locator('#inErr')).toHaveText('');
      await expect(page.locator('#stepLbl')).toHaveText(/^Step 1 of/);
      for (const [sel, v] of Object.entries(bad)) await page.fill(sel, v);
      await page.click('#inApply');
      await expect(page.locator('#inErr')).toHaveText(error);
    });
  }

  test('graph start node runs on change; topological sort explains the fixed graph', async ({
    page,
  }) => {
    await open(page, '/algorithms/breadth-first-search/');
    await page.selectOption('#in-s', 'D');
    await expect(page.locator('#note')).toContainText('BFS from D');
    await open(page, '/algorithms/topological-sort-kahn/');
    await expect(page.locator('#pInput')).toContainText('This graph is fixed');
  });

  test('Random changes the input; Reset restores the default', async ({ page }) => {
    await open(page, '/algorithms/kadanes-max-subarray/');
    const before = await page.inputValue('#in-a');
    let changed = false;
    for (let k = 0; k < 5 && !changed; k++) {
      await page.click('#inRand');
      changed = (await page.inputValue('#in-a')) !== before;
    }
    expect(changed).toBe(true);
    await page.click('#inReset');
    await expect(page.locator('#in-a')).toHaveValue(before);
  });

  test('grid: drag draws walls, re-runs and jumps to the last step; modes, maze and clear work', async ({
    page,
  }) => {
    await open(page, '/algorithms/bfs-shortest-path/');
    await expect(page.locator('#stepLbl')).toHaveText('Step 1 of 149');
    const walls = () => page.locator('#stage svg rect[fill="var(--wall)"]').count();
    const before = await walls();
    // Screen position of a cell centre, through the SVG's own transform and the renderer's grid geometry.
    const at = (c: number, r: number) =>
      page.evaluate(
        ([c, r]) => {
          const svg = document.querySelector('#stage svg') as SVGSVGElement;
          const W = svg.viewBox.baseVal.width;
          const cs = Math.min((W - 30) / 25, 30);
          const x0 = (W - 25 * cs) / 2;
          const p = new DOMPoint(x0 + c * cs + cs / 2, 14 + r * cs + cs / 2).matrixTransform(
            svg.getScreenCTM() as DOMMatrix,
          );
          return [p.x, p.y] as [number, number];
        },
        [c, r],
      );
    await page.mouse.move(...(await at(1, 1)));
    await page.mouse.down();
    for (let c = 2; c <= 5; c++) await page.mouse.move(...(await at(c, 1)), { steps: 2 });
    await page.mouse.up();
    await expect.poll(walls).toBe(before + 5);
    const label = await page.locator('#stepLbl').textContent();
    expect(label).toMatch(/^Step (\d+) of \1$/);
    await page.click('[data-gm="end"]');
    await page.mouse.click(...(await at(24, 12)));
    await expect(page.locator('#stage svg rect[fill="var(--cmp-line)"]')).toHaveCount(1);
    await page.click('#gClear');
    await expect.poll(walls).toBe(0);
    await page.click('#gMaze');
    await expect.poll(walls).toBeGreaterThan(20);
  });
});
