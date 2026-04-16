import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { getAllAttractions } from '@/services/attractionService';
import { Attraction } from '@/types/attraction';

export const useGetAllAttractions = () => {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (silent?: boolean) => {
    setIsLoading(!silent && true);

    try {
      const { data } = await getAllAttractions();
      setAttractions(data.attractions);
    } catch (error) {
      toast.error('Не удалось загрузить данные объектов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user?.id]);

  return {
    isLoading,
    attractions,
    fetchData,
    setAttractions,
  };
};
