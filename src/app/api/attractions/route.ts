import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

// Get all attractions for the authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    // Fetch attractions based on groupId or all attractions for the user
    const whereClause: any = { userId };

    if (groupId) {
      // If groupId is provided, get attractions for that group
      whereClause.groupId = groupId;
    }

    const attractions = await prisma.attraction.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ attractions });
  });
}

// Create a new attraction
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    // Parse request body
    const {
      groupId,
      name,
      category,
      description,
      imageUrl,
      yaMapUrl,
      coordinates,
      isVisited,
      isFavorite,
      order,
      notes,
    } = await request.json();

    // Validate required fields
    if (!groupId || !name || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return NextResponse.json(
        {
          error: 'Неверные данные. Убедитесь, что groupId, name и coordinates [lat, long] указаны правильно',
        },
        { status: 400 },
      );
    }

    // Check if the group exists and belongs to the user
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        userId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Группа не найдена' }, { status: 404 });
    }

    // Create the attraction
    const attraction = await prisma.attraction.create({
      data: {
        userId,
        groupId,
        name,
        category,
        description,
        imageUrl,
        yaMapUrl,
        coordinates,
        isVisited: isVisited || false,
        isFavorite: isFavorite || false,
        order: order || 1,
        notes: notes || [],
      },
    });

    return NextResponse.json({ attraction }, { status: 201 });
  });
}
