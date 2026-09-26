import { AutofillServiceError } from './ai/types';

const YANDEX_HOST_REGEX = /^(www\.)?yandex\.(ru|com|by|kz|uz|com\.tr)$/;
const SHORT_LINK_PREFIX = '/maps/-/';
const MAX_REDIRECTS = 3;

export class InvalidMapUrlError extends Error {}

const toYandexMapsUrl = (value: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new InvalidMapUrlError('Некорректная ссылка');
  }

  if (!YANDEX_HOST_REGEX.test(url.hostname) || !url.pathname.startsWith('/maps')) {
    throw new InvalidMapUrlError('Ссылка должна вести на Яндекс Карты');
  }

  return url;
};

const fetchRedirect = async (url: URL, attempts = 2): Promise<Response> => {
  try {
    return await fetch(url, { redirect: 'manual' });
  } catch (error) {
    if (attempts > 1) {
      return fetchRedirect(url, attempts - 1);
    }

    throw new AutofillServiceError(`Yandex Maps: сетевая ошибка ${String((error as Error).cause ?? error)}`, 504);
  }
};

const expandShortLink = async (url: URL) => {
  let current = url;

  for (let i = 0; i < MAX_REDIRECTS && current.pathname.startsWith(SHORT_LINK_PREFIX); i++) {
    const response = await fetchRedirect(current);
    const location = response.headers.get('location');

    if (!location) {
      throw new InvalidMapUrlError('Не удалось раскрыть короткую ссылку');
    }

    current = toYandexMapsUrl(new URL(location, current).toString());
  }

  return current;
};

const parseLngLat = (value: string | null): [number, number] | undefined => {
  const [longitude, latitude] = (value ?? '').split(',').map(Number);

  return value && Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : undefined;
};

/**
 * Возвращает координаты объекта из ссылки Яндекс Карт в формате [latitude, longitude].
 * Ссылка на карточку организации (/maps/org/...) содержит только центр карты `ll` — такие координаты приблизительные.
 */
export const getCoordinatesFromYandexMapsUrl = async (
  value: string,
): Promise<{ coordinates: [number, number]; isApproximate: boolean }> => {
  const url = await expandShortLink(toYandexMapsUrl(value.trim()));

  const poiPoint = parseLngLat(url.searchParams.get('poi[point]'));

  if (poiPoint) {
    return { coordinates: poiPoint, isApproximate: false };
  }

  const mapCenter = url.pathname.startsWith('/maps/org/') ? parseLngLat(url.searchParams.get('ll')) : undefined;

  if (mapCenter) {
    return { coordinates: mapCenter, isApproximate: true };
  }

  throw new InvalidMapUrlError('В ссылке нет объекта — выберите объект на карте и скопируйте ссылку ещё раз');
};
