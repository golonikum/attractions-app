import { cookies } from 'next/headers';

import { getUserIdFromToken } from '../serverAuth';

export async function getUserIdFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const { userId } = getUserIdFromToken(token);

  return userId;
}
