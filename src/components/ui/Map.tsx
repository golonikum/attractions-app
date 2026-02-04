// import {
//   DEFAULT_LOCATION,
//   //   YMap,
//   //   YMapControlButton,
//   //   YMapControls,
//   //   YMapDefaultFeaturesLayer,
//   //   YMapDefaultSchemeLayer,
//   //   YMapListener,
//   //   YMapScaleControl,
//   //   YMapZoomControl,
// } from "@/lib/ymaps";
import { Attraction } from "@/types/attraction";
import { FC, useContext, useEffect, useState } from "react";
import { MarkerPin } from "./MarkerPin";
// import {
//   YMapCenterLocation,
//   YMapLocationRequest,
//   YMapZoomLocation,
// } from "ymaps3";
// import { useMapReady } from "@/hooks/useMapReady";
import { ThemeProviderContext } from "@/contexts/ThemeContext";
import { Minus, Plus } from "lucide-react";
import {
  YMap,
  YMapComponentsProvider,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapGeolocationControl,
  YMapZoomControl,
} from "ymap3-components";
import {
  YMapCenterLocation,
  YMapLocationRequest,
  YMapZoomLocation,
} from "ymaps3";

type MapPropsType = {
  attractions?: Attraction[];
  location?: YMapLocationRequest;
};

export const DEFAULT_LOCATION: YMapLocationRequest = {
  center: [37.588144, 55.733842],
  zoom: 5,
};

export const Map: FC<MapPropsType> = ({
  attractions,
  location: defaultLocation = DEFAULT_LOCATION,
}) => {
  //   const { isMapReady } = useMapReady();
  const { theme } = useContext(ThemeProviderContext);
  const [location, setLocation] = useState(defaultLocation);

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  const onClickZoom = (operation: "plus" | "minus") => () => {
    console.log(operation);
    setLocation((val) => ({
      center: (val as YMapCenterLocation).center,
      zoom: (val as YMapZoomLocation).zoom + (operation === "plus" ? 1 : -1),
    }));
  };

  console.log(location);

  return (
    <YMapComponentsProvider apiKey={process.env.YA_MAPS_API_KEY!}>
      <YMap location={location} theme={theme}>
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapControls position="right top">
          <YMapGeolocationControl />
        </YMapControls>
        <YMapControls position="right">
          <YMapZoomControl easing="linear" />
        </YMapControls>
        {attractions?.map((attraction) => (
          <MarkerPin
            key={attraction.id}
            coordinates={[attraction.coordinates[1], attraction.coordinates[0]]}
            visited={attraction.isVisited}
            title={attraction.name}
          />
        ))}
      </YMap>
    </YMapComponentsProvider>
  );

  //   return isMapReady ? (
  //     <YMap location={{ ...location }} mode="raster" zoomStrategy="zoomToCenter">
  //       <YMapDefaultSchemeLayer theme={theme} />
  //       <YMapDefaultFeaturesLayer />
  //       <YMapListener
  //         onUpdate={({ type, camera, location }) => {
  //           console.log(type, camera.tilt, location);
  //           setLocation(location);
  //         }}
  //       />
  //       <YMapControls position="left top">
  //         <YMapScaleControl />
  //       </YMapControls>
  //       {/* <YMapControls position="left">
  //         <YMapZoomControl easing="linear" />
  //       </YMapControls> */}
  //       <YMapControls position="right" orientation="vertical">
  //         <YMapControlButton
  //           onClick={onClickZoom("plus")}
  //           disabled={(location as YMapZoomLocation).zoom === 20}
  //         >
  //           <Plus />
  //         </YMapControlButton>
  //         <YMapControlButton
  //           onClick={onClickZoom("minus")}
  //           disabled={(location as YMapZoomLocation).zoom === 1}
  //         >
  //           <Minus />
  //         </YMapControlButton>
  //       </YMapControls>
  //       {attractions?.map((attraction) => (
  //         <MarkerPin
  //           key={attraction.id}
  //           coordinates={[attraction.coordinates[1], attraction.coordinates[0]]}
  //           visited={attraction.isVisited}
  //           title={attraction.name}
  //         />
  //       ))}
  //     </YMap>
  //   ) : (
  //     <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
  //       <p>Загрузка карты...</p>
  //     </div>
  //   );
};
