import { z } from 'zod';

import { getLlmProvider } from '@/lib/ai';
import { getCoordinatesFromYandexMapsUrl } from '@/lib/parseYandexMapsUrl';
import { searchImage } from '@/lib/yandexImageSearch';
import { AttractionAutofillResponse } from '@/types/attraction';

export const ATTRACTION_CATEGORIES = ['Церковь', 'Природа', 'Культура'] as const;

const AttractionAutofillSchema = z.object({
  category: z.enum(ATTRACTION_CATEGORIES),
  description: z.string(),
});

const SYSTEM_PROMPT = `Ты — справочник по достопримечательностям. По названию объекта, населённому пункту и точным координатам верни:
- category: одно из значений «Церковь» (храмы, монастыри, часовни и другие религиозные объекты), «Природа» (парки, озёра, реки, горы, заповедники и другие природные объекты), «Культура» (музеи, усадьбы, крепости, памятники, архитектура и всё остальное);
- description: описание объекта на русском языке, от 5 до 20 предложений: история, архитектура или природные особенности, чем интересен для посещения, если это храм или монастырь - какие святыни, мощи каких конкретно святых или какие именно чудотворные иконы там есть.
Опирайся на координаты, чтобы не перепутать объект с одноимёнными в других местах. Не выдумывай факты: если об объекте мало известно, опиши только то, в чём уверен.`;

export const autofillAttraction = async ({
  name,
  groupName,
  groupTag,
  yaMapUrl,
}: {
  name: string;
  groupName: string;
  groupTag?: string | null;
  yaMapUrl: string;
}): Promise<{ autofill: AttractionAutofillResponse; approximateCoordinates: boolean }> => {
  const { coordinates, isApproximate } = await getCoordinatesFromYandexMapsUrl(yaMapUrl);
  const place = [groupName, groupTag].filter(Boolean).join(', ');

  const [gptResult, imageResult] = await Promise.allSettled([
    getLlmProvider().generateStructured({
      system: SYSTEM_PROMPT,
      user: `Объект: ${name}\nНаселённый пункт: ${place}\nКоординаты: ${coordinates[0]}, ${coordinates[1]}`,
      schema: AttractionAutofillSchema,
    }),
    searchImage(`${name} ${groupName}`),
  ]);

  if (gptResult.status === 'rejected') {
    throw gptResult.reason;
  }

  if (imageResult.status === 'rejected') {
    console.error('Image search error:', imageResult.reason);
  }

  return {
    autofill: {
      ...gptResult.value,
      coordinates,
      yaMapUrl: yaMapUrl.trim(),
      imageUrl: imageResult.status === 'fulfilled' ? imageResult.value : undefined,
    },
    approximateCoordinates: isApproximate,
  };
};
