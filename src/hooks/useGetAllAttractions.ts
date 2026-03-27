import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getAllAttractions } from '@/services/attractionService';
import { Attraction } from '@/types/attraction';

export const useGetAllAttractions = (cachedAttractions: Attraction[] = []) => {
  const [attractions, setAttractions] = useState<Attraction[]>(cachedAttractions);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const data = await getAllAttractions();
      setAttractions(data);
    } catch (error) {
      toast.error('Не удалось загрузить данные объектов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    isLoading,
    attractions,
    fetchData,
    setAttractions,
  };
};
