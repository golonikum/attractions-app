import { NextRequest, NextResponse } from 'next/server';

import { invalidCoordinates, isCoordinatesPair, notFound, pickDefined } from '@/lib/api/routeHelpers';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

type Params = { params: Promise<{ id: string }> };

const NOT_FOUND = 'Объект не найден';
const UPDATABLE_FIELDS = [
  'groupId',
  'name',
  'category',
  'description',
  'imageUrl',
  'yaMapUrl',
  'coordinates',
  'isVisited',
  'isFavorite',
  'order',
  'notes',
] as const;

const findOwnAttraction = (id: string, userId: string) => prisma.attraction.findFirst({ where: { id, userId } });

// Get a specific attraction by ID
export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (userId) => {
    const attraction = await findOwnAttraction((await params).id, userId);

    return attraction ? NextResponse.json({ attraction }) : notFound(NOT_FOUND);
  });
}

// Update a specific attraction by ID (only fields present in the body)
export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (userId) => {
    const body = await request.json();
    const { id } = await params;

    const existing = await findOwnAttraction(id, userId);

    if (!existing) {
      return notFound(NOT_FOUND);
    }

    if (body.coordinates && !isCoordinatesPair(body.coordinates)) {
      return invalidCoordinates();
    }

    // Перенести объект можно только в свой город
    if (
      body.groupId !== undefined &&
      body.groupId !== existing.groupId &&
      !(await prisma.group.findFirst({ where: { id: body.groupId, userId }, select: { id: true } }))
    ) {
      return notFound('Группа не найдена');
    }

    const attraction = await prisma.attraction.update({ where: { id }, data: pickDefined(body, UPDATABLE_FIELDS) });

    return NextResponse.json({ attraction });
  });
}

// Delete a specific attraction by ID
export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (userId) => {
    const { id } = await params;

    if (!(await findOwnAttraction(id, userId))) {
      return notFound(NOT_FOUND);
    }

    await prisma.attraction.delete({ where: { id } });

    return NextResponse.json({ message: 'Объект успешно удалён' });
  });
}
