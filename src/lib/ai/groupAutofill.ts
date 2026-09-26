import { z } from 'zod';

import { getLlmProvider } from '@/lib/ai';
import { GroupAutofillResponse } from '@/types/group';

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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const autofillGroupByName = async (name: string): Promise<GroupAutofillResponse> => {
  const { description, tag, latitude, longitude, spbDistance, lenDistance, zoom } =
    await getLlmProvider().generateStructured({
      system: SYSTEM_PROMPT,
      user: `Населённый пункт: ${name}`,
      schema: GroupAutofillSchema,
    });

  return {
    description: `${description}, ${Math.min(spbDistance, lenDistance)} км`,
    tag,
    coordinates: [clamp(latitude, -90, 90), clamp(longitude, -180, 180)],
    zoom: clamp(zoom, 1, 20),
  };
};
