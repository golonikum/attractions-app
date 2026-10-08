import { z } from 'zod';

import { getLlmProvider } from '@/lib/ai';
import { ATTRACTION_CATEGORIES } from '@/lib/ai/attractionAutofill';
import { distanceKm, normalizeName } from '@/lib/geo';
import { fetchOsmPlaces } from '@/lib/osm/overpass';
import { searchImage } from '@/lib/yandexImageSearch';
import { CreateAttractionRequest } from '@/types/attraction';

const MAX_RESULTS = 10;
/** Сколько кандидатов из OSM показываем ИИ — ограничение размера промпта */
const MAX_CANDIDATES = 150;
/** Объект OSM ближе этого расстояния к уже добавленному считаем тем же самым */
const SAME_PLACE_DISTANCE_KM = 0.1;

// Схема намеренно нестрогая: на длинном списке YandexGPT не всегда держит enum и типы,
// и из-за одного объекта не должен пропадать весь ответ — категорию нормализуем ниже
const AttractionsSelectionSchema = z.object({
  attractions: z.array(
    z.object({
      id: z.string(),
      category: z.string().describe(ATTRACTION_CATEGORIES.join(' | ')),
      description: z.string(),
    }),
  ),
});

const normalizeCategory = (category: string) =>
  ATTRACTION_CATEGORIES.find((item) => item.toLowerCase() === category.trim().toLowerCase()) ?? 'Культура';

const SYSTEM_PROMPT = `Ты — справочник по достопримечательностям. Тебе дан населённый пункт и список объектов из OpenStreetMap в его окрестностях в формате «id | название | теги OSM». Выбери из списка до ${MAX_RESULTS} самых интересных для туриста достопримечательностей и верни их в attractions. Для каждой:
- id: id объекта ровно как в списке; объектов не из списка не добавляй;
- category: одно из значений «Церковь» (храмы, монастыри, часовни и другие религиозные объекты), «Природа» (парки, озёра, реки, горы, заповедники и другие природные объекты), «Культура» (музеи, усадьбы, крепости, памятники, архитектура и всё остальное);
- description: описание на русском языке, от 3 до 5 предложений: история, архитектура или природные особенности, чем интересен для посещения, если это храм или монастырь — какие святыни там есть.
Предпочитай известные и значимые объекты; малозначимые (типовые скверы, небольшие часовни, мемориальные доски) пропускай. Не выдумывай факты: если об объекте мало известно, опиши только то, в чём уверен.`;

/** Радиус поиска в метрах по масштабу карты населённого пункта: чем крупнее город, тем меньше zoom */
const getSearchRadiusM = (zoom: number) => {
  if (zoom >= 14) {
    return 5000;
  }

  return zoom >= 12 ? 10000 : 20000;
};

const getYandexMapsSearchUrl = (text: string, [latitude, longitude]: [number, number]) =>
  `https://yandex.ru/maps/?${new URLSearchParams({ text, ll: `${longitude},${latitude}`, z: '17' })}`;

export const searchAttractions = async ({
  groupName,
  groupTag,
  groupCoordinates,
  groupZoom,
  existing,
}: {
  groupName: string;
  groupTag?: string | null;
  groupCoordinates: [number, number];
  groupZoom: number;
  existing: { name: string; coordinates: [number, number] }[];
}): Promise<Omit<CreateAttractionRequest, 'groupId'>[]> => {
  const existingNames = new Set(existing.map(({ name }) => normalizeName(name)));

  const candidates = (await fetchOsmPlaces({ center: groupCoordinates, radiusM: getSearchRadiusM(groupZoom) }))
    .filter(
      (place) =>
        !existingNames.has(normalizeName(place.name)) &&
        !existing.some(({ coordinates }) => distanceKm(coordinates, place.coordinates) < SAME_PLACE_DISTANCE_KM),
    )
    .slice(0, MAX_CANDIDATES);

  if (!candidates.length) {
    return [];
  }

  const { attractions } = await getLlmProvider().generateStructured({
    system: SYSTEM_PROMPT,
    user: [
      `Населённый пункт: ${[groupName, groupTag].filter(Boolean).join(', ')}`,
      'Объекты:',
      ...candidates.map(({ id, name, kind }) => `${id} | ${name} | ${kind}`),
    ].join('\n'),
    schema: AttractionsSelectionSchema,
    maxTokens: 8000,
  });

  const candidatesById = new Map(candidates.map((place) => [place.id, place]));
  const selectedIds = new Set<string>();

  // Имя и координаты берём из OSM, от ИИ — только выбор, категорию и описание
  const selected = attractions
    .map(({ id, ...rest }) => ({ ...rest, place: candidatesById.get(id.trim()) }))
    .filter(({ place }) => {
      if (!place || selectedIds.has(place.id)) {
        return false;
      }

      selectedIds.add(place.id);

      return true;
    })
    .slice(0, MAX_RESULTS)
    .map(({ place, category, description }) => ({ ...place!, category, description }));

  const images = await Promise.allSettled(selected.map(({ name }) => searchImage(`${name} ${groupName}`)));

  return selected.map(({ name, coordinates, category, description }, index) => {
    const image = images[index];

    if (image.status === 'rejected') {
      console.error('Image search error:', image.reason);
    }

    return {
      name,
      category: normalizeCategory(category),
      description,
      coordinates,
      yaMapUrl: getYandexMapsSearchUrl(`${name}, ${groupName}`, coordinates),
      imageUrl: image.status === 'fulfilled' ? image.value : undefined,
    };
  });
};
