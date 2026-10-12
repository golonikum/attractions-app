import type { Attraction } from '../../src/types/attraction';
import type { Group } from '../../src/types/group';
import type { User } from '../../src/types/user';

/**
 * Детерминированные тестовые данные с нарочно неудобными случаями для вёрстки:
 * группы с тегом и без, очень длинные названия и описания, пустая группа, объекты с фото и без.
 */

const DATE = '2026-01-01T00:00:00.000Z';
const LONG_TEXT =
  'Очень длинное название населённого пункта, которое никак не помещается в одну строку на узком экране телефона';
const TAGS = ['Московская область', 'Владимирская область', 'Республика Карелия', 'Саратовская область'];

export const USER: User = { id: 'user-1', email: 'test@example.com' };

/** Группа с большим числом объектов */
export const BIG_GROUP_ID = 'group-0';
/** Группа без объектов */
export const EMPTY_GROUP_ID = 'group-1';
/** Группа с длинным названием и без тега */
export const LONG_GROUP_ID = 'group-2';

export const GROUPS: Group[] = Array.from({ length: 60 }, (_, i) => ({
  id: `group-${i}`,
  userId: USER.id,
  name: i === 2 || i % 7 === 0 ? `${LONG_TEXT} №${i}` : `Город ${i}`,
  description: i % 5 === 0 ? `${LONG_TEXT}. ${LONG_TEXT}. 1678 г., 104.078 чел., ${i} км` : `1700 г., ${i} тыс. чел.`,
  tag: i === 2 || i % 3 === 0 ? undefined : TAGS[i % TAGS.length],
  coordinates: [55.75 + i * 0.01, 37.61 + i * 0.01],
  zoom: 12,
  createdAt: DATE,
  updatedAt: DATE,
}));

const attractionsForGroup = (groupIndex: number, count: number): Attraction[] =>
  Array.from({ length: count }, (_, i) => {
    const n = groupIndex * 1000 + i;

    return {
      id: `attraction-${n}`,
      userId: USER.id,
      groupId: `group-${groupIndex}`,
      name: i % 4 === 0 ? `${LONG_TEXT} — объект ${n}` : `Объект ${n}`,
      category: ['Церковь', 'Природа', 'Культура', undefined][i % 4],
      imageUrl: i % 3 === 0 ? undefined : `https://avatars.mds.yandex.net/get-altay/1/${n}/orig`,
      yaMapUrl: `https://yandex.ru/maps/?ll=37.61,55.75&z=17&text=${n}`,
      description: i % 2 === 0 ? `${LONG_TEXT}. `.repeat(1 + (i % 5)) : 'Короткое описание.',
      isVisited: i % 5 === 0,
      isFavorite: i % 6 === 0,
      coordinates: [55.75 + i * 0.001, 37.61 + i * 0.001],
      order: i + 1,
      notes:
        i % 4 === 1
          ? [
              { date: '2026-05-01', note: `Заметка к объекту ${n}. ${i % 8 === 1 ? LONG_TEXT : ''}` },
              { date: '2026-06-01', note: 'Вторая заметка' },
            ]
          : [],
      createdAt: DATE,
      updatedAt: DATE,
    };
  });

export const ATTRACTIONS: Attraction[] = [
  ...attractionsForGroup(0, 40),
  // group-1 — нарочно без объектов
  ...attractionsForGroup(2, 6),
  ...GROUPS.slice(3).flatMap((_, i) => attractionsForGroup(i + 3, 4 + (i % 4))),
];
