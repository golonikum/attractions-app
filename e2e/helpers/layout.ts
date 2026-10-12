import type { Page } from '@playwright/test';

/** Допуск в пикселях на дробные размеры и округление */
const TOLERANCE = 2;

export interface SpacingReport {
  /** Сколько карточек видно в контейнере */
  count: number;
  /** Сколько колонок карточек */
  columns: number;
  /** Промежутки между соседними карточками одной колонки, px (отрицательные — наезд) */
  gaps: number[];
  /** Пары карточек, которые перекрываются: «верхняя → нижняя: на сколько px» */
  overlaps: string[];
}

/**
 * Промежутки между соседними карточками `[data-slot=card]` внутри container (по колонкам).
 * Работает и для виртуального списка react-window, и для обычной сетки.
 */
export const getCardSpacing = (page: Page, container: string) =>
  page.evaluate(
    ({ container: selector, tolerance }): SpacingReport => {
      const root = document.querySelector(selector);

      if (!root) {
        throw new Error(`Не найден контейнер ${selector}`);
      }

      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-slot=card]'))
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.height > 0);

      const columns = new Map<number, typeof cards>();

      cards.forEach((card) => {
        const left = Math.round(card.rect.left);
        columns.set(left, [...(columns.get(left) ?? []), card]);
      });

      const gaps: number[] = [];
      const overlaps: string[] = [];
      const label = (el: HTMLElement) => (el.querySelector('h3')?.textContent ?? el.textContent ?? '').slice(0, 40);

      columns.forEach((column) => {
        column.sort((a, b) => a.rect.top - b.rect.top);

        for (let i = 1; i < column.length; i++) {
          const gap = column[i].rect.top - column[i - 1].rect.bottom;
          gaps.push(Math.round(gap));

          if (gap < -tolerance) {
            overlaps.push(`«${label(column[i - 1].el)}» → «${label(column[i].el)}»: ${Math.round(-gap)}px`);
          }
        }
      });

      return { count: cards.length, columns: columns.size, gaps, overlaps };
    },
    { container, tolerance: TOLERANCE },
  );

/** Элементы, вылезающие за правый край экрана, если у страницы есть горизонтальная прокрутка */
export const getHorizontalOverflow = (page: Page) =>
  page.evaluate((tolerance) => {
    const { scrollWidth } = document.documentElement;

    if (scrollWidth <= window.innerWidth + tolerance) {
      return null;
    }

    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${String(el.className).split(' ').slice(0, 4).join('.')}`;

    // Элемент внутри предка с overflow: hidden/clip/auto, который сам помещается, страницу не расширяет (слайды, карусели)
    const isClipped = (el: Element) => {
      for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflowX !== 'visible') {
          return parent.getBoundingClientRect().right <= window.innerWidth + tolerance;
        }
      }

      return false;
    };

    const culprits = Array.from(document.body.querySelectorAll('*'))
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + tolerance && !isClipped(el))
      // оставляем самые глубокие — их родители вылезают из-за них
      .filter((el, _, all) => !all.some((other) => other !== el && el.contains(other)))
      .slice(0, 5)
      .map((el) => `${describe(el)} (right=${Math.round(el.getBoundingClientRect().right)}, vw=${window.innerWidth})`);

    return { scrollWidth, innerWidth: window.innerWidth, culprits };
  }, TOLERANCE);

/** Прокручиваются одновременно и страница, и внутренний контейнер виртуального списка */
export const getDoubleScroll = (page: Page) =>
  page.evaluate((tolerance) => {
    const list = document.querySelector<HTMLElement>('[role=list]');
    const pageEl = document.scrollingElement!;
    const pageScrollable = pageEl.scrollHeight > window.innerHeight + tolerance;
    const listScrollable = !!list && list.scrollHeight > list.clientHeight + tolerance;

    return pageScrollable && listScrollable
      ? `страница прокручивается на ${pageEl.scrollHeight - window.innerHeight}px и список — на ${
          list!.scrollHeight - list!.clientHeight
        }px`
      : null;
  }, TOLERANCE);

/** Прокрутить виртуальный список (если есть) и страницу до конца — как сделал бы пользователь */
export const scrollToEnd = async (page: Page) => {
  // Виртуальный список дорисовывает строки и уточняет высоты (ResizeObserver) уже после прокрутки,
  // из-за чего его полная высота растёт — крутим, пока позиция не простоит на месте несколько замеров подряд
  let stableTicks = 0;

  for (let i = 0; i < 100 && stableTicks < 3; i++) {
    const moved = await page.evaluate(() => {
      const list = document.querySelector<HTMLElement>('[role=list]');
      const pageEl = document.scrollingElement!;
      const before = (list?.scrollTop ?? 0) + pageEl.scrollTop;

      list?.scrollTo({ top: list.scrollHeight });
      window.scrollTo({ top: pageEl.scrollHeight });

      return (list?.scrollTop ?? 0) + pageEl.scrollTop !== before;
    });

    stableTicks = moved ? 0 : stableTicks + 1;
    await page.waitForTimeout(150);
  }
};

/** Прокрутить виртуальный список до доли fraction (0…1) его высоты */
export const scrollListTo = async (page: Page, fraction: number) => {
  await page.evaluate((f) => {
    const list = document.querySelector<HTMLElement>('[role=list]');
    list?.scrollTo({ top: (list.scrollHeight - list.clientHeight) * f });
  }, fraction);
  await page.waitForTimeout(300);
};

/**
 * Последняя карточка в container видна целиком в видимой области.
 * Для виртуального списка дополнительно проверяется, что отрисована именно последняя строка.
 */
export const getLastCardVisibility = (page: Page, container: string, expectedCount?: number) =>
  page.evaluate(
    ({ container: selector, expectedCount: total, tolerance }) => {
      const root = document.querySelector(selector);
      const isVirtual = !!root?.matches('[role=list]');
      let last: HTMLElement | null | undefined;

      if (isVirtual && total !== undefined) {
        // Виртуальный список рисует строки с запасом ниже экрана — берём строку именно с последним индексом
        const row = root!.querySelector(`:scope > [data-react-window-index="${total - 1}"]`);

        if (!row) {
          const indexes = Array.from(root!.children)
            .map((el) => Number(el.getAttribute('data-react-window-index')))
            .filter(Number.isFinite);

          return `не отрисована последняя строка (${total - 1}), последняя отрисованная: ${Math.max(...indexes)}`;
        }

        last = row.querySelector<HTMLElement>('[data-slot=card]');
      } else {
        last = Array.from(root?.querySelectorAll<HTMLElement>('[data-slot=card]') ?? [])
          .sort((a, b) => a.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom)
          .at(-1);
      }

      if (!last) {
        return 'нет карточек';
      }

      const viewportBottom = window.visualViewport?.height ?? window.innerHeight;
      const { bottom } = last.getBoundingClientRect();
      const clipRoot = root?.matches('[role=list]') ? root.getBoundingClientRect() : null;
      const visibleBottom = Math.min(viewportBottom, clipRoot?.bottom ?? Infinity);

      // Верх не проверяем: карточка может быть выше экрана, важно, что до её низа можно докрутить
      return bottom <= visibleBottom + tolerance
        ? null
        : `низ последней карточки недостижим: bottom=${Math.round(bottom)}, видно до ${Math.round(visibleBottom)}`;
    },
    { container, expectedCount, tolerance: TOLERANCE },
  );
