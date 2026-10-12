import { BIG_GROUP_ID, EMPTY_GROUP_ID, LONG_GROUP_ID } from '../fixtures/data';
import { expect, test } from '../fixtures/mockApi';
import { expectCleanList } from '../helpers/assertions';
import { getHorizontalOverflow, getLastCardVisibility, scrollToEnd } from '../helpers/layout';

// Сетка карточек объектов — следующий элемент после карточки самого населённого пункта
const GRID = '.grid';

test.describe('Мобильная страница населённого пункта /groups/[id]', () => {
  test('много объектов: карточки ровные, конец списка достижим', async ({ page }) => {
    await page.goto(`/groups/${BIG_GROUP_ID}`);
    await expect(page.locator(`${GRID} [data-slot=card]`).first()).toBeVisible();
    await expectCleanList(page, GRID, { minCards: 2 });

    await scrollToEnd(page);
    expect(await getLastCardVisibility(page, GRID)).toBeNull();
  });

  test('длинное название без тега', async ({ page }) => {
    await page.goto(`/groups/${LONG_GROUP_ID}`);
    await expect(page.locator(`${GRID} [data-slot=card]`).first()).toBeVisible();
    await expectCleanList(page, GRID);
  });

  test('без объектов: пустое состояние без горизонтальной прокрутки', async ({ page }) => {
    await page.goto(`/groups/${EMPTY_GROUP_ID}`);
    await expect(page.getByRole('heading', { name: 'Нет объектов' })).toBeVisible();
    expect(await getHorizontalOverflow(page)).toBeNull();
  });
});
