import { NextRequest, NextResponse } from 'next/server';

import { autofillAttraction } from '@/lib/ai/attractionAutofill';
import { aiErrorResponse } from '@/lib/ai/errorResponse';
import { prisma } from '@/lib/db';
import { InvalidMapUrlError } from '@/lib/parseYandexMapsUrl';
import { withAuth } from '@/lib/serverAuth';

const MAX_NAME_LENGTH = 200;

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    const { name, groupId, yaMapUrl } = await request.json();

    if (typeof name !== 'string' || !name.trim() || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: 'Укажите название объекта' }, { status: 400 });
    }

    if (typeof yaMapUrl !== 'string' || !yaMapUrl.trim()) {
      return NextResponse.json({ error: 'Укажите ссылку на объект в Яндекс Картах' }, { status: 400 });
    }

    const group = typeof groupId === 'string' ? await prisma.group.findFirst({ where: { id: groupId, userId } }) : null;

    if (!group) {
      return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
    }

    try {
      const result = await autofillAttraction({
        name: name.trim(),
        groupName: group.name,
        groupTag: group.tag,
        yaMapUrl,
      });

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof InvalidMapUrlError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return aiErrorResponse(error, {
        label: 'Attraction autofill',
        refusalMessage: 'Не удалось получить данные об объекте',
      });
    }
  });
}
