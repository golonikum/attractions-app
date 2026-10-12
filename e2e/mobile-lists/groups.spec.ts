import { GROUPS } from '../fixtures/data';
import { expect, test } from '../fixtures/mockApi';
import { expectCleanList } from '../helpers/assertions';
import { getLastCardVisibility, scrollListTo, scrollToEnd } from '../helpers/layout';

const LIST = '[role=list]';

const openGroups = async (page: import('@playwright/test').Page, query = '') => {
  await page.goto(`/groups${query}`);
  await expect(page.locator(`${LIST} [data-slot=card]`).first()).toBeVisible();
};

test.describe('Мобильный список населённых пунктов /groups', () => {
  test('карточки ровные сверху, в середине и в конце списка', async ({ page }) => {
    await openGroups(page);
    await expectCleanList(page, LIST, { minCards: 2 });

    await scrollListTo(page, 0.5);
    await expectCleanList(page, LIST, { minCards: 2 });

    await scrollToEnd(page);
    await expectCleanList(page, LIST);
    expect(await getLastCardVisibility(page, LIST, GROUPS.length)).toBeNull();
  });

  test('отфильтрованный по региону список', async ({ page }) => {
    const tag = GROUPS.find((group) => group.tag)!.tag!;
    const count = GROUPS.filter((group) => group.tag === tag).length;

    await openGroups(page, `?tag=${encodeURIComponent(tag)}`);
    await expectCleanList(page, LIST);

    await scrollToEnd(page);
    expect(await getLastCardVisibility(page, LIST, count)).toBeNull();
  });

  test('поиск с единственным результатом', async ({ page }) => {
    await openGroups(page, `?search=${encodeURIComponent('Город 58')}`);
    await expectCleanList(page, LIST);
    expect(await getLastCardVisibility(page, LIST, 1)).toBeNull();
  });

  test('после поворота экрана карточки по-прежнему ровные', async ({ page }) => {
    await openGroups(page);
    const { width, height } = page.viewportSize()!;

    await page.setViewportSize({ width: height, height: width });
    await page.waitForTimeout(300);

    // От 1024px включается десктопная раскладка с картой и таблицей вместо карточек
    if (height < 1024) {
      await expectCleanList(page, LIST);
    }

    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    await scrollListTo(page, 0.5);
    await expectCleanList(page, LIST, { minCards: 2 });
  });
});
