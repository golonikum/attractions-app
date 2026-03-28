import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    const url = `https://geocode-maps.yandex.ru/v1?apikey=${process.env.YA_MAPS_API_KEY}&lang=ru_RU&geocode=достопримечательности%20Саратова&format=json&results=15`;

    console.log(url);

    const response = await fetch(url, {
      method: 'GET',
    });
    console.log([...response.headers.entries()]);
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
