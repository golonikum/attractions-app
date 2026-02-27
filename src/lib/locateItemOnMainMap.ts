import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { DEFAULT_ATTRACTION_ZOOM } from './constants';
import { getLocationSearchParams } from './getLocationSearchParams';
import { isAttraction } from './utils';

export const locateItemOnMainMap = ({ router, item }: { router: any; item: Group | Attraction }) => {
  const newUrl = `${window.location.pathname}${getLocationSearchParams(item)}`;
  window.history.pushState({}, '', newUrl);

  router.push('/main');
};
