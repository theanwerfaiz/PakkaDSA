import { expect, test } from '@playwright/test';

test.describe('quiz mode', () => {
  test('pauses on a question, scores the answer, explains it and continues', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/');
    await expect(page.locator('#stage svg:not(.ssr)')).toBeVisible();
    await page.keyboard.press('q');
    await expect(page.locator('#quizBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#score')).toHaveText('Quiz 0/0');
    await page.keyboard.press('ArrowRight'); // step 1 -> 2 (no question on step 1)
    await page.keyboard.press('ArrowRight'); // step 2 asks "Will 38 and 27 swap?"
    await expect(page.locator('#quiz')).toHaveClass(/open/);
    await expect(page.locator('#quizQ')).toHaveText('Will 38 and 27 swap?');
    await expect(page.locator('.opt').first()).toBeFocused();
    await page.keyboard.press('Escape'); // not answered yet: stays open
    await expect(page.locator('#quiz')).toHaveClass(/open/);
    await page.click('.opt:text-is("Yes")');
    await expect(page.locator('#quizFb')).toHaveText('Correct!');
    await expect(page.locator('#quizGo')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#quizGo')).toBeFocused(); // focus stays in the dialog
    await page.keyboard.press('Escape');
    await expect(page.locator('#quiz')).not.toHaveClass(/open/);
    await expect(page.locator('#stepLbl')).toHaveText('Step 3 of 58');
    await expect(page.locator('#score')).toHaveText('Quiz 1/1');
  });

  test('a wrong answer shows the right one', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort/');
    await page.click('#quizBtn');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.click('.opt:text-is("No")');
    await expect(page.locator('#quizFb')).toHaveText('Not quite. Answer: Yes');
    await expect(page.locator('.opt.right')).toHaveText('Yes');
    await expect(page.locator('.opt.wrong')).toHaveText('No');
    await page.click('#quizGo');
    await expect(page.locator('#score')).toHaveText('Quiz 0/1');
  });

  test('auto-play pauses for the question and resumes after answering', async ({ page }) => {
    await page.goto('/algorithms/linear-search/');
    await page.click('#quizBtn');
    await page.click('#bPlay');
    await expect(page.locator('#quiz')).toHaveClass(/open/, { timeout: 3000 });
    await expect(page.locator('#bPlay')).toHaveAttribute('aria-label', 'Play');
    await page.click('.opt >> nth=1');
    await page.click('#quizGo');
    await expect(page.locator('#bPlay')).toHaveAttribute('aria-label', 'Pause');
  });

  test('Hindi questions and feedback', async ({ page }) => {
    await page.goto('/hi/algorithms/bubble-sort/');
    await page.click('#quizBtn');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#quizQ')).toHaveText('क्या 38 और 27 की जगह बदलेगी?');
    await page.click('.opt >> nth=0');
    await expect(page.locator('#quizFb')).toHaveText('सही!');
  });
});
