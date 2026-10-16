import { ATTRACTIONS } from './fixtures/data';
import { expect, PIXEL_PNG, test } from './fixtures/mockApi';

/**
 * Регресс: при смене фото (например, другой объект в окне на главной) next/image переиспользовал <img>,
 * и браузер показывал старое фото, пока не загрузится новое. Здесь фото меняется через редактирование
 * объекта — тот же компонент AttractionImage, без перезагрузки страницы.
 */
test('при смене фото старое не показывается, пока грузится новое', async ({ page }) => {
  const attraction = ATTRACTIONS.find(({ imageUrl }) => imageUrl)!;
  const NEW_URL = 'https://avatars.mds.yandex.net/get-altay/1/999999/orig';
  let releaseNewImage: () => void = () => {};
  const newImageReleased = new Promise<void>((resolve) => {
    releaseNewImage = resolve;
  });

  // Новое фото «грузится», пока тест его не отпустит
  await page.route('**/_next/image**', async (route) => {
    if (new URL(route.request().url()).searchParams.get('url') === NEW_URL) {
      await newImageReleased;
    }

    return route.fulfill({ contentType: 'image/png', body: PIXEL_PNG });
  });
  // Сохранённое изменение должно приходить и в фоновой перезагрузке списка, иначе она вернёт старое фото
  let attractions = ATTRACTIONS;

  await page.route('**/api/attractions**', (route) => {
    if (route.request().method() !== 'PUT') {
      return route.fulfill({ json: { attractions } });
    }

    const updated = { ...attraction, ...route.request().postDataJSON() };
    attractions = attractions.map((item) => (item.id === updated.id ? updated : item));

    return route.fulfill({ json: { attraction: updated } });
  });

  await page.goto(`/attractions/${attraction.id}`);
  const image = page.getByRole('img', { name: attraction.name });
  await expect(image).toHaveCSS('opacity', '1');

  await page.getByTitle('Изменить').first().click();
  await page.locator('#imageUrl').fill(NEW_URL);
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();

  // Новое фото ещё не загружено: на месте старого — прозрачная картинка с новым адресом
  await expect(image).toHaveAttribute('src', new RegExp(encodeURIComponent(NEW_URL)));
  await expect(image).toHaveCSS('opacity', '0');

  releaseNewImage();
  await expect(image).toHaveCSS('opacity', '1');
});
