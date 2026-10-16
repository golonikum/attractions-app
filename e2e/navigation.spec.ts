import { BIG_GROUP_ID } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';

/** Регресс: шапка была полупрозрачной (bg-background/80 + blur) — при прокрутке сквозь неё просвечивали карточки */
test('шапка непрозрачна при прокрутке объектов на странице города', async ({ page }) => {
  await page.goto(`/groups/${BIG_GROUP_ID}`);
  await expect(page.locator('[data-slot=card]').nth(1)).toBeVisible();
  // mouse.wheel не поддерживается в мобильном WebKit — прокручиваем страницу напрямую
  await page.evaluate(() => window.scrollBy(0, 1500));
  await page.waitForTimeout(300);

  const background = await page
    .locator('nav')
    .first()
    .evaluate((nav) => {
      // Нормализуем цвет через canvas: getComputedStyle может вернуть oklch(), rgb() или color(...)
      const ctx = document.createElement('canvas').getContext('2d')!;
      ctx.fillStyle = getComputedStyle(nav).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);

      return { alpha: ctx.getImageData(0, 0, 1, 1).data[3], backdrop: getComputedStyle(nav).backdropFilter };
    });

  expect(background.alpha, 'фон шапки должен быть полностью непрозрачным').toBe(255);
  expect(background.backdrop === 'none' || !background.backdrop).toBe(true);
});
