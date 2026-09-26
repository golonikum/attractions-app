import { getYandexCredentials, yandexFetch } from './yandex/api';

const IMAGE_SEARCH_URL = 'https://searchapi.api.cloud.yandex.net/v2/image/search';

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const extractFirstImageUrl = (xml: string) => {
  const doc = xml.match(/<doc[\s>][\s\S]*?<\/doc>/)?.[0];
  const link = doc?.match(/<image-link>([^<]+)<\/image-link>/)?.[1] ?? doc?.match(/<url>([^<]+)<\/url>/)?.[1];

  return link ? decodeXmlEntities(link.trim()) : undefined;
};

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
      imageSpec: { size: 'IMAGE_SIZE_LARGE', orientation: 'IMAGE_ORIENTATION_HORIZONTAL' },
      docsOnPage: 5,
      folderId,
    }),
  });

  const { rawData } = (await response.json()) as { rawData?: string };

  return rawData ? extractFirstImageUrl(Buffer.from(rawData, 'base64').toString('utf-8')) : undefined;
};
