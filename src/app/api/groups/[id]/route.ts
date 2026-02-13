import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/serverAuth";

// Get a specific group by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return await withAuth(request, async (userId) => {
    // Fetch the group
    const { id } = await params;
    const group = await prisma.group.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    return NextResponse.json({ group });
  });
}

// Update a specific group by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return await withAuth(request, async (userId) => {
    // Parse request body
    const { name, description, tag, coordinates, zoom } = await request.json();

    // Check if the group exists and belongs to the user
    const { id } = await params;
    const existingGroup = await prisma.group.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
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

    // Update the group
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tag !== undefined) updateData.tag = tag;
    if (coordinates !== undefined) updateData.coordinates = coordinates;
    if (zoom !== undefined) updateData.zoom = zoom;

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ group: updatedGroup });
  });
}

// Delete a specific group by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return await withAuth(request, async (userId) => {
    // Check if the group exists and belongs to the user
    const { id } = await params;
    const existingGroup = await prisma.group.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    // Delete the group (this will also delete related attractions due to Cascade)
    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Группа успешно удалена" });
  });
}
