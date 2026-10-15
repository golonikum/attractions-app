import { NextRequest, NextResponse } from 'next/server';

import { aiErrorResponse } from '@/lib/ai/errorResponse';
import { autofillGroupByName } from '@/lib/ai/groupAutofill';
import { withAuth } from '@/lib/serverAuth';

const MAX_NAME_LENGTH = 100;

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    const { name } = await request.json();

    if (typeof name !== 'string' || !name.trim() || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: 'Укажите название населённого пункта' }, { status: 400 });
    }

    try {
      const autofill = await autofillGroupByName(name.trim());

      return NextResponse.json({ autofill });
    } catch (error) {
      return aiErrorResponse(error, {
        label: 'Group autofill',
        refusalMessage: 'Не удалось получить данные о населённом пункте',
      });
    }
  });
}
