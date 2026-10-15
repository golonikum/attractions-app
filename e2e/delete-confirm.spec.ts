import type { Page } from '@playwright/test';

import { ATTRACTIONS, BIG_GROUP_ID, GROUPS } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';

/** Перехватывает DELETE-запросы к API и возвращает список удалённых путей */
const trackDeletes = async (page: Page) => {
  const deleted: string[] = [];

  await page.route('**/api/{groups,attractions}/*', (route) => {
    if (route.request().method() !== 'DELETE') {
      return route.fallback();
    }

    deleted.push(new URL(route.request().url()).pathname);

    return route.fulfill({ json: { message: 'ok' } });
  });

  return deleted;
};

/** Корзина → подтверждение → «Отмена» → снова корзина → «Удалить» */
const confirmDeletion = async (page: Page, trash: ReturnType<Page['getByTitle']>, title: string, name: string) => {
  // Сравниваем путь: параметры карты (?zoom=…) страница дописывает сама
  const pathBefore = new URL(page.url()).pathname;

  await trash.click();
  const dialog = page.getByRole('dialog', { name: title });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(name);
  expect(new URL(page.url()).pathname, 'клик по корзине не должен открывать карточку').toBe(pathBefore);

  await dialog.getByRole('button', { name: 'Отмена' }).click();
  await expect(dialog).toBeHidden();

  await trash.click();
  await page.getByRole('dialog', { name: title }).getByRole('button', { name: 'Удалить' }).click();
};

test.describe('Удаление с подтверждением (мобильная раскладка)', () => {
  test('город из списка городов', async ({ page }) => {
    const deleted = await trackDeletes(page);
    const group = GROUPS.find(({ id }) => id === 'group-3')!;

    await page.goto('/groups');
    const card = page.locator('[role=list] [data-slot=card]').filter({ hasText: group.name }).first();
    await confirmDeletion(page, card.getByTitle('Удалить'), 'Удалить населенный пункт?', 'Все связанные объекты');

    await expect.poll(() => deleted).toEqual([`/api/groups/${group.id}`]);
  });

  test('объект на странице города', async ({ page }) => {
    const deleted = await trackDeletes(page);
    const attraction = ATTRACTIONS.find(({ groupId }) => groupId === BIG_GROUP_ID)!;

    await page.goto(`/groups/${BIG_GROUP_ID}`);
    const card = page.locator('.grid [data-slot=card]').filter({ hasText: attraction.name }).first();
    await confirmDeletion(page, card.getByTitle('Удалить'), 'Удалить объект?', 'удалить');

    await expect.poll(() => deleted).toEqual([`/api/attractions/${attraction.id}`]);
  });

  test('объект на его собственной странице', async ({ page }) => {
    const deleted = await trackDeletes(page);
    const attraction = ATTRACTIONS.find(({ groupId }) => groupId === BIG_GROUP_ID)!;

    await page.goto(`/attractions/${attraction.id}`);
    await confirmDeletion(page, page.getByTitle('Удалить').first(), 'Удалить объект?', 'удалить');

    await expect.poll(() => deleted).toEqual([`/api/attractions/${attraction.id}`]);
  });
});
