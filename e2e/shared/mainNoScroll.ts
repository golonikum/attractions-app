import type { Page } from '@playwright/test';

import { expect, test } from '../fixtures/mockApi';

/**
 * Регресс: на главной появлялся вертикальный скроллбар у всей страницы. Живая карта Яндекса в тестах
 * не грузится, поэтому в блок карты подкладываем заведомо слишком высокое содержимое — страница
 * с картой всё равно не должна прокручиваться.
 */
const pageOverflow = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollHeight - window.innerHeight);

export const defineMainNoScrollTest = () =>
  test('главная не прокручивается, даже если содержимое карты выше экрана', async ({ page }) => {
    await page.goto('/main');
    const mapSlot = page.getByText('Загрузка карты...').locator('xpath=..');
    await expect(mapSlot).toBeVisible();
    expect(await pageOverflow(page)).toBeLessThanOrEqual(0);

    await mapSlot.evaluate((el) => {
      const tall = document.createElement('div');
      tall.style.height = '3000px';
      el.appendChild(tall);
    });

    expect(await pageOverflow(page)).toBeLessThanOrEqual(0);
  });
