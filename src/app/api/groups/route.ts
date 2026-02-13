
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/serverAuth";

// Get all groups for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 });
    }

    // Fetch all groups for the user
    const groups = await prisma.group.findMany({
      where: { userId: decoded.id },
      orderBy: [
        { tag: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Create a new group
export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 });
    }

    // Parse request body
    const { name, description, tag, coordinates, zoom } = await request.json();

    // Validate required fields
    if (!name || !description || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 || typeof zoom !== "number") {
      return NextResponse.json(
        { error: "Неверные данные. Убедитесь, что name, description, coordinates [long, lat] и zoom указаны правильно" },
        { status: 400 }
      );
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        userId: decoded.id,
        name,
        description,
        tag,
        coordinates,
        zoom,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
