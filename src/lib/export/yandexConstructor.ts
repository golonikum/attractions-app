import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

/**
 * Экспорт объектов в GeoJSON для импорта в Конструктор карт Яндекса (constructor.maps.yandex.ru).
 * У Яндекс Карт нет API и импорта для закладок — Конструктор единственный штатный способ
 * перенести много точек разом. Формат свойств повторяет экспорт самого Конструктора.
 */

/** Лимит Конструктора на число объектов в одной карте */
export const CONSTRUCTOR_MAX_OBJECTS = 10_000;
const MAX_DESCRIPTION_LENGTH = 1000;

/** Цвета меток из палитры Конструктора */
export const CATEGORY_MARKER_COLORS: Record<string, string> = {
  Церковь: '#b51eff',
  Природа: '#1bad03',
  Культура: '#1e98ff',
};
export const DEFAULT_MARKER_COLOR = '#595959';

export interface ConstructorFeature {
  type: 'Feature';
  id: number;
  /** coordinates — [longitude, latitude], как требует GeoJSON */
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { iconCaption: string; description: string; 'marker-color': string };
}

export interface ConstructorFeatureCollection {
  type: 'FeatureCollection';
  metadata: { name: string; creator: string };
  features: ConstructorFeature[];
}

export class ExportLimitError extends Error {}

const isValidCoordinates = (coordinates: unknown): coordinates is [number, number] =>
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every((value) => typeof value === 'number' && Number.isFinite(value));

const truncate = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;

const buildDescription = (attraction: Attraction, group?: Group) =>
  [
    group && [group.name, group.tag && `(${group.tag})`].filter(Boolean).join(' '),
    attraction.category,
    [attraction.isVisited && 'Посещено', attraction.isFavorite && 'Избранное'].filter(Boolean).join(', '),
    attraction.description && truncate(attraction.description.trim(), MAX_DESCRIPTION_LENGTH),
    attraction.yaMapUrl,
    attraction.imageUrl && `Фото: ${attraction.imageUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

export const buildConstructorGeoJson = ({
  attractions,
  groups,
  name,
}: {
  attractions: Attraction[];
  groups: Group[];
  name: string;
}): ConstructorFeatureCollection => {
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const exportable = attractions.filter(({ coordinates }) => isValidCoordinates(coordinates));

  if (exportable.length > CONSTRUCTOR_MAX_OBJECTS) {
    throw new ExportLimitError(
      `Конструктор карт принимает не больше ${CONSTRUCTOR_MAX_OBJECTS} объектов, а выбрано ${exportable.length} — сузьте фильтр`,
    );
  }

  return {
    type: 'FeatureCollection',
    metadata: { name, creator: 'attractions-app' },
    features: exportable.map((attraction, index) => ({
      type: 'Feature',
      id: index,
      // В проекте координаты хранятся как [latitude, longitude] — меняем местами на границе
      geometry: { type: 'Point', coordinates: [attraction.coordinates[1], attraction.coordinates[0]] },
      properties: {
        iconCaption: attraction.name,
        description: buildDescription(attraction, groupsById.get(attraction.groupId)),
        'marker-color': (attraction.category && CATEGORY_MARKER_COLORS[attraction.category]) || DEFAULT_MARKER_COLOR,
      },
    })),
  };
};

/** Имя файла: attractions-<фильтр>-YYYY-MM-DD.geojson, без символов, недопустимых в именах файлов */
export const getExportFileName = (label: string) => {
  const slug = label
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);

  return `attractions-${slug ? `${slug}-` : ''}${new Date().toISOString().slice(0, 10)}.geojson`;
};

export const downloadGeoJson = (collection: ConstructorFeatureCollection, fileName: string) => {
  const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke после клика: Safari начинает скачивание асинхронно
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
