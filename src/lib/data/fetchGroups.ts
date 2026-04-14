import { cookies } from 'next/headers';

import { Group } from '@/types/group';

import { prisma } from '../db';
import { getUserIdFromToken } from '../serverAuth';

export const fetchGroups = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const { userId } = getUserIdFromToken(token);

  const groups = await prisma.group.findMany({
    where: { userId },
    orderBy: [{ tag: 'asc' }, { name: 'asc' }],
  });

  return groups as any as Group[];
};
