import { AutofillServiceError } from '@/lib/ai/types';

export const getYandexCredentials = () => {
  const apiKey = process.env.YANDEX_GPT_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID;

  if (!apiKey || !folderId) {
    throw new AutofillServiceError('Не заданы YANDEX_GPT_API_KEY / YANDEX_FOLDER_ID', 500);
  }

  return { apiKey, folderId };
};

/** fetch внешнего сервиса: сетевые ошибки и не-2xx ответы превращаются в AutofillServiceError */
export const serviceFetch = async (serviceName: string, url: string, init: RequestInit) => {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new AutofillServiceError(`${serviceName}: сетевая ошибка ${String((error as Error).cause ?? error)}`, 504);
  }

  if (!response.ok) {
    throw new AutofillServiceError(`${serviceName}: ${response.status} ${await response.text()}`, response.status);
  }

  return response;
};

export const yandexFetch = serviceFetch;
