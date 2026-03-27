'use server';

import { cache } from 'react';

import { getAllAttractions } from '@/services/attractionService';
import { getAllGroups } from '@/services/groupService';

export const getSharedData = cache(async () => {
  const attractions = await getAllAttractions();
  const groups = await getAllGroups();

  return { attractions, groups };
});
