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
} from "@/lib/ymaps";

export default function MainPage() {
  return (
    <ProtectedRoute>
      <Navigation />

      <div className="container mx-auto pt-24 px-4 pb-8">
        <div className="flex flex-col gap-8 justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Достопримечательности</h1>
          <div style={{ width: "600px", height: "400px" }}>
            <YMap location={LOCATION}>
              <YMapDefaultSchemeLayer />
              <YMapDefaultFeaturesLayer />

              <YMapMarker coordinates={[37.588144, 55.733842]} draggable={true}>
                <section>
                  <h1>You can drag this header</h1>
                </section>
              </YMapMarker>
            </YMap>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
