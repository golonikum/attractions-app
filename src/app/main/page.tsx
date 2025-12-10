"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import {
  LOCATION,
  YMap,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  initYMaps,
} from "@/lib/ymaps";
import { useEffect, useState } from "react";
import { MarkerPin } from "@/components/MarkerPin";

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
          <div style={{ width: "100%", flex: "1 0 0" }}>
            {isMapReady ? (
              <YMap location={LOCATION}>
                <YMapDefaultSchemeLayer />
                <YMapDefaultFeaturesLayer />
                <MarkerPin coordinates={[37.66785, 55.729256]} visited />
                <MarkerPin coordinates={[37.89785, 55.779256]} />
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
