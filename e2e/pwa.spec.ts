import { expect, test } from './fixtures/mockApi';

// Здесь нужен настоящий Service Worker — в остальных тестах он заблокирован
test.use({ serviceWorkers: 'allow' });

test('первая установка Service Worker не перезагружает страницу', async ({ page, pageErrors, browserName }) => {
  // Баг проявлялся в Safari/WebKit. В Chromium под Playwright предзагрузка sw.js (cache.add) зависает
  // из-за перехвата запросов page.route, и SW навсегда остаётся в состоянии installing
  test.skip(browserName === 'chromium', 'в Chromium под page.route установка SW не завершается');
  test.setTimeout(90_000);
  const documentLoads: string[] = [];

  page.on('request', (request) => {
    if (request.resourceType() === 'document' && request.frame() === page.mainFrame()) {
      documentLoads.push(request.url());
    }
  });

  await page.goto('/groups');
  // ready — SW установлен и активирован; при установке он предзагружает страницы, на dev-сервере это небыстро
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  // Даём время сработать обработчику updatefound/statechange из PWALayout
  await page.waitForTimeout(2_000);

  expect(documentLoads, 'страница должна загрузиться один раз').toHaveLength(1);

  // После того как SW взял управление, его запросы идут мимо моков на настоящий сервер —
  // возможные ошибки оттуда к этому тесту не относятся
  pageErrors.length = 0;
});
