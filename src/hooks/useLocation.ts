import { useEffect, useState } from 'react';

import { getInitialLocation } from '@/lib/getInitialLocation';

import { useDebounceCallback } from './useDebounceCallback';

export const useLocation = ({
  selectedCoordinates,
  selectedZoom,
  setSelectedCoordinates,
  setSelectedZoom,
}: {
  selectedZoom: string[];
  setSelectedZoom: (value: string[]) => void;
  selectedCoordinates: string[];
  setSelectedCoordinates: (value: string[]) => void;
}) => {
  const [location, setLocation] = useState(getInitialLocation({ selectedCoordinates, selectedZoom }));

  useEffect(() => {
    setSelectedZoom([`${location.zoom}`]);
    setSelectedCoordinates([`${location.center[0]}`, `${location.center[1]}`]);
  }, [location]);

  const setLocationDebounced = useDebounceCallback(setLocation, 500);

  return { location, setLocation: setLocationDebounced };
};
