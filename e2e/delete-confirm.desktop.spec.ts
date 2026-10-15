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

test.describe('Удаление с подтверждением (десктопные таблицы)', () => {
  test('город из таблицы городов', async ({ page }) => {
    const deleted = await trackDeletes(page);
    const [group] = GROUPS;

    await page.goto('/groups');
    const row = page.locator('[role=list] > [data-react-window-index="0"]');
    await row.getByTitle('Удалить').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(group.name);
    await dialog.getByRole('button', { name: 'Отмена' }).click();
    await expect(dialog).toBeHidden();
    expect(deleted).toEqual([]);

    await row.getByTitle('Удалить').click();
    await page.getByRole('dialog').getByRole('button', { name: 'Удалить' }).click();
    await expect.poll(() => deleted).toEqual([`/api/groups/${group.id}`]);
  });

  test('объект из таблицы объектов города', async ({ page }) => {
    const deleted = await trackDeletes(page);
    const attraction = ATTRACTIONS.find(({ groupId, name }) => groupId === BIG_GROUP_ID && !name.startsWith('Очень'))!;

    await page.goto(`/groups/${BIG_GROUP_ID}`);
    const trash = page
      .getByText(attraction.name, { exact: true })
      .locator('xpath=ancestor::*[.//*[@title="Удалить"]][1]')
      .getByTitle('Удалить');
    await trash.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(attraction.name);
    await dialog.getByRole('button', { name: 'Удалить' }).click();
    await expect.poll(() => deleted).toEqual([`/api/attractions/${attraction.id}`]);
  });
});
