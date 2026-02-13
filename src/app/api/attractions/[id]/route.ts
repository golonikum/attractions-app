import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/serverAuth";

// Get a specific attraction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return await withAuth(request, async (userId) => {
    // Fetch the attraction
    const { id } = await params;
    const attraction = await prisma.attraction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!attraction) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    }

    return NextResponse.json({ attraction });
  });
}

// Update a specific attraction by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return await withAuth(request, async (userId) => {
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

    // Check if the attraction exists and belongs to the user
    const { id } = await params;
    const existingAttraction = await prisma.attraction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingAttraction) {
      return NextResponse.json({ error: "Объект не найдена" }, { status: 404 });
    }

    // Validate coordinates if provided
    if (
      coordinates &&
      (!Array.isArray(coordinates) || coordinates.length !== 2)
    ) {
      return NextResponse.json(
        {
          error:
            "Неверный формат координат. Ожидается массив [долгота, широта]",
        },
        { status: 400 },
      );
    }

    // Update the attraction
    const updateData: any = {};
    if (groupId !== undefined) updateData.groupId = groupId;
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (yaMapUrl !== undefined) updateData.yaMapUrl = yaMapUrl;
    if (coordinates !== undefined) updateData.coordinates = coordinates;
    if (isVisited !== undefined) updateData.isVisited = isVisited;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (order !== undefined) updateData.order = order;
    if (notes !== undefined) updateData.notes = notes;

    const updatedAttraction = await prisma.attraction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ attraction: updatedAttraction });
  });
}

// Delete a specific attraction by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return await withAuth(request, async (userId) => {
    // Check if the attraction exists and belongs to the user
    const { id } = await params;
    const existingAttraction = await prisma.attraction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingAttraction) {
      return NextResponse.json({ error: "Объект не найдена" }, { status: 404 });
    }

    // Delete the attraction
    await prisma.attraction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Объект успешно удалена" });
  });
}
