import { unstable_cache } from 'next/cache';

import { Group } from '@/types/group';

import { prisma } from '../db';

import { getUserIdFromCookies } from './getUserIdFromCookies';

const fetchCachedGroups = unstable_cache(
  async (userId?: string) => {
    'use cache';

    const groups = await prisma.group.findMany({
      where: { userId },
      orderBy: [{ tag: 'asc' }, { name: 'asc' }],
    });

    return groups as any as Group[];
  },
  ['static-groups'], // unique cache key
  {
    tags: ['groups'], // для revalidateTag('categories')
    revalidate: 24 * 60 * 60, // 24 часа (или 'max' для max-age)
  },
);

export async function fetchGroups() {
  const userId = await getUserIdFromCookies();

  return fetchCachedGroups(userId);
}
