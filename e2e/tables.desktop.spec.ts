import type { Page } from '@playwright/test';

import { expect, test } from './fixtures/mockApi';

/**
 * Регресс: у виртуальных таблиц была фиксированная высота строки, и длинные названия/описания
 * вылезали из строки, перекрывая соседние (кнопки соседней строки становились некликабельными).
 */

/** Строки виртуальной таблицы, содержимое которых выше самой строки или которые наезжают на соседнюю */
const getRowProblems = (page: Page) =>
  page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[role=list] > [data-react-window-index]'))
      .map((row) => ({ row, rect: row.getBoundingClientRect() }))
      .sort((a, b) => a.rect.top - b.rect.top);

    const problems: string[] = [];

    /** Видимый низ элемента: обрезка предками внутри строки (overflow, например line-clamp) учитывается */
    const visibleBottom = (el: Element, row: Element) => {
      let bottom = el.getBoundingClientRect().bottom;

      for (let parent = el.parentElement; parent && parent !== row; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflowY !== 'visible') {
          bottom = Math.min(bottom, parent.getBoundingClientRect().bottom);
        }
      }

      return bottom;
    };

    rows.forEach(({ row, rect }, i) => {
      const index = row.getAttribute('data-react-window-index');
      const contentBottom = Math.max(...Array.from(row.querySelectorAll('*')).map((el) => visibleBottom(el, row)));

      if (contentBottom > rect.bottom + 1) {
        problems.push(`строка ${index}: содержимое ниже строки на ${Math.round(contentBottom - rect.bottom)}px`);
      }

      const next = rows[i + 1];

      if (next && next.rect.top < rect.bottom - 1) {
        problems.push(`строка ${index} наезжает на следующую на ${Math.round(rect.bottom - next.rect.top)}px`);
      }
    });

    return { count: rows.length, problems };
  });

const expectCleanTable = async (page: Page) => {
  await expect(page.locator('[role=list] > [data-react-window-index]').nth(2)).toBeVisible();
  // Высоты строк уточняются через ResizeObserver — ждём, пока проблемы не исчезнут (при баге они остаются)
  await expect.poll(async () => (await getRowProblems(page)).problems).toEqual([]);
};

test('таблица городов: строки не перекрывают друг друга', async ({ page }) => {
  await page.goto('/groups');
  await expectCleanTable(page);

  // Кнопки любой строки кликабельны — раньше клик в 4-й строке перехватывала соседняя
  await page.locator('[role=list] > [data-react-window-index="3"]').getByTitle('Удалить').click({ timeout: 5000 });
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('таблица поиска: строки не перекрывают друг друга', async ({ page }) => {
  await page.goto(`/search?search=${encodeURIComponent('Объект')}`);
  await expectCleanTable(page);
});
