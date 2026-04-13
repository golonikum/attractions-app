import { unstable_cache } from 'next/cache';

import { Attraction } from '@/types/attraction';

import { prisma } from '../db';

import { getUserIdFromCookies } from './getUserIdFromCookies';

const fetchCachedAttractions = unstable_cache(
  async (userId?: string, groupId?: string) => {
    'use cache';

    const whereClause: any = { userId };

    if (groupId) {
      // If groupId is provided, get attractions for that group
      whereClause.groupId = groupId;
    }

    const attractions = await prisma.attraction.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });

    return attractions as any as Attraction[];
  },
  ['static-attractions'], // unique cache key
  {
    tags: ['attractions'], // для revalidateTag('categories')
    revalidate: 24 * 60 * 60, // 24 часа (или 'max' для max-age)
  },
);

export async function fetchAttractions(groupId?: string) {
  const userId = await getUserIdFromCookies();

  return fetchCachedAttractions(userId, groupId);
}
