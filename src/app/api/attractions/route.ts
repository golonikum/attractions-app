import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/serverAuth";

// Get all attractions for the authenticated user
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    // Fetch attractions based on groupId or all attractions for the user
    const whereClause: any = { userId: decoded.id };

    if (groupId) {
      // If groupId is provided, get attractions for that group
      whereClause.groupId = groupId;
    }

    const attractions = await prisma.attraction.findMany({
      where: whereClause,
      // orderBy: { order: "asc" }, // TODO
    });

    return NextResponse.json({ attractions });
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// Create a new attraction
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (
      !groupId ||
      !name ||
      !category ||
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return NextResponse.json(
        {
          error:
            "Неверные данные. Убедитесь, что groupId, name, category и coordinates [long, lat] указаны правильно",
        },
        { status: 400 },
      );
    }

    // Check if the group exists and belongs to the user
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        userId: decoded.id,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    // Create the attraction
    const attraction = await prisma.attraction.create({
      data: {
        userId: decoded.id,
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
  } catch (error) {
    console.error("Error creating attraction:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
