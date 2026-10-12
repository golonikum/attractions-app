import { expect, type Page } from '@playwright/test';

import { getCardSpacing, getDoubleScroll, getHorizontalOverflow } from './layout';

/** Допустимый разброс промежутков между карточками, px */
const GAP_SPREAD = 2;
/** Сколько ждать, пока раскладка перестанет меняться, мс */
const SETTLE_TIMEOUT = 3_000;

/**
 * Виртуальный список сначала ставит строки по оценочной высоте и уточняет её через ResizeObserver
 * в следующих кадрах — замеряем, когда два замера подряд совпали, а не в момент первого кадра
 */
const getStableCardSpacing = async (page: Page, container: string) => {
  const deadline = Date.now() + SETTLE_TIMEOUT;
  let previous = await getCardSpacing(page, container);
  let sameCount = 0;

  // Под нагрузкой ResizeObserver срабатывает с задержкой — требуем три одинаковых замера подряд
  while (Date.now() < deadline && sameCount < 2) {
    await page.waitForTimeout(150);
    const current = await getCardSpacing(page, container);

    sameCount = JSON.stringify(current) === JSON.stringify(previous) ? sameCount + 1 : 0;
    previous = current;
  }

  return previous;
};

/**
 * Базовые требования к вёрстке списка карточек в container:
 * карточки не наезжают друг на друга, промежутки между ними одинаковые,
 * нет горизонтальной прокрутки и одновременной прокрутки страницы и списка.
 */
export const expectCleanList = async (page: Page, container: string, { minCards = 1 } = {}) => {
  const spacing = await getStableCardSpacing(page, container);

  expect(spacing.count, 'карточки должны быть видны').toBeGreaterThanOrEqual(minCards);
  expect(spacing.overlaps, 'карточки не должны наезжать друг на друга').toEqual([]);

  // В многоколоночной сетке ряд по высоте равен самой высокой карточке, под короткими остаётся место —
  // это нормальное поведение CSS grid, поэтому равенство промежутков проверяем только для одной колонки
  if (spacing.gaps.length && spacing.columns === 1) {
    const spread = Math.max(...spacing.gaps) - Math.min(...spacing.gaps);

    expect(
      spread,
      `промежутки между карточками должны быть одинаковыми: ${spacing.gaps.join(', ')}`,
    ).toBeLessThanOrEqual(GAP_SPREAD);
  }

  expect(await getHorizontalOverflow(page), 'не должно быть горизонтальной прокрутки').toBeNull();
  expect(await getDoubleScroll(page), 'страница и список не должны прокручиваться одновременно').toBeNull();
};
