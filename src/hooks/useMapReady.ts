import { useEffect, useState } from 'react';

import { initYMaps } from '@/lib/ymaps';

export const useMapReady = () => {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const initializeMap = async () => {
      const success = await initYMaps();
      setIsMapReady(success);
    };

    initializeMap();
  }, []);

  return { isMapReady };
};
