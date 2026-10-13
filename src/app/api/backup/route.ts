import { NextRequest, NextResponse } from 'next/server';

import { IMPORT_MODES, ImportMode, parseBackup } from '@/lib/backup/format';
import { exportBackup, importBackup } from '@/lib/backup/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/serverAuth';

// Импорт сотен записей одной транзакцией на удалённой БД может занять заметное время
export const maxDuration = 60;

// Резервная копия всех городов и объектов пользователя
export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => NextResponse.json(await exportBackup(prisma, userId)));
}

// Восстановление из резервной копии: { mode: 'merge' | 'replace', backup }
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    const { mode, backup } = await request.json();

    if (!IMPORT_MODES.includes(mode)) {
      return NextResponse.json({ error: 'Неизвестный режим импорта' }, { status: 400 });
    }

    let parsed;

    try {
      parsed = parseBackup(backup);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }

    const stats = await importBackup(prisma, userId, parsed, mode as ImportMode);

    return NextResponse.json({ stats });
  });
}
