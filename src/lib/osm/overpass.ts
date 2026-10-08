import { distanceKm, normalizeName } from '@/lib/geo';
import { serviceFetch } from '@/lib/yandex/api';

/** Объекты с одинаковым названием ближе этого расстояния считаем одним (узел храма + контур здания) */
const DUPLICATE_DISTANCE_KM = 0.2;

/** Теги, по которым объект в OSM считается достопримечательностью; [ключ, регулярное выражение значения] */
const ATTRACTION_TAGS: [string, string][] = [
  ['tourism', '^(museum|attraction|viewpoint|gallery|artwork)$'],
  ['historic', '^(monument|memorial|castle|monastery|manor|fort|ruins|archaeological_site|church|city_gate)$'],
  ['amenity', '^place_of_worship$'],
  ['leisure', '^(park|nature_reserve)$'],
  ['boundary', '^protected_area$'],
  ['natural', '^(peak|waterfall|spring|cave_entrance|beach|cliff)$'],
  ['water', '^lake$'],
];

/** Теги, которые помогают ИИ понять, что это за объект */
const KIND_TAGS = [...ATTRACTION_TAGS.map(([key]) => key), 'religion', 'denomination', 'building', 'heritage'];

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OsmPlace {
  /** Идентификатор OSM вида "node/123" */
  id: string;
  name: string;
  /** [latitude, longitude] */
  coordinates: [number, number];
  /** Краткое описание по тегам, например "amenity=place_of_worship, religion=christian" */
  kind: string;
  /** Чем больше, тем известнее объект */
  rank: number;
}

/** Публичные серверы Overpass попеременно перегружены (504/500/429) — при ошибке пробуем следующий */
const DEFAULT_OVERPASS_URLS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
/** Таймаут выполнения запроса на сервере Overpass, секунды; клиентский — чуть больше */
const QUERY_TIMEOUT_S = 25;

/** Прямоугольник [south, west, north, east], описанный вокруг круга радиусом radiusM */
const getBbox = ([lat, lng]: [number, number], radiusM: number) => {
  const dLat = radiusM / 111_320;
  const dLng = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180));

  return [lat - dLat, lng - dLng, lat + dLat, lng + dLng].map((value) => value.toFixed(5)).join(',');
};

// bbox заметно дешевле для Overpass, чем around: лишнее за пределами круга отсекаем уже в fetchOsmPlaces
const buildQuery = (center: [number, number], radiusM: number) => {
  const filters = ATTRACTION_TAGS.map(([key, value]) => `nwr["name"]["${key}"~"${value}"]["memorial"!="plaque"];`);

  return `[out:json][timeout:${QUERY_TIMEOUT_S}][bbox:${getBbox(center, radiusM)}];(${filters.join(
    '',
  )});out center tags;`;
};

const getOverpassUrls = () => (process.env.OVERPASS_API_URL ? [process.env.OVERPASS_API_URL] : DEFAULT_OVERPASS_URLS);

const queryOverpass = async (query: string) => {
  let lastError: unknown;
  const urls = getOverpassUrls();
  // Отказы перегруженных серверов приходят быстро и случайно — проходим по списку дважды
  const attempts = [...urls, ...urls];

  for (const url of attempts) {
    try {
      const response = await serviceFetch(`Overpass ${new URL(url).host}`, url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'attractions-app',
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout((QUERY_TIMEOUT_S + 10) * 1000),
      });

      return ((await response.json()) as { elements?: OverpassElement[] }).elements ?? [];
    } catch (error) {
      // В тексте ошибки целая HTML-страница 504 — в лог хватит начала
      console.error((error instanceof Error ? error.message : String(error)).slice(0, 200));
      lastError = error;
    }
  }

  throw lastError;
};

const getRank = (tags: Record<string, string>) =>
  (tags.wikidata || tags.wikipedia ? 3 : 0) + (tags.heritage ? 2 : 0) + (tags.tourism || tags.historic ? 1 : 0);

const toOsmPlace = ({ type, id, lat, lon, center, tags = {} }: OverpassElement): OsmPlace | undefined => {
  const name = (tags['name:ru'] || tags.name)?.trim();
  const latitude = lat ?? center?.lat;
  const longitude = lon ?? center?.lon;

  if (!name || latitude === undefined || longitude === undefined) {
    return undefined;
  }

  return {
    id: `${type}/${id}`,
    name,
    coordinates: [latitude, longitude],
    kind: KIND_TAGS.filter((key) => tags[key])
      .map((key) => `${key}=${tags[key]}`)
      .join(', '),
    rank: getRank(tags),
  };
};

/** Достопримечательности из OpenStreetMap в радиусе radiusM метров от center ([latitude, longitude]), известные — первыми */
export const fetchOsmPlaces = async ({ center, radiusM }: { center: [number, number]; radiusM: number }) => {
  const elements = await queryOverpass(buildQuery(center, radiusM));

  const places = elements
    .map(toOsmPlace)
    .filter((place): place is OsmPlace => Boolean(place) && distanceKm(center, place!.coordinates) <= radiusM / 1000)
    .sort((a, b) => b.rank - a.rank);

  // После сортировки дубль с меньшим rank всегда идёт позже — его и отбрасываем
  const keptByName = new Map<string, OsmPlace[]>();

  return places.filter((place) => {
    const key = normalizeName(place.name);
    const kept = keptByName.get(key) ?? [];

    if (kept.some((other) => distanceKm(other.coordinates, place.coordinates) < DUPLICATE_DISTANCE_KM)) {
      return false;
    }

    keptByName.set(key, [...kept, place]);

    return true;
  });
};
