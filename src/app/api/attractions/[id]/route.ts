import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/serverAuth";

// Get a specific attraction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 },
      );
    }

    // Fetch the attraction
    const { id } = await params;
    const attraction = await prisma.attraction.findFirst({
      where: {
        id,
        userId: decoded.id,
      },
    });

    if (!attraction) {
      return NextResponse.json({ error: "Объект не найдена" }, { status: 404 });
    }

    return NextResponse.json({ attraction });
  } catch (error) {
    console.error("Error fetching attraction:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// Update a specific attraction by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 },
      );
    }

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
        userId: decoded.id,
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
  } catch (error) {
    console.error("Error updating attraction:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// Delete a specific attraction by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 },
      );
    }

    // Check if the attraction exists and belongs to the user
    const { id } = await params;
    const existingAttraction = await prisma.attraction.findFirst({
      where: {
        id,
        userId: decoded.id,
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
  } catch (error) {
    console.error("Error deleting attraction:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
