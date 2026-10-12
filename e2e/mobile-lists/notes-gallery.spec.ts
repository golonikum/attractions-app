import { expect, test } from '../fixtures/mockApi';
import { expectCleanList } from '../helpers/assertions';
import { getHorizontalOverflow, getLastCardVisibility, scrollToEnd } from '../helpers/layout';

const GRID = '.grid';

test.describe('Мобильные заметки /notes', () => {
  test('карточки заметок ровные, конец списка достижим', async ({ page }) => {
    await page.goto('/notes');
    await expect(page.locator(`${GRID} [data-slot=card]`).first()).toBeVisible();
    await expectCleanList(page, GRID, { minCards: 2 });

    await scrollToEnd(page);
    expect(await getLastCardVisibility(page, GRID)).toBeNull();
  });
});

test.describe('Мобильная галерея /gallery', () => {
  test('галерея без горизонтальной прокрутки', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('.image-gallery')).toBeVisible();
    expect(await getHorizontalOverflow(page)).toBeNull();
  });
});
