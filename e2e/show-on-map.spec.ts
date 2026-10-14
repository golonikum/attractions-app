import type { Page } from '@playwright/test';

import { DEFAULT_ATTRACTION_ZOOM } from '../src/lib/constants';

import { ATTRACTIONS, BIG_GROUP_ID, GROUPS } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';

/**
 * Регресс: «На карте» открывало /main, но тут же затирало координаты в адресе параметрами
 * предыдущей страницы — useQueryParams читал window.location во время рендера, до смены URL.
 * Карта (SDK Яндекс Карт) в тестах заблокирована, поэтому проверяем то, из чего она берёт центр, — адрес.
 */

/** Ожидаемый адрес: координаты в URL — [lng, lat], в данных — [lat, lng] */
const expectMainUrl = async (page: Page, zoom: number, [lat, lng]: [number, number]) => {
  const expected = { zoom: String(zoom), coordinates: `${lng},${lat}` };
  const read = () => {
    const url = new URL(page.url());

    return { path: url.pathname, zoom: url.searchParams.get('zoom'), coordinates: url.searchParams.get('coordinates') };
  };

  await expect.poll(read, { message: 'должен открыться /main с координатами объекта' }).toEqual({
    path: '/main',
    ...expected,
  });

  // Адрес не должен потом перезаписаться (раньше это происходило сразу после перехода)
  await page.waitForTimeout(1000);
  expect(read()).toEqual({ path: '/main', ...expected });
};

test('«На карте» на карточке города открывает карту с координатами города', async ({ page }) => {
  const group = GROUPS.find(({ id }) => id === BIG_GROUP_ID)!;

  await page.goto('/groups');
  const card = page.locator('[role=list] [data-slot=card]').filter({ hasText: group.name }).first();
  await card.getByRole('link', { name: 'На карте' }).click();

  await expectMainUrl(page, group.zoom, group.coordinates);
});

test('«На карте» на странице объекта открывает карту с координатами объекта', async ({ page }) => {
  const attraction = ATTRACTIONS.find(({ groupId }) => groupId === BIG_GROUP_ID)!;

  await page.goto(`/attractions/${attraction.id}`);
  await page.getByTitle('На карте').first().click();

  await expectMainUrl(page, DEFAULT_ATTRACTION_ZOOM, attraction.coordinates);
});
