const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Расстояние между точками [latitude, longitude] в километрах */
export const distanceKm = ([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) => {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;

  return 2 * 6371 * Math.asin(Math.sqrt(a));
};

/** Нормализованное название для сравнения объектов между собой */
export const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"'„“”.,()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
