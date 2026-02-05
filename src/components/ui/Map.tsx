import {
  DEFAULT_LOCATION,
  YMap,
  YMapControlButton,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapListener,
  YMapScaleControl,
} from "@/lib/ymaps";
import { Attraction } from "@/types/attraction";
import { FC, useContext, useEffect, useState } from "react";
import { MarkerPin } from "./MarkerPin";
import {
  YMapCenterLocation,
  YMapLocationRequest,
  YMapZoomLocation,
} from "ymaps3";
import { useMapReady } from "@/hooks/useMapReady";
import { ThemeProviderContext } from "@/contexts/ThemeContext";
import { Minus, Plus } from "lucide-react";

type MapPropsType = {
  attractions?: Attraction[];
  location?: YMapCenterLocation & YMapZoomLocation;
  onAttractionClick?: (attraction: Attraction) => void;
};

export const Map: FC<MapPropsType> = ({
  attractions,
  location: defaultLocation = DEFAULT_LOCATION,
  onAttractionClick,
}) => {
  const { isMapReady } = useMapReady();
  const { theme } = useContext(ThemeProviderContext);
  const [location, setLocation] = useState(defaultLocation);

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  const onClickZoom = (operation: "plus" | "minus") => () => {
    setLocation((val) => ({
      center: val.center,
      zoom: val.zoom + (operation === "plus" ? 1 : -1),
    }));
  };

  return isMapReady ? (
    <YMap
      location={{ ...location }}
      mode="raster"
      zoomStrategy="zoomToCenter"
      theme={theme}
    >
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />
      <YMapListener
        onUpdate={({ location }) => {
          setLocation(location);
        }}
      />
      <YMapControls position="left top">
        <YMapScaleControl />
      </YMapControls>
      <YMapControls position="right" orientation="vertical">
        <YMapControlButton
          onClick={onClickZoom("plus")}
          disabled={location.zoom === 20}
        >
          <Plus />
        </YMapControlButton>
        <YMapControlButton
          onClick={onClickZoom("minus")}
          disabled={location.zoom === 1}
        >
          <Minus />
        </YMapControlButton>
      </YMapControls>
      {attractions?.map((attraction) => (
        <MarkerPin
          key={attraction.id}
          coordinates={[attraction.coordinates[1], attraction.coordinates[0]]}
          visited={attraction.isVisited}
          title={attraction.name}
          onClick={() => onAttractionClick?.(attraction)}
          isActive={
            location.center[0] === attraction.coordinates[0] &&
            location.center[1] === attraction.coordinates[1]
          }
        />
      ))}
    </YMap>
  ) : (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <p>Загрузка карты...</p>
    </div>
  );
};
