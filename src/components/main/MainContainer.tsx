'use client';

import { useRouter } from 'next/navigation';

import { useData } from '@/contexts/DataContext';
import { useLocation } from '@/hooks/useLocation';
import { useQueryParams } from '@/hooks/useQueryParams';

import { Map } from '@/components/ui/Map';

export default function MainContainer() {
  const router = useRouter();
  const { attractions } = useData();
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

  return (
    <div className="max-w-full pt-[65px] h-full h-screen">
      <div className="flex flex-col gap-4 justify-between items-center h-full">
        <div className="w-full flex-1">
          <Map
            items={attractions}
            onItemClick={(id) => {
              router.push(`/attractions/${id}`);
            }}
            location={location}
            setLocation={setLocation}
          />
        </div>
      </div>
    </div>
  );
}
