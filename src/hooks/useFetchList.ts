import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Загрузка списка пользователя с сервера: после входа и по запросу (fetchData).
 * silent — перезагрузить без индикатора загрузки (после изменений данных).
 */
export const useFetchList = <T>(load: () => Promise<T[]>, errorMessage: string) => {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (silent?: boolean) => {
    setIsLoading(!silent);

    try {
      setItems(await load());
    } catch (error) {
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user?.id]);

  return { items, setItems, isLoading, fetchData };
};
