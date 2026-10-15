import { getAllAttractions } from '@/services/attractionService';

import { useFetchList } from './useFetchList';

const loadAttractions = async () => (await getAllAttractions()).data.attractions;

export const useGetAllAttractions = () => {
  const { items, setItems, isLoading, fetchData } = useFetchList(
    loadAttractions,
    'Не удалось загрузить данные объектов',
  );

  return { attractions: items, setAttractions: setItems, isLoading, fetchData };
};
