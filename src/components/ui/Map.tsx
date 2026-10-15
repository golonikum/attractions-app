import { FC, useContext } from 'react';
import { Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { YMapCenterLocation, YMapZoomLocation } from 'ymaps3';

import { ThemeProviderContext } from '@/contexts/ThemeContext';
import { useDebounceCallback } from '@/hooks/useDebounceCallback';
import { useMapReady } from '@/hooks/useMapReady';
import { DEFAULT_LOCATION } from '@/lib/constants';
import { toLngLat } from '@/lib/geo';
import { isAttraction } from '@/lib/utils';
import {
  YMap,
  YMapControlButton,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapGeolocationControl,
  YMapListener,
} from '@/lib/ymaps';
import { Attraction } from '@/types/attraction';
import { GroupWithAttractions } from '@/types/group';

import { MarkerPin } from './MarkerPin';

type MapPropsType = {
  items?: Attraction[] | GroupWithAttractions[];
  location?: YMapCenterLocation & YMapZoomLocation;
  setLocation: React.Dispatch<React.SetStateAction<YMapCenterLocation & YMapZoomLocation>>;
  getLink: (id: string) => string;
  onClick?: (id: string) => void;
  controls?: React.ReactNode;
};

export const Map: FC<MapPropsType> = ({
  items,
  controls,
  location = DEFAULT_LOCATION,
  setLocation,
  getLink,
  onClick,
}) => {
  const { isMapReady } = useMapReady();
  const { theme } = useContext(ThemeProviderContext);
  const setLocationDebounced = useDebounceCallback(setLocation, 500);

  const onClickZoom = (operation: 'plus' | 'minus') => () => {
    setLocation((val) => ({
      center: val.center,
      zoom: val.zoom + (operation === 'plus' ? 1 : -1),
    }));
  };

  const renderMarker = ({
    item,
    isVisited,
    isActive,
  }: {
    item: Attraction | GroupWithAttractions;
    isActive: boolean;
    isVisited?: boolean;
  }) => (
    <MarkerPin
      key={item.id}
      coordinates={toLngLat(item.coordinates)}
      visited={isVisited}
      title={item.name}
      isActive={isActive}
      onClick={() => onClick?.(item.id)}
    />
  );

  return isMapReady ? (
    <YMap
      location={{ ...location }}
      copyrightsPosition="bottom right"
      mode="raster"
      zoomStrategy="zoomToCenter"
      theme={theme}
      showScaleInCopyrights
    >
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />
      <YMapListener
        onUpdate={(args) => {
          setLocationDebounced(args.location);
        }}
      />
      <YMapControls position="left top">
        <YMapGeolocationControl />
      </YMapControls>
      <YMapControls position="left bottom">{controls}</YMapControls>
      <YMapControls position="left" orientation="vertical">
        <YMapControlButton onClick={onClickZoom('plus')} disabled={location.zoom === 20}>
          <Plus />
        </YMapControlButton>
        <YMapControlButton onClick={onClickZoom('minus')} disabled={location.zoom === 1}>
          <Minus />
        </YMapControlButton>
      </YMapControls>
      {items?.map((item) => {
        const [lng, lat] = toLngLat(item.coordinates);
        const isActive = Math.abs(location.center[0] - lng) < 0.00001 && Math.abs(location.center[1] - lat) < 0.00001;

        const isVisited = isAttraction(item)
          ? item.isVisited
          : item.attractions.some((attraction) => attraction.isVisited);

        return onClick ? (
          renderMarker({ item, isVisited, isActive })
        ) : (
          <Link href={getLink(item.id)} key={item.id}>
            {renderMarker({ item, isVisited, isActive })}
          </Link>
        );
      })}
    </YMap>
  ) : (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <p>Загрузка карты...</p>
    </div>
  );
};
