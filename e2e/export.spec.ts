import { readFile } from 'node:fs/promises';

import type { Page } from '@playwright/test';

import type { ConstructorFeatureCollection } from '../src/lib/export/yandexConstructor';

import { ATTRACTIONS, GROUPS } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';
import { getHorizontalOverflow } from './helpers/layout';

const EXPORT_BUTTON = 'Экспорт в Яндекс Карты';

/** Открыть диалог экспорта, скачать файл и вернуть его содержимое */
const exportFile = async (page: Page) => {
  await page.getByTitle(EXPORT_BUTTON).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await getHorizontalOverflow(page), 'диалог не должен вылезать за экран').toBeNull();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Скачать файл' }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/^attractions-.+-\d{4}-\d{2}-\d{2}\.geojson$/);

  return JSON.parse(await readFile((await download.path())!, 'utf-8')) as ConstructorFeatureCollection;
};

test.describe('Экспорт в Яндекс Карты (файл для Конструктора карт)', () => {
  test('поиск: один объект, координаты в порядке [lng, lat], цвет по категории', async ({ page }) => {
    const attraction = ATTRACTIONS.find((item) => item.name === 'Объект 2005')!;

    await page.goto(`/search?search=${encodeURIComponent(attraction.name)}`);
    const collection = await exportFile(page);

    expect(collection.type).toBe('FeatureCollection');
    expect(collection.metadata.name).toBe(`Поиск: ${attraction.name}`);
    expect(collection.features).toHaveLength(1);

    const [feature] = collection.features;

    expect(feature.geometry).toEqual({
      type: 'Point',
      coordinates: [attraction.coordinates[1], attraction.coordinates[0]],
    });
    expect(feature.properties.iconCaption).toBe(attraction.name);
    expect(feature.properties['marker-color']).toBe('#1bad03'); // «Природа»
    expect(feature.properties.description).toContain(attraction.yaMapUrl!);
  });

  test('список городов по региону: в файле ровно объекты городов этого региона', async ({ page }) => {
    const tag = GROUPS.find((group) => group.tag)!.tag!;
    const groupIds = new Set(GROUPS.filter((group) => group.tag === tag).map((group) => group.id));
    const expected = ATTRACTIONS.filter((item) => groupIds.has(item.groupId)).map((item) => item.name);

    await page.goto(`/groups?tag=${encodeURIComponent(tag)}`);
    await expect(page.locator('[data-slot=card], [role=list] > *').first()).toBeVisible();
    const collection = await exportFile(page);

    expect(collection.metadata.name).toBe(`Регионы: ${tag}`);
    expect(collection.features.map((feature) => feature.properties.iconCaption).sort()).toEqual(expected.sort());
  });

  test('нечего экспортировать — кнопка недоступна', async ({ page }) => {
    await page.goto(`/search?search=${encodeURIComponent('такого объекта нет')}`);
    await expect(page.getByRole('heading', { name: 'Нет объектов, соответствующих поисковому запросу' })).toBeVisible();
    await expect(page.getByTitle(EXPORT_BUTTON)).toBeDisabled();
  });
});
