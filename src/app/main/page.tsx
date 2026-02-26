"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Map } from "@/components/ui/Map";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_ATTRACTION_ZOOM } from "@/lib/constants";
import { useGetAllGroups } from "@/hooks/useGetAllGroups";
import { useGetAllAttractions } from "@/hooks/useGetAllAttractions";
import { LoadingStub } from "@/components/ui/stubs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useLocation } from "@/hooks/useLocation";

export default function MainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { groups, isLoading: isGroupsLoading } = useGetAllGroups();
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
  const { attractions, isLoading: isAttractionsLoading } =
    useGetAllAttractions();
  const isLoading = isGroupsLoading || isAttractionsLoading;

  useEffect(() => {
    if (attractions.length && groups.length) {
      const groupId = searchParams.get("groupId");

      if (groupId) {
        const group = groups.find((item) => item.id === groupId);

        if (group) {
          setLocation({
            zoom: group.zoom,
            center: [group.coordinates[1], group.coordinates[0]],
          });
        }
      }

      const attractionId = searchParams.get("attractionId");

      if (attractionId) {
        const attraction = attractions.find((item) => item.id === attractionId);

        if (attraction) {
          setLocation({
            zoom: DEFAULT_ATTRACTION_ZOOM,
            center: [attraction.coordinates[1], attraction.coordinates[0]],
          });
        }
      }
    }
  }, [groups, attractions, searchParams]);

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
