import { cookies } from 'next/headers';

import { Attraction } from '@/types/attraction';

import { prisma } from '../db';
import { getUserIdFromToken } from '../serverAuth';

export const fetchAttractions = async (groupId?: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const { userId } = getUserIdFromToken(token);
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
};
