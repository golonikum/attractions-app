import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

export async function PUT(request: NextRequest) {
  return withAuth(request, async () => {
    const { groupId, attractions } = await request.json();

    // Валидация входных данных
    if (!groupId || !Array.isArray(attractions) || attractions.length === 0) {
      return NextResponse.json({ error: 'groupId и attractions с id/order обязательны' }, { status: 400 });
    }

    // Проверка, что все items имеют уникальные id и корректные order
    const ids = attractions.map((item) => item.id);
    const hasDuplicates = ids.some((id, index) => ids.indexOf(id) !== index);

    if (hasDuplicates) {
      return NextResponse.json({ error: 'ID элементов должны быть уникальными' }, { status: 400 });
    }

    // Транзакция для атомарного обновления
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем все элементы в группе по новому порядку
      const updates = attractions.map(async (item) =>
        tx.attraction.update({
          where: { id: item.id },
          data: {
            order: item.order,
            groupId, // гарантируем консистентность groupId
          },
        }),
      );

      return Promise.all(updates);
    });

    return NextResponse.json(
      {
        success: true,
        updated: result.length,
        items: result,
      },
      { status: 200 },
    );
  });
}
