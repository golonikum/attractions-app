import { getYandexCredentials, yandexFetch } from './yandex/api';

const IMAGE_SEARCH_URL = 'https://searchapi.api.cloud.yandex.net/v2/image/search';
/** Фото с Яндекс Карт встречаются в выдаче не первыми — запрашиваем с запасом */
const DOCS_ON_PAGE = 30;
/** Хранилище фото организаций Яндекс Карт / Справочника: avatars.mds.yandex.net/get-altay/<group>/<id>/<size> */
const YANDEX_MAPS_PHOTO_REGEX = /^https?:\/\/avatars\.mds\.yandex\.net\/get-altay\/(\d+)\/([^/?#]+)/;

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const extractImageUrls = (xml: string) =>
  (xml.match(/<doc[\s>][\s\S]*?<\/doc>/g) ?? [])
    .map((doc) => doc.match(/<image-link>([^<]+)<\/image-link>/)?.[1] ?? doc.match(/<url>([^<]+)<\/url>/)?.[1])
    .filter((link): link is string => Boolean(link))
    .map((link) => decodeXmlEntities(link.trim()));

/** Первое фото из Яндекс Карт в оригинальном размере, иначе undefined */
const findYandexMapsPhoto = (urls: string[]) => {
  const match = urls.map((url) => url.match(YANDEX_MAPS_PHOTO_REGEX)).find(Boolean);

  return match ? `https://avatars.mds.yandex.net/get-altay/${match[1]}/${match[2]}/orig` : undefined;
};

/** Ищет фото объекта среди фотографий Яндекс Карт; если таких нет — undefined (фото с других сайтов не берём) */
export const searchImage = async (queryText: string) => {
  const { apiKey, folderId } = getYandexCredentials();

  const response = await yandexFetch('Yandex Image Search', IMAGE_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${apiKey}`,
    },
    body: JSON.stringify({
      query: { searchType: 'SEARCH_TYPE_RU', queryText },
      docsOnPage: DOCS_ON_PAGE,
      folderId,
    }),
  });

  const { rawData } = (await response.json()) as { rawData?: string };

  return rawData ? findYandexMapsPhoto(extractImageUrls(Buffer.from(rawData, 'base64').toString('utf-8'))) : undefined;
};
