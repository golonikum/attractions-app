import { z } from 'zod';

import { getYandexCredentials, yandexFetch } from '@/lib/yandex/api';

import { AutofillRefusalError, LlmProvider, StructuredRequest } from '../types';

const YANDEX_GPT_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

interface YandexGptResponse {
  result: {
    alternatives: {
      message: { role: string; text: string };
      status: string;
    }[];
  };
}

export const createYandexGptProvider = (): LlmProvider => ({
  async generateStructured<T>({ system, user, schema, maxTokens = 2000 }: StructuredRequest<T>): Promise<T> {
    const { apiKey, folderId } = getYandexCredentials();

    const response = await yandexFetch('YandexGPT', YANDEX_GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${apiKey}`,
        'x-folder-id': folderId,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/yandexgpt/latest`,
        completionOptions: { stream: false, temperature: 0.1, maxTokens },
        messages: [
          { role: 'system', text: system },
          { role: 'user', text: user },
        ],
        jsonSchema: { schema: z.toJSONSchema(schema) },
      }),
    });

    const data = (await response.json()) as YandexGptResponse;
    const alternative = data.result?.alternatives?.[0];

    if (alternative?.status !== 'ALTERNATIVE_STATUS_FINAL') {
      throw new AutofillRefusalError(`YandexGPT не вернул данные: ${alternative?.status}`);
    }

    try {
      return schema.parse(JSON.parse(alternative.message.text));
    } catch {
      throw new AutofillRefusalError('Ответ YandexGPT не соответствует схеме');
    }
  },
});
