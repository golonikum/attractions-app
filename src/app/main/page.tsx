"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import {
  LOCATION,
  reactify,
  YMap,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapMarker,
  initYMaps,
} from "@/lib/ymaps";
import { useEffect, useState } from "react";

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

      <div className="container mx-auto pt-24 px-4 pb-8">
        <div className="flex flex-col gap-8 justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Достопримечательности</h1>
          <div style={{ width: "600px", height: "400px" }}>
            {isMapReady ? (
              <YMap location={LOCATION}>
                <YMapDefaultSchemeLayer />
                <YMapDefaultFeaturesLayer />

                <YMapMarker coordinates={[37.588144, 55.733842]} draggable={true}>
                  <section>
                    <h1>You can drag this header</h1>
                  </section>
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
