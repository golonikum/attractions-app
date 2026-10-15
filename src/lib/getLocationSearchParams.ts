import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { DEFAULT_ATTRACTION_ZOOM } from './constants';
import { toLngLat } from './geo';
import { isAttraction } from './utils';

export const getLocationSearchParams = (item: Group | Attraction, zoom?: number) => {
  const isGroup = !isAttraction(item);
  const realZoom = zoom || (isGroup ? item.zoom : DEFAULT_ATTRACTION_ZOOM);

  return `?zoom=${realZoom}&coordinates=${toLngLat(item.coordinates).join('%2C')}`;
};
