import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/serverAuth";

export async function PUT(request: NextRequest) {
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

    const { groupId, attractions } = await request.json();

    // Валидация входных данных
    if (!groupId || !Array.isArray(attractions) || attractions.length === 0) {
      return NextResponse.json(
        { error: "groupId и attractions с id/order обязательны" },
        { status: 400 },
      );
    }

    // Проверка, что все items имеют уникальные id и корректные order
    const ids = attractions.map((item) => item.id);
    const hasDuplicates = ids.some((id, index) => ids.indexOf(id) !== index);
    if (hasDuplicates) {
      return NextResponse.json(
        { error: "ID элементов должны быть уникальными" },
        { status: 400 },
      );
    }

    // Транзакция для атомарного обновления
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем все элементы в группе по новому порядку
      const updates = attractions.map(async (item) => {
        return tx.attraction.update({
          where: { id: item.id },
          data: {
            order: item.order,
            groupId, // гарантируем консистентность groupId
          },
        });
      });

      return Promise.all(updates);
    });

    return NextResponse.json(
      {
        success: true,
        updated: result.length,
        items: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ошибка обновления порядка:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Ошибка сервера: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Неизвестная ошибка сервера" },
      { status: 500 },
    );
  }
}
