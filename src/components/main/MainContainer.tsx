'use client';

import { useState } from 'react';

import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLocation } from '@/hooks/useLocation';
import { useQueryParams } from '@/hooks/useQueryParams';
import { Attraction } from '@/types/attraction';

import { Map } from '@/components/ui/Map';
import { LoadingStub } from '@/components/ui/stubs';

import { MainAttractionWindow } from './MainAttractionWindow';

export default function MainContainer() {
  const { isWideScreen } = useIsMobile();
  const { attractions, isAttractionsLoading } = useData();
  const { selectedZoom, setSelectedZoom, selectedCoordinates, setSelectedCoordinates } = useQueryParams([
    'zoom',
    'coordinates',
  ]);
  const { location, setLocation } = useLocation({
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  });
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | undefined>(undefined);

  return isAttractionsLoading ? (
    <LoadingStub />
  ) : (
    <div className="max-w-full pt-[65px] h-full h-screen">
      <div className="flex flex-col gap-4 justify-between items-center h-full">
        <div className="w-full flex-1">
          <Map
            items={attractions}
            getLink={(id) => `/attractions/${id}`}
            location={location}
            setLocation={setLocation}
            onClick={
              isWideScreen
                ? (id) => {
                    console.log(id);
                    setSelectedAttraction(attractions.find((attraction) => attraction.id === id));
                  }
                : undefined
            }
          />
        </div>
      </div>
      {selectedAttraction && (
        <MainAttractionWindow item={selectedAttraction} onClose={() => setSelectedAttraction(undefined)} />
      )}
    </div>
  );
}
