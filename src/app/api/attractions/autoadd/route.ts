import { NextRequest, NextResponse } from 'next/server';

import { searchAttractions } from '@/lib/ai/attractionsSearch';
import { aiErrorResponse } from '@/lib/ai/errorResponse';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

// Запрос к Overpass, выбор объектов ИИ и поиск фото для каждого могут занимать больше минуты
export const maxDuration = 300;

// Найти достопримечательности населённого пункта (кроме уже добавленных) и добавить их
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    const { groupId } = await request.json();

    const group = typeof groupId === 'string' ? await prisma.group.findFirst({ where: { id: groupId, userId } }) : null;

    if (!group) {
      return NextResponse.json({ error: 'Населённый пункт не найден' }, { status: 404 });
    }

    const existing = await prisma.attraction.findMany({
      where: { groupId, userId },
      select: { name: true, coordinates: true, order: true },
    });

    try {
      const found = await searchAttractions({
        groupName: group.name,
        groupTag: group.tag,
        groupCoordinates: group.coordinates as [number, number],
        groupZoom: group.zoom,
        existing: existing.map(({ name, coordinates }) => ({ name, coordinates: coordinates as [number, number] })),
      });

      const maxOrder = existing.reduce((max, { order }) => Math.max(max, order ?? 0), 0);

      const attractions = await prisma.$transaction(
        found.map((item, index) =>
          prisma.attraction.create({
            data: {
              ...item,
              userId,
              groupId,
              isVisited: false,
              isFavorite: false,
              order: maxOrder + index + 1,
              notes: [],
            },
          }),
        ),
      );

      return NextResponse.json({ attractions }, { status: 201 });
    } catch (error) {
      return aiErrorResponse(error, {
        label: 'Autoadd',
        refusalMessage: 'Не удалось найти достопримечательности',
        unavailableMessage: 'Сервис автодобавления недоступен',
      });
    }
  });
}
