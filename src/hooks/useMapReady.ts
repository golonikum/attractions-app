import { initYMaps } from "@/lib/ymaps";
import { useEffect, useState } from "react";

export const useMapReady = () => {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const initializeMap = async () => {
      const success = await initYMaps();
      setIsMapReady(success);
    };

    initializeMap();
  }, []);

  return { isMapReady };
};
