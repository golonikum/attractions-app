import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Attraction } from '@/types/attraction';
import { Group, GroupWithAttractions } from '@/types/group';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function isAttraction(item: Group | GroupWithAttractions | Attraction): item is Attraction {
  return (item as Attraction).groupId !== undefined;
}
