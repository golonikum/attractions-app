import { expect, test } from './fixtures/mockApi';

/**
 * Регресс: кнопка «Установить приложение» (position: fixed) рендерилась внутри шапки с backdrop-blur,
 * а backdrop-filter делает элемент точкой отсчёта для fixed-потомков — кнопка уезжала в шапку наверх.
 */
test('кнопка «Установить приложение» в правом нижнем углу экрана', async ({ page }) => {
  await page.goto('/groups');
  await expect(page.locator('[data-slot=card]').first()).toBeVisible();

  // Браузер сам шлёт beforeinstallprompt, когда PWA можно установить; в тесте имитируем его
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt: () => {}, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
    window.dispatchEvent(event);
  });

  const button = page.getByRole('button', { name: 'Установить приложение' });
  await expect(button).toBeVisible();

  const box = (await button.boundingBox())!;
  const viewport = page.viewportSize()!;
  // bottom-4 / right-4 — 16px от краёв экрана
  expect(Math.round(viewport.width - (box.x + box.width))).toBe(16);
  expect(Math.round(viewport.height - (box.y + box.height))).toBe(16);
});
