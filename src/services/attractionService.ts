import { Attraction, CreateAttractionRequest, UpdateAttractionRequest } from '@/types/attraction';

import { request } from './request';

const ATTRACTIONS_API_URL = '/attractions';

export const getAttractionsByGroupId = async (groupId: string) =>
  request.get<{ attractions: Attraction[] }>(ATTRACTIONS_API_URL, { params: { groupId } });

export const getAllAttractions = async () => request.get<{ attractions: Attraction[] }>(ATTRACTIONS_API_URL);

export const getAttractionById = async (id: string) =>
  request.get<{ attraction: Attraction | null }>(`${ATTRACTIONS_API_URL}/${id}`);

export const createAttraction = async (attractionData: CreateAttractionRequest) =>
  request.post<{ attraction: Attraction | null }>(ATTRACTIONS_API_URL, attractionData);

export const updateAttraction = async (id: string, updateData: UpdateAttractionRequest) =>
  request.put<{ attraction: Attraction | null }>(`${ATTRACTIONS_API_URL}/${id}`, updateData);

export const deleteAttraction = async (id: string) => request.delete<void>(`${ATTRACTIONS_API_URL}/${id}`);

export const updateOrder = async (groupId: string, attractions: { id: string; order: number }[]) =>
  request.put<void>('/order', { groupId, attractions });
