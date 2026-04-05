import { getAuthHeaders } from '@/lib/getAuthHeaders';

const API_URL = '/api/import';

export const importAttractionsFor = async (): Promise<any> => {
  const response = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to import attractions');
  }

  const data = await response.json();

  return data.group;
};
