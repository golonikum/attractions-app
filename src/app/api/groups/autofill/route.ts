import { NextRequest, NextResponse } from 'next/server';

import { AutofillRefusalError, AutofillServiceError } from '@/lib/ai';
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
      if (error instanceof AutofillRefusalError) {
        return NextResponse.json({ error: 'Не удалось получить данные о населённом пункте' }, { status: 422 });
      }

      if (error instanceof AutofillServiceError) {
        console.error('YandexGPT error:', error.message);

        if (error.status === 429) {
          return NextResponse.json({ error: 'Слишком много запросов, попробуйте позже' }, { status: 429 });
        }

        return NextResponse.json({ error: 'Сервис автозаполнения недоступен' }, { status: 502 });
      }

      throw error;
    }
  });
}
