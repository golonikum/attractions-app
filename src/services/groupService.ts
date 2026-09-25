import { CreateGroupRequest, Group, GroupAutofillResponse, UpdateGroupRequest } from '@/types/group';

import { request } from './request';

const GROUPS_API_URL = '/groups';

export const getAllGroups = async () => request.get<{ groups: Group[] }>(GROUPS_API_URL);

export const createGroup = async (groupData: CreateGroupRequest) =>
  request.post<{ group: Group | null }>(GROUPS_API_URL, groupData);

export const updateGroup = async (id: string, groupData: UpdateGroupRequest) =>
  request.put<{ group: Group | null }>(`${GROUPS_API_URL}/${id}`, groupData);

export const autofillGroup = async (name: string) =>
  request.post<{ autofill: GroupAutofillResponse }>(`${GROUPS_API_URL}/autofill`, { name });

export const deleteGroup = async (id: string) => request.delete<void>(`${GROUPS_API_URL}/${id}`);
