"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Map } from "@/components/ui/Map";
import { useEffect, useState } from "react";
import { getAllAttractions } from "@/services/attractionService";
import { Attraction } from "@/types/attraction";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllGroups } from "@/services/groupService";
import { DEFAULT_ATTRACTION_ZOOM, DEFAULT_LOCATION } from "@/lib/ymaps";

export default function MainPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка объектов
        const groupsData = await getAllGroups();
        const attractionsData = await getAllAttractions();
        setAttractions(attractionsData);

        const groupId = searchParams.get("groupId");

        if (groupId) {
          const group = groupsData.find((item) => item.id === groupId);

          if (group) {
            setLocation({
              zoom: group.zoom,
              center: [group.coordinates[1], group.coordinates[0]],
            });
          }
        }

        const attractionId = searchParams.get("attractionId");

        if (attractionId) {
          const attraction = attractionsData.find(
            (item) => item.id === groupId,
          );

          if (attraction) {
            setLocation({
              zoom: DEFAULT_ATTRACTION_ZOOM,
              center: [attraction.coordinates[1], attraction.coordinates[0]],
            });
          }
        }
      } catch (error) {
        toast.error("Не удалось загрузить объекты");
      }
    };

    fetchData();
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
            <Map
              attractions={attractions}
              onAttractionClick={(attraction) => {
                router.push(`/attractions/${attraction.id}`);
              }}
              location={location}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
