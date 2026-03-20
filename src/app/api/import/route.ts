import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    const response = await fetch(
      `https://geocode-maps.yandex.ru/v1?apikey=${process.env.YA_MAPS_API_KEY}&lang=ru_RU&geocode=достопримечательности%20Саратова&format=json&results=15`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
    );
    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        items: data,
      },
      { status: 200 },
    );
  });
}
