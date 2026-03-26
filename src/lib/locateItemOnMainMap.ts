import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { getLocationSearchParams } from './getLocationSearchParams';

export const locateItemOnMainMap = ({ router, item }: { router: any; item: Group | Attraction }) => {
  const newUrl = `${window.location.pathname}${getLocationSearchParams(item)}`;
  window.history.replaceState({}, '', newUrl);

  router.push('/main');
};
