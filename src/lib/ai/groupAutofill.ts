import { z } from 'zod';

import { GroupAutofillResponse } from '@/types/group';

const YANDEX_GPT_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

const GroupAutofillSchema = z.object({
  description: z.string(),
  tag: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  spbDistance: z.number(),
  lenDistance: z.number(),
  zoom: z.number().int(),
});

const SYSTEM_PROMPT = `Ты — справочник по населённым пунктам. По названию населённого пункта верни:
- description: год основания и количество жителей, например "1678 г., 104.078 чел.";
- tag: регион (область, край, республика) на русском, например «Московская область»; для зарубежных — страна;
- latitude, longitude: координаты центра населённого пункта в десятичных градусах;
- spbDistance: расстояние в километрах (округлить до целых) по автомобильной дороге от точки в Санкт-Петербурге [59.913510, 30.489220] до населенного пункта;
- lenDistance: расстояние в километрах (округлить до целых) по автомобильной дороге от точки [51.613510, 46.497822] (с. Ленинское Саратовской области) до населенного пункта;
- zoom: масштаб Яндекс Карт от 1 до 20, при котором населённый пункт виден целиком (город-миллионник ≈ 10–11, средний город ≈ 12, малый город ≈ 13, село ≈ 14).
Если название неоднозначно, выбери наиболее известный населённый пункт.`;

interface YandexGptResponse {
  result: {
    alternatives: {
      message: { role: string; text: string };
      status: string;
    }[];
  };
}

export class AutofillRefusalError extends Error {}

export class AutofillServiceError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const requestYandexGpt = async (name: string) => {
  const apiKey = process.env.YANDEX_GPT_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID;

  if (!apiKey || !folderId) {
    throw new AutofillServiceError('Не заданы YANDEX_GPT_API_KEY / YANDEX_FOLDER_ID', 500);
  }

  const response = await fetch(YANDEX_GPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${apiKey}`,
      'x-folder-id': folderId,
    },
    body: JSON.stringify({
      modelUri: `gpt://${folderId}/yandexgpt/latest`,
      completionOptions: { stream: false, temperature: 0.1, maxTokens: 2000 },
      messages: [
        { role: 'system', text: SYSTEM_PROMPT },
        { role: 'user', text: `Населённый пункт: ${name}` },
      ],
      jsonSchema: { schema: z.toJSONSchema(GroupAutofillSchema) },
    }),
  });

  if (!response.ok) {
    throw new AutofillServiceError(`YandexGPT: ${response.status} ${await response.text()}`, response.status);
  }

  return (await response.json()) as YandexGptResponse;
};

const parseAutofill = (data: YandexGptResponse) => {
  const alternative = data.result?.alternatives?.[0];

  if (alternative?.status !== 'ALTERNATIVE_STATUS_FINAL') {
    throw new AutofillRefusalError(`Модель не вернула данные: ${alternative?.status}`);
  }

  try {
    return GroupAutofillSchema.parse(JSON.parse(alternative.message.text));
  } catch {
    throw new AutofillRefusalError('Ответ модели не соответствует схеме');
  }
};

export const autofillGroupByName = async (name: string): Promise<GroupAutofillResponse> => {
  const { description, tag, latitude, longitude, spbDistance, lenDistance, zoom } = parseAutofill(
    await requestYandexGpt(name),
  );

  return {
    description: `${description}, ${Math.min(spbDistance, lenDistance)} км`,
    tag,
    coordinates: [clamp(latitude, -90, 90), clamp(longitude, -180, 180)],
    zoom: clamp(zoom, 1, 20),
  };
};
