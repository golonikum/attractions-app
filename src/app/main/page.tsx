"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Map } from "@/components/ui/Map";
import { useRouter } from "next/navigation";
import { LoadingStub } from "@/components/ui/stubs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useLocation } from "@/hooks/useLocation";
import { useData } from "@/contexts/DataContext";

export default function MainPage() {
  const router = useRouter();
  const {
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  } = useQueryParams(["zoom", "coordinates"] as const);
  const { location, setLocation } = useLocation({
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  });
  const { attractions, isAttractionsLoading } = useData();
  const isLoading = isAttractionsLoading;

  if (isLoading) {
    return <LoadingStub />;
  }

  return (
    <ProtectedRoute>
      <div
        className="container lg:max-w-full mx-auto pt-20 px-4 pb-8"
        style={{ height: "calc(100vh)" }}
      >
        <div
          className="flex flex-col gap-4 justify-between items-center"
          style={{ height: "100%" }}
        >
          <div style={{ width: "100%", flex: "1 0 0" }}>
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
    </ProtectedRoute>
  );
}
