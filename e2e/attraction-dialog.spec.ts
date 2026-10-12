import { BIG_GROUP_ID } from './fixtures/data';
import { expect, test } from './fixtures/mockApi';

// Внешние хосты в mockApi обрываются; маршрут, зарегистрированный позже, срабатывает раньше
const IMAGE_URL = 'https://images.test/photo.png';
const BROKEN_URL = 'https://images.test/missing.png';
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('Превью изображения в диалоге объекта', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(IMAGE_URL, (route) => route.fulfill({ contentType: 'image/png', body: PIXEL_PNG }));
    await page.route(BROKEN_URL, (route) => route.fulfill({ status: 404, body: '' }));

    await page.goto(`/groups/${BIG_GROUP_ID}`);
    await page.getByTitle('Добавить новый объект').click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('без ссылки — заглушка, со ссылкой — картинка, битая ссылка — ошибка', async ({ page }) => {
    const input = page.locator('#imageUrl');
    const preview = page.getByTestId('image-url-preview');

    await expect(preview).not.toHaveAttribute('data-status');

    await input.fill(IMAGE_URL);
    await expect(preview).toHaveAttribute('data-status', 'loaded');
    await expect(preview).toHaveAttribute('href', IMAGE_URL);
    await expect(preview.getByRole('img')).toBeVisible();

    await input.fill(BROKEN_URL);
    await expect(preview).toHaveAttribute('data-status', 'error');
    await expect(preview).toHaveAttribute('title', 'Не удалось загрузить изображение');

    // Некорректная ссылка — снова заглушка, без запроса картинки
    await input.fill('не ссылка');
    await expect(preview).not.toHaveAttribute('data-status');
  });

  test('превью не ломает вёрстку поля', async ({ page }) => {
    await page.locator('#imageUrl').fill(IMAGE_URL);

    const inputBox = (await page.locator('#imageUrl').boundingBox())!;
    const previewBox = (await page.getByTestId('image-url-preview').boundingBox())!;

    expect(Math.abs(previewBox.height - inputBox.height)).toBeLessThanOrEqual(1);
    expect(previewBox.x).toBeGreaterThan(inputBox.x + inputBox.width);
    expect(Math.abs(previewBox.y - inputBox.y)).toBeLessThanOrEqual(1);
  });
});
