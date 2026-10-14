import { defineConfig, devices } from '@playwright/test';

// Порт обычного `yarn dev`: Next.js 16 не запускает второй dev-сервер на той же .next,
// поэтому уже запущенный сервер переиспользуется (API всё равно подменяется в браузере)
const PORT = Number(process.env.E2E_PORT) || 3000;
const DESKTOP_SPECS = /\.desktop\.spec\.ts$/;

/**
 * E2E-тесты вёрстки. API подменяется в браузере (e2e/fixtures/mockApi.ts), поэтому
 * сервер Next.js нужен только для отдачи страниц — БД и ключи из .env не используются.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Под параллельной нагрузкой dev-сервер иногда отвечает дольше таймаутов; повтор помечается в отчёте как flaky
  retries: 1,
  // dev-сервер компилирует страницы при первом запросе — много воркеров только мешают друг другу
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  // Под параллельной нагрузкой dev-сервер отдаёт тяжёлые страницы (галерея) дольше 10 с
  expect: { timeout: 20_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Запросы через Service Worker (public/sw.js) не видны page.route — моки API перестали бы работать
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Мобильные и планшет — все спеки, кроме десктопных (*.desktop.spec.ts)
    ...[
      { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
      { name: 'iphone-13', use: { ...devices['iPhone 13'] } },
      { name: 'iphone-se', use: { ...devices['iPhone SE'] } },
      { name: 'narrow-320', use: { ...devices['Pixel 7'], viewport: { width: 320, height: 640 } } },
      { name: 'ipad-mini', use: { ...devices['iPad Mini'] } },
    ].map((project) => ({ ...project, testIgnore: DESKTOP_SPECS })),
    // Десктопная раскладка (от 1024px: карта + таблицы) — только *.desktop.spec.ts
    ...[
      { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
      { name: 'desktop-safari', use: { ...devices['Desktop Safari'] } },
    ].map((project) => ({ ...project, testMatch: DESKTOP_SPECS })),
  ],
  webServer: {
    command: `yarn dev --port ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
