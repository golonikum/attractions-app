import { ATTRACTIONS } from '../fixtures/data';
import { expect, test } from '../fixtures/mockApi';
import { expectCleanList } from '../helpers/assertions';
import { getHorizontalOverflow, getLastCardVisibility, scrollListTo, scrollToEnd } from '../helpers/layout';

const LIST = '[role=list]';

test.describe('Мобильный поиск объектов /search', () => {
  test('без запроса: показаны все объекты, нет горизонтальной прокрутки', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator(`${LIST} [data-slot=card]`).first()).toBeVisible();
    expect(await getHorizontalOverflow(page)).toBeNull();
  });

  test('много результатов: карточки ровные сверху, в середине и в конце', async ({ page }) => {
    // «Объект» есть в названии каждого объекта
    await page.goto(`/search?search=${encodeURIComponent('Объект')}`);
    await expect(page.locator(`${LIST} [data-slot=card]`).first()).toBeVisible();
    await expectCleanList(page, LIST);

    await scrollListTo(page, 0.5);
    await expectCleanList(page, LIST);

    await scrollToEnd(page);
    await expectCleanList(page, LIST);
    expect(await getLastCardVisibility(page, LIST, ATTRACTIONS.length)).toBeNull();
  });

  test('единственный результат', async ({ page }) => {
    // Название уникально и не входит в другие названия и описания
    await page.goto(`/search?search=${encodeURIComponent('Объект 2005')}`);
    await expect(page.locator(`${LIST} [data-slot=card]`).first()).toBeVisible();
    await expectCleanList(page, LIST);
  });
});
