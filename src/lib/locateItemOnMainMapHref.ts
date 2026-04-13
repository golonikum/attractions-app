import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { getLocationSearchParams } from './getLocationSearchParams';

export const locateItemOnMainMapHref = (item: Group | Attraction) => `/main${getLocationSearchParams(item)}`;
