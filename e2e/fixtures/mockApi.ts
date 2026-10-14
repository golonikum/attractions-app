import { expect, test as base } from '@playwright/test';

import { ATTRACTIONS, GROUPS, USER } from './data';

// Прозрачный PNG 1×1 вместо картинок: тесты не ходят в интернет
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * Шум, который появляется из-за того, что в тестах внешние запросы обрываются, а Service Worker
 * заблокирован (serviceWorkers: 'block' в playwright.config.ts) — register() тогда возвращает undefined
 */
const IGNORED_CONSOLE_ERRORS = [
  /Failed to load resource/i,
  /net::ERR_FAILED/i,
  /ymaps3/i,
  /api-maps\.yandex/i,
  // На десктопной раскладке карта пытается инициализироваться, но SDK Яндекс Карт заблокирован
  /Ошибка при инициализации Yandex Maps/i,
  /Service Worker registration failed/i,
];

type Fixtures = {
  /** console.error и необработанные исключения страницы — после теста проверяется, что их нет */
  pageErrors: string[];
};

/**
 * test с подменённым API: авторизованный пользователь и данные из ./data.
 * Вся логика приложения работает как обычно, но без БД, cookies и внешних сервисов.
 */
export const test = base.extend<Fixtures>({
  pageErrors: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = [];
      const appOrigin = new URL(baseURL!).origin;

      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error' && !IGNORED_CONSOLE_ERRORS.some((re) => re.test(message.text()))) {
          errors.push(`console.error: ${message.text()}`);
        }
      });

      await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());

        if (url.origin !== appOrigin) {
          return route.abort();
        }

        if (url.pathname.startsWith('/_next/image')) {
          return route.fulfill({ contentType: 'image/png', body: PIXEL_PNG });
        }

        if (!url.pathname.startsWith('/api/')) {
          return route.continue();
        }

        if (url.pathname === '/api/auth') {
          return route.fulfill({ json: { authenticated: true, user: USER } });
        }

        if (route.request().method() !== 'GET') {
          return route.fulfill({ json: {} });
        }

        if (url.pathname === '/api/groups') {
          return route.fulfill({ json: { groups: GROUPS } });
        }

        if (url.pathname === '/api/attractions') {
          const groupId = url.searchParams.get('groupId');

          return route.fulfill({
            json: { attractions: groupId ? ATTRACTIONS.filter((item) => item.groupId === groupId) : ATTRACTIONS },
          });
        }

        return route.fulfill({ status: 404, json: { error: `Нет мока для ${url.pathname}` } });
      });

      await use(errors);

      expect(errors, 'на странице не должно быть ошибок').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
