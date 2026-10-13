import { readFile } from 'node:fs/promises';

import type { Page } from '@playwright/test';

import { BACKUP_FORMAT, BACKUP_VERSION, type Backup } from '../src/lib/backup/format';

import { ATTRACTIONS, GROUPS } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';
import { getHorizontalOverflow } from './helpers/layout';

// Серверная часть (транзакция, конфликты id) проверяется на реальной БД; здесь — диалог и обмен с API
const BACKUP: Backup = {
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: '2026-10-01T12:00:00.000Z',
  groups: GROUPS.map(({ userId: _userId, updatedAt: _updatedAt, ...group }) => group),
  attractions: ATTRACTIONS.map(({ userId: _userId, updatedAt: _updatedAt, ...attraction }) => attraction),
};

const STATS = {
  groups: { created: 2, updated: 58 },
  attractions: { created: 5, updated: ATTRACTIONS.length - 5 },
  skippedAttractions: 0,
  duplicates: 0,
};

const openDialog = async (page: Page) => {
  await page.goto('/groups');
  await page.getByTitle('Резервная копия').click();
  await expect(page.getByRole('dialog', { name: 'Резервная копия' })).toBeVisible();
};

const chooseFile = (page: Page, content: string, name = 'attractions-backup.json') =>
  page.locator('#backup-file').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(content) });

test.describe('Резервная копия: экспорт и импорт', () => {
  let posted: { mode: string; backup: Backup } | undefined;

  test.beforeEach(async ({ page }) => {
    posted = undefined;
    // Маршрут, зарегистрированный позже общих моков, срабатывает раньше них
    await page.route('**/api/backup', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ json: BACKUP });
      }

      posted = route.request().postDataJSON();

      return route.fulfill({ json: { stats: STATS } });
    });
  });

  test('экспорт: скачивается файл с данными с сервера', async ({ page }) => {
    await openDialog(page);
    await expect(page.getByText(`Городов: ${GROUPS.length}, объектов: ${ATTRACTIONS.length}`)).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Скачать резервную копию' }).click(),
    ]);

    expect(download.suggestedFilename()).toBe('attractions-backup-2026-10-01.json');
    expect(JSON.parse(await readFile((await download.path())!, 'utf-8'))).toEqual(BACKUP);
  });

  test('импорт «Добавить и обновить»: файл уходит на сервер без подтверждения', async ({ page }) => {
    await openDialog(page);
    const importButton = page.getByRole('button', { name: 'Импортировать' });

    await expect(importButton).toBeDisabled();
    await chooseFile(page, JSON.stringify(BACKUP));
    await expect(page.getByTestId('backup-file-summary')).toContainText(
      `городов ${GROUPS.length}, объектов ${ATTRACTIONS.length}`,
    );

    await importButton.click();
    await expect(page.getByText('Импорт завершён')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();

    expect(posted?.mode).toBe('merge');
    expect(posted?.backup).toEqual(BACKUP);
  });

  test('импорт «Заменить всё»: только после подтверждения', async ({ page }) => {
    await openDialog(page);
    await chooseFile(page, JSON.stringify(BACKUP));
    await page.getByLabel(/Заменить всё/).check();
    await page.getByRole('button', { name: 'Импортировать' }).click();

    const confirm = page.getByRole('dialog', { name: 'Заменить все данные?' });

    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Отмена' }).click();
    expect(posted, 'без подтверждения ничего не отправляется').toBeUndefined();

    await page.getByRole('button', { name: 'Импортировать' }).click();
    await page.getByRole('dialog', { name: 'Заменить все данные?' }).getByRole('button', { name: 'Заменить' }).click();
    await expect(page.getByText('Импорт завершён')).toBeVisible();
    expect(posted?.mode).toBe('replace');
  });

  test('битые файлы не принимаются', async ({ page }) => {
    await openDialog(page);
    const importButton = page.getByRole('button', { name: 'Импортировать' });

    await chooseFile(page, 'это не json');
    await expect(page.getByRole('alert')).toHaveText('Файл не является JSON');
    await expect(importButton).toBeDisabled();

    await chooseFile(page, JSON.stringify({ type: 'FeatureCollection', features: [] }));
    await expect(page.getByRole('alert')).toContainText('Это не файл резервной копии');
    await expect(importButton).toBeDisabled();

    const broken = { ...BACKUP, attractions: [{ ...BACKUP.attractions[0], coordinates: 'нет' }] };
    await chooseFile(page, JSON.stringify(broken));
    await expect(page.getByRole('alert')).toContainText('Файл повреждён: attractions.0.coordinates');
    await expect(importButton).toBeDisabled();
    expect(posted).toBeUndefined();
  });

  test('диалог и кнопка в шапке не вылезают за экран', async ({ page }) => {
    await page.goto('/groups');
    await expect(page.getByTitle('Резервная копия')).toBeVisible();
    expect(await getHorizontalOverflow(page)).toBeNull();

    await page.getByTitle('Резервная копия').click();
    await chooseFile(page, JSON.stringify(BACKUP));
    expect(await getHorizontalOverflow(page)).toBeNull();
  });
});
