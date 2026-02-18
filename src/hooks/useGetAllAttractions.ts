import { getAllAttractions } from "@/services/attractionService";
import { Attraction } from "@/types/attraction";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useGetAllAttractions = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllAttractions();
        setAttractions(data);
      } catch (error) {
        toast.error("Не удалось загрузить данные объектов");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    isLoading,
    attractions,
  };
};
