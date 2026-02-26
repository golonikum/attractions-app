import { getAllGroups } from "@/services/groupService";
import { Group } from "@/types/group";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useGetAllGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const groupsData = await getAllGroups();
      setGroups(groupsData);
    } catch (error) {
      toast.error("Не удалось загрузить данные городов");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    isLoading,
    setGroups,
    groups,
    fetchData,
  };
};
