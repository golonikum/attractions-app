import { NextRequest, NextResponse } from 'next/server';

import { invalidCoordinates, isCoordinatesPair, notFound, pickDefined } from '@/lib/api/routeHelpers';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

type Params = { params: Promise<{ id: string }> };

const NOT_FOUND = 'Группа не найдена';
const UPDATABLE_FIELDS = ['name', 'description', 'tag', 'coordinates', 'zoom'] as const;

const findOwnGroup = (id: string, userId: string) => prisma.group.findFirst({ where: { id, userId } });

// Get a specific group by ID
export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (userId) => {
    const group = await findOwnGroup((await params).id, userId);

    return group ? NextResponse.json({ group }) : notFound(NOT_FOUND);
  });
}

// Update a specific group by ID (only fields present in the body)
export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (userId) => {
    const body = await request.json();
    const { id } = await params;

    if (!(await findOwnGroup(id, userId))) {
      return notFound(NOT_FOUND);
    }

    if (body.coordinates && !isCoordinatesPair(body.coordinates)) {
      return invalidCoordinates();
    }

    const group = await prisma.group.update({ where: { id }, data: pickDefined(body, UPDATABLE_FIELDS) });

    return NextResponse.json({ group });
  });
}

// Delete a specific group by ID (its attractions are deleted by cascade)
export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (userId) => {
    const { id } = await params;

    if (!(await findOwnGroup(id, userId))) {
      return notFound(NOT_FOUND);
    }

    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ message: 'Группа успешно удалена' });
  });
}
