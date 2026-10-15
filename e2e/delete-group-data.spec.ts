import { ATTRACTIONS, GROUPS } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';

/**
 * Регресс: после удаления города его объекты оставались в общем списке на клиенте
 * (сервер удаляет их каскадом) — например, находились в поиске до перезагрузки страницы.
 */
test('после удаления города его объекты пропадают из поиска', async ({ page }) => {
  const group = GROUPS.find(({ id }) => id === 'group-3')!;
  const objectName = ATTRACTIONS.find(({ groupId }) => groupId === group.id)!.name;
  let groups = [...GROUPS];
  let attractions = [...ATTRACTIONS];

  // Сервер с состоянием: удаление города удаляет и его объекты (как каскад в БД)
  await page.route('**/api/groups**', (route) => {
    if (route.request().method() === 'DELETE') {
      groups = groups.filter(({ id }) => id !== group.id);
      attractions = attractions.filter(({ groupId }) => groupId !== group.id);

      return route.fulfill({ json: { message: 'ok' } });
    }

    return route.fulfill({ json: { groups } });
  });
  await page.route('**/api/attractions**', (route) => route.fulfill({ json: { attractions } }));

  await page.goto('/groups');
  const card = page.locator('[role=list] [data-slot=card]').filter({ hasText: group.name }).first();
  await card.getByTitle('Удалить').click();
  await page
    .getByRole('dialog', { name: 'Удалить населенный пункт?' })
    .getByRole('button', { name: 'Удалить' })
    .click();
  await expect(page.getByText('Группа успешно удалена')).toBeVisible();

  // Клиентский переход: данные берутся из контекста, а не загружаются заново
  // На телефоне ссылки спрятаны в меню, с 768px — видны сразу
  const menuButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-menu') });

  if (page.viewportSize()!.width < 768) {
    await menuButton.click();
  }

  await page.getByRole('link', { name: 'Поиск' }).click();
  await expect(page).toHaveURL(/\/search/);
  await page.getByPlaceholder('Поиск...').fill(objectName);
  await page.waitForTimeout(800); // поиск срабатывает с задержкой 500 мс

  await expect(page.getByText(objectName, { exact: true })).toHaveCount(0);
});
