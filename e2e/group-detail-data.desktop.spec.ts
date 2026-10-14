import type { Page } from '@playwright/test';

import { ATTRACTIONS, BIG_GROUP_ID, EMPTY_GROUP_ID } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';

/**
 * Регресс: страница города записывала в общий список объектов (DataContext) только объекты
 * этого города — после перетаскивания или добавления объекта пропадали объекты всех остальных городов.
 * Десктопная раскладка (проекты desktop-* в playwright.config.ts): таблица городов со счётчиками
 * и таблица объектов с перетаскиванием.
 */

/** Сумма счётчиков «(N)» в видимых строках таблицы городов на /groups */
const sumGroupCounters = async (page: Page) => {
  await expect(page.locator('span.font-normal').first()).toBeVisible();
  const texts = await page.locator('span.font-normal').allTextContents();

  return texts.map((text) => Number(text.replace(/\D/g, '')) || 0).reduce((sum, value) => sum + value, 0);
};

/** Таблица городов дорисовывается не сразу — ждём, пока сумма перестанет меняться */
const readStableSum = async (page: Page) => {
  let previous = -1;

  for (let i = 0; i < 20; i++) {
    const current = await sumGroupCounters(page);

    if (current === previous && current > 0) {
      return current;
    }

    previous = current;
    await page.waitForTimeout(250);
  }

  return previous;
};

const backToGroups = async (page: Page) => {
  await page.getByRole('button', { name: 'Назад' }).click();
  await expect(page).toHaveURL(/\/groups(\?|$)/);
};

test('перетаскивание объектов в городе не теряет объекты других городов', async ({ page }) => {
  const orderRequests: unknown[] = [];

  await page.route('**/api/order', (route) => {
    orderRequests.push(route.request().postDataJSON());

    return route.fulfill({ json: {} });
  });

  await page.goto('/groups');
  const before = await readStableSum(page);

  await page.goto(`/groups/${BIG_GROUP_ID}`);
  const handles = page.getByText('☰', { exact: true });
  await expect(handles.nth(3)).toBeVisible();

  const from = (await handles.nth(0).boundingBox())!;
  const to = (await handles.nth(3).boundingBox())!;

  // dnd-kit включает перетаскивание после сдвига на 8px
  await page.mouse.move(from.x + 5, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 5, from.y + from.height / 2 + 12, { steps: 5 });
  await page.mouse.move(to.x + 5, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect.poll(() => orderRequests.length, { message: 'порядок должен уйти на сервер' }).toBe(1);

  await backToGroups(page);
  // poll не маскирует регресс: при баге сумма так и остаётся меньше
  await expect.poll(() => sumGroupCounters(page)).toBe(before);
});

test('добавление объекта в пустой город не теряет объекты других городов, пока идёт перезагрузка', async ({ page }) => {
  let attractions = [...ATTRACTIONS];
  let releaseReload: () => void = () => {};
  const reloadReleased = new Promise<void>((resolve) => {
    releaseReload = resolve;
  });
  // Включается перед нажатием «Создать»: задерживаем только фоновый reload после добавления
  let holdReload = false;

  await page.route('**/api/attractions**', async (route) => {
    const request = route.request();

    if (request.method() === 'POST') {
      const created = { ...request.postDataJSON(), id: 'created', userId: 'user-1', createdAt: '', updatedAt: '' };
      attractions = [...attractions, created];

      return route.fulfill({ status: 201, json: { attraction: created } });
    }

    if (holdReload) {
      await reloadReleased;
    }

    return route.fulfill({ json: { attractions } });
  });

  await page.goto('/groups');
  const before = await readStableSum(page);

  await page.goto(`/groups/${EMPTY_GROUP_ID}`);
  await expect(page.getByRole('heading', { name: 'Нет объектов' })).toBeVisible();
  await page.getByTitle('Добавить новый объект').click();
  await page.locator('#name').fill('Первый объект');
  holdReload = true;
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  await expect(page.getByText('Объект успешно создан')).toBeVisible();

  // Перезагрузка ещё не ответила — общий список должен содержать все объекты плюс новый
  await backToGroups(page);
  await expect.poll(() => sumGroupCounters(page)).toBeGreaterThanOrEqual(before);

  releaseReload();
  await page.waitForTimeout(500);
  await expect.poll(() => sumGroupCounters(page)).toBeGreaterThanOrEqual(before);
});
