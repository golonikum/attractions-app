import { cacheTag } from 'next/cache';
import { cookies } from 'next/headers';

import { Attraction } from '@/types/attraction';

import { prisma } from '../db';
import { getUserIdFromToken } from '../serverAuth';

const fetchAttractionsWithUser = async (userId: string | undefined) => {
  'use cache';
  cacheTag('attractions');

  const whereClause: any = { userId };

  const attractions = await prisma.attraction.findMany({
    where: whereClause,
    orderBy: { order: 'asc' },
  });

  return attractions as any as Attraction[];
};

export const fetchAttractions = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const { userId } = getUserIdFromToken(token);

  return fetchAttractionsWithUser(userId);
};
