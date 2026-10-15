import { NextResponse } from 'next/server';

import { AutofillRefusalError, AutofillServiceError } from './types';

/**
 * Единый перевод ошибок ИИ-сервисов в HTTP-ответ для маршрутов автозаполнения/автодобавления.
 * Неизвестные ошибки пробрасываются дальше (500 от Next.js).
 */
export const aiErrorResponse = (
  error: unknown,
  {
    label,
    refusalMessage,
    unavailableMessage = 'Сервис автозаполнения недоступен',
  }: {
    /** Метка для логов, например 'Autoadd' */
    label: string;
    /** Модель ответила, но без пригодных данных (422) */
    refusalMessage: string;
    /** Сервис недоступен или ответил ошибкой (502) */
    unavailableMessage?: string;
  },
) => {
  if (error instanceof AutofillRefusalError) {
    console.error(`${label} refusal:`, error.message);

    return NextResponse.json({ error: refusalMessage }, { status: 422 });
  }

  if (error instanceof AutofillServiceError) {
    console.error(`${label} service error:`, error.message);

    if (error.status === 429) {
      return NextResponse.json({ error: 'Слишком много запросов, попробуйте позже' }, { status: 429 });
    }

    return NextResponse.json({ error: unavailableMessage }, { status: 502 });
  }

  throw error;
};
