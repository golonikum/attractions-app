import { YMapCenterLocation, YMapZoomLocation } from 'ymaps3';

export const DEFAULT_COORDINATES: [number, number] = [55.755819, 37.617644]; // [долгота, широта] по умолчанию (Москва)

export const DEFAULT_ATTRACTION_ZOOM = 14;
export const DEFAULT_TAG_ZOOM = 8;
export const DEFAULT_GROUP_ZOOM = 7;

export const DEFAULT_LOCATION: YMapCenterLocation & YMapZoomLocation = {
  center: [DEFAULT_COORDINATES[1], DEFAULT_COORDINATES[0]],
  zoom: 5,
};
