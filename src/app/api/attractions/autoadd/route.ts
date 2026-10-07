import { NextRequest, NextResponse } from 'next/server';

import { AutofillRefusalError, AutofillServiceError } from '@/lib/ai';
import { searchAttractions } from '@/lib/ai/attractionsSearch';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

// Поиск списка объектов и фото для каждого может занимать больше минуты
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
      select: { name: true, order: true },
    });

    try {
      const found = await searchAttractions({
        groupName: group.name,
        groupTag: group.tag,
        groupCoordinates: group.coordinates as [number, number],
        existingNames: existing.map(({ name }) => name),
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
      if (error instanceof AutofillRefusalError) {
        console.error('Autoadd refusal:', error.message);

        return NextResponse.json({ error: 'Не удалось найти достопримечательности' }, { status: 422 });
      }

      if (error instanceof AutofillServiceError) {
        console.error('Autoadd service error:', error.message);

        if (error.status === 429) {
          return NextResponse.json({ error: 'Слишком много запросов, попробуйте позже' }, { status: 429 });
        }

        return NextResponse.json({ error: 'Сервис автодобавления недоступен' }, { status: 502 });
      }

      throw error;
    }
  });
}
