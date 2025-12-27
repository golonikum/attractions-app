import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/serverAuth";

// Get a specific group by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { status: 401 }
      );
    }

    // Fetch the group
    const { id } = await params;
    const group = await prisma.group.findFirst({
      where: {
        id,
        userId: decoded.id,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Update a specific group by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { status: 401 }
      );
    }

    // Parse request body
    const { name, description, tag, coordinates, zoom } = await request.json();

    // Check if the group exists and belongs to the user
    const { id } = await params;
    const existingGroup = await prisma.group.findFirst({
      where: {
        id,
        userId: decoded.id,
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
        { status: 400 }
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
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Delete a specific group by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { status: 401 }
      );
    }

    // Check if the group exists and belongs to the user
    const { id } = await params;
    const existingGroup = await prisma.group.findFirst({
      where: {
        id,
        userId: decoded.id,
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
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
