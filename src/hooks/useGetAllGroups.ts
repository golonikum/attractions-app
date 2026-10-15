import { getAllGroups } from '@/services/groupService';

import { useFetchList } from './useFetchList';

const loadGroups = async () => (await getAllGroups()).data.groups;

export const useGetAllGroups = () => {
  const { items, setItems, isLoading, fetchData } = useFetchList(loadGroups, 'Не удалось загрузить данные городов');

  return { groups: items, setGroups: setItems, isLoading, fetchData };
};
