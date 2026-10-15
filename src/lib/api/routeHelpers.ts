import { NextResponse } from 'next/server';

/** Общие куски API-маршрутов городов и объектов */

export const notFound = (message: string) => NextResponse.json({ error: message }, { status: 404 });

export const invalidCoordinates = () =>
  NextResponse.json({ error: 'Неверный формат координат. Ожидается массив [широта, долгота]' }, { status: 400 });

/** Координаты в теле запроса: массив из двух элементов, [latitude, longitude] */
export const isCoordinatesPair = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2;

/** Только переданные (не undefined) поля из тела запроса — для частичного обновления */
export const pickDefined = <K extends string>(body: Record<string, unknown>, keys: readonly K[]) =>
  Object.fromEntries(keys.filter((key) => body[key] !== undefined).map((key) => [key, body[key]])) as Partial<
    Record<K, any>
  >;
