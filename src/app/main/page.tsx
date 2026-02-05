"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Map } from "@/components/ui/Map";
import { useEffect, useState } from "react";
import { getAllAttractions } from "@/services/attractionService";
import { Attraction } from "@/types/attraction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка объектов
        const attractionsData = await getAllAttractions();
        setAttractions(attractionsData);
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
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
