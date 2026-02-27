import { LngLat, YMapCenterLocation, YMapZoomLocation } from 'ymaps3';

import { DEFAULT_LOCATION } from './constants';

export const getInitialLocation = ({
  selectedCoordinates,
  selectedZoom,
}: {
  selectedZoom?: string[];
  selectedCoordinates?: string[];
}): YMapCenterLocation & YMapZoomLocation =>
  selectedZoom?.length && selectedCoordinates?.length
    ? {
        center: selectedCoordinates.map((coordinate) => Number(coordinate)) as LngLat,
        zoom: Number(selectedZoom[0]),
      }
    : DEFAULT_LOCATION;
