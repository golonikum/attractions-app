import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { locateItemOnMainMapHref } from './locateItemOnMainMapHref';

export const locateItemOnMainMap = ({ router, item }: { router: any; item: Group | Attraction }) => {
  router.push(locateItemOnMainMapHref(item));
};
