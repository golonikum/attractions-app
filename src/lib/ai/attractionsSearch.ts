import { z } from 'zod';

import { getLlmProvider } from '@/lib/ai';
import { ATTRACTION_CATEGORIES } from '@/lib/ai/attractionAutofill';
import { searchImage } from '@/lib/yandexImageSearch';
import { CreateAttractionRequest } from '@/types/attraction';

const MAX_RESULTS = 10;
/** Отбрасываем объекты дальше этого расстояния от центра населённого пункта — скорее всего, модель ошиблась */
const MAX_DISTANCE_KM = 30;

const AttractionsSearchSchema = z.object({
  attractions: z.array(
    z.object({
      name: z.string(),
      category: z.enum(ATTRACTION_CATEGORIES),
      description: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    }),
  ),
});

const SYSTEM_PROMPT = `Ты — справочник по достопримечательностям. По населённому пункту и координатам его центра верни список attractions — до ${MAX_RESULTS} самых интересных для туриста достопримечательностей в этом населённом пункте и в его ближайших окрестностях. Для каждой:
- name: общепринятое название на русском, как на Яндекс Картах;
- category: одно из значений «Церковь» (храмы, монастыри, часовни и другие религиозные объекты), «Природа» (парки, озёра, реки, горы, заповедники и другие природные объекты), «Культура» (музеи, усадьбы, крепости, памятники, архитектура и всё остальное);
- description: описание на русском языке, от 3 до 8 предложений: история, архитектура или природные особенности, чем интересен для посещения, если это храм или монастырь — какие святыни там есть;
- latitude, longitude: точные координаты объекта в десятичных градусах.
Не включай объекты из списка уже добавленных (в том числе под другими названиями). Включай только реально существующие объекты, в существовании и местоположении которых ты уверен; лучше вернуть меньше объектов или пустой список, чем выдумать.`;

const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"'„“”.,()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Расстояние между точками [latitude, longitude] в километрах */
const distanceKm = ([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) => {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;

  return 2 * 6371 * Math.asin(Math.sqrt(a));
};

const getYandexMapsSearchUrl = (text: string, [latitude, longitude]: [number, number]) =>
  `https://yandex.ru/maps/?${new URLSearchParams({ text, ll: `${longitude},${latitude}`, z: '17' })}`;

export const searchAttractions = async ({
  groupName,
  groupTag,
  groupCoordinates,
  existingNames,
}: {
  groupName: string;
  groupTag?: string | null;
  groupCoordinates: [number, number];
  existingNames: string[];
}): Promise<Omit<CreateAttractionRequest, 'groupId'>[]> => {
  const place = [groupName, groupTag].filter(Boolean).join(', ');

  const { attractions } = await getLlmProvider().generateStructured({
    system: SYSTEM_PROMPT,
    user: [
      `Населённый пункт: ${place}`,
      `Координаты центра: ${groupCoordinates[0]}, ${groupCoordinates[1]}`,
      `Уже добавлены: ${existingNames.length ? existingNames.join('; ') : 'нет'}`,
    ].join('\n'),
    schema: AttractionsSearchSchema,
    maxTokens: 12000,
  });

  const seen = new Set(existingNames.map(normalizeName));

  const found = attractions
    .filter(({ name, latitude, longitude }) => {
      const key = normalizeName(name);

      if (!key || seen.has(key) || distanceKm(groupCoordinates, [latitude, longitude]) > MAX_DISTANCE_KM) {
        return false;
      }

      seen.add(key);

      return true;
    })
    .slice(0, MAX_RESULTS);

  const images = await Promise.allSettled(found.map(({ name }) => searchImage(`${name} ${groupName}`)));

  return found.map(({ name, category, description, latitude, longitude }, index) => {
    const image = images[index];
    const coordinates: [number, number] = [latitude, longitude];

    if (image.status === 'rejected') {
      console.error('Image search error:', image.reason);
    }

    return {
      name: name.trim(),
      category,
      description,
      coordinates,
      yaMapUrl: getYandexMapsSearchUrl(`${name}, ${groupName}`, coordinates),
      imageUrl: image.status === 'fulfilled' ? image.value : undefined,
    };
  });
};
