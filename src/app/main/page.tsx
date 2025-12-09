"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import {
  LOCATION,
  YMap,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapMarker,
  initYMaps,
} from "@/lib/ymaps";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
// import { YMapZoomControl } from "@yandex/ymaps3-default-ui-theme";

export default function MainPage() {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const initializeMap = async () => {
      const success = await initYMaps();
      setIsMapReady(success);
    };

    initializeMap();
  }, []);
  return (
    <ProtectedRoute>
      <Navigation />

      <div
        className="container mx-auto pt-20 px-4 pb-8"
        style={{ height: "calc(100vh)" }}
      >
        <div
          className="flex flex-col gap-4 justify-between items-center"
          style={{ height: "100%" }}
        >
          <h1 className="text-3xl font-bold">Достопримечательности</h1>
          <div style={{ width: "100%", flex: "1 0 0" }}>
            {isMapReady ? (
              <YMap location={LOCATION}>
                <YMapDefaultSchemeLayer />
                <YMapDefaultFeaturesLayer />
                <YMapMarker
                  coordinates={[37.66785, 55.729256]}
                  draggable={false}
                >
                  <MapPin
                    className="h-8 w-8 text-muted-foreground shrink-0 relative"
                    style={{ top: "-32px", left: "-16px" }}
                  />
                </YMapMarker>
              </YMap>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <p>Загрузка карты...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
