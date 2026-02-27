import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

// Get all groups for the authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    // Fetch all groups for the user
    const groups = await prisma.group.findMany({
      where: { userId },
      orderBy: [{ tag: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ groups });
  });
}

// Create a new group
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    // Parse request body
    const { name, description, tag, coordinates, zoom } = await request.json();

    // Validate required fields
    if (
      !name ||
      !description ||
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      typeof zoom !== 'number'
    ) {
      return NextResponse.json(
        {
          error: 'Неверные данные. Убедитесь, что name, description, coordinates [long, lat] и zoom указаны правильно',
        },
        { status: 400 },
      );
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        userId,
        name,
        description,
        tag,
        coordinates,
        zoom,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  });
}
