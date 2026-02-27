import { FC, useContext } from 'react';
import { Minus, Plus } from 'lucide-react';
import { YMapCenterLocation, YMapZoomLocation } from 'ymaps3';

import { ThemeProviderContext } from '@/contexts/ThemeContext';
import { useMapReady } from '@/hooks/useMapReady';
import { DEFAULT_LOCATION } from '@/lib/constants';
import { isAttraction } from '@/lib/utils';
import {
  YMap,
  YMapControlButton,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapGeolocationControl,
  YMapListener,
  YMapScaleControl,
} from '@/lib/ymaps';
import { Attraction } from '@/types/attraction';
import { GroupWithAttractions } from '@/types/group';

import { MarkerPin } from './MarkerPin';

type MapPropsType = {
  items?: Attraction[] | GroupWithAttractions[];
  location?: YMapCenterLocation & YMapZoomLocation;
  setLocation: React.Dispatch<React.SetStateAction<YMapCenterLocation & YMapZoomLocation>>;
  onItemClick?: (id: string) => void;
};

export const Map: FC<MapPropsType> = ({ items, location = DEFAULT_LOCATION, setLocation, onItemClick }) => {
  const { isMapReady } = useMapReady();
  const { theme } = useContext(ThemeProviderContext);
  // const [location, setLocation] = useState(defaultLocation);

  // useEffect(() => {
  //   setLocation(defaultLocation);
  // }, [defaultLocation]);

  const onClickZoom = (operation: 'plus' | 'minus') => () => {
    setLocation((val) => ({
      center: val.center,
      zoom: val.zoom + (operation === 'plus' ? 1 : -1),
    }));
  };

  return isMapReady ? (
    <YMap location={{ ...location }} mode="raster" zoomStrategy="zoomToCenter" theme={theme}>
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />
      <YMapListener
        onUpdate={(args) => {
          setLocation(args.location);
        }}
      />
      <YMapControls position="left top">
        <YMapScaleControl />
      </YMapControls>
      <YMapControls position="right top">
        <YMapGeolocationControl />
      </YMapControls>
      <YMapControls position="right" orientation="vertical">
        <YMapControlButton onClick={onClickZoom('plus')} disabled={location.zoom === 20}>
          <Plus />
        </YMapControlButton>
        <YMapControlButton onClick={onClickZoom('minus')} disabled={location.zoom === 1}>
          <Minus />
        </YMapControlButton>
      </YMapControls>
      {items?.map((item) => {
        const isActive =
          Math.abs(location.center[0] - item.coordinates[1]) < 0.00001 &&
          Math.abs(location.center[1] - item.coordinates[0]) < 0.00001;

        const isVisited = isAttraction(item)
          ? item.isVisited
          : item.attractions.some((attraction) => attraction.isVisited);

        return (
          <MarkerPin
            key={item.id}
            coordinates={[item.coordinates[1], item.coordinates[0]]}
            visited={isVisited}
            title={item.name}
            onClick={() => onItemClick?.(item.id)}
            isActive={isActive}
          />
        );
      })}
    </YMap>
  ) : (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <p>Загрузка карты...</p>
    </div>
  );
};
