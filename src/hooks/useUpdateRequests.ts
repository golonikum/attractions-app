import { useData } from "@/contexts/DataContext";
import {
  createAttraction,
  deleteAttraction,
  updateAttraction,
} from "@/services/attractionService";
import { createGroup, deleteGroup, updateGroup } from "@/services/groupService";
import {
  CreateAttractionRequest,
  UpdateAttractionRequest,
} from "@/types/attraction";
import { CreateGroupRequest, UpdateGroupRequest } from "@/types/group";

export const useUpdateRequests = () => {
  const { setGroups, setAttractions } = useData();

  return {
    createGroup: async (groupData: CreateGroupRequest) => {
      const newGroup = await createGroup(groupData);
      setGroups((groups) => [newGroup, ...groups]);
      return newGroup;
    },
    updateGroup: async (id: string, formData: UpdateGroupRequest) => {
      const updatedGroup = await updateGroup(id, formData);

      setGroups((groups) => {
        const newGroups = [...groups];
        const index = groups.findIndex((item) => item.id === id);

        if (index !== -1) {
          newGroups.splice(index, 1, updatedGroup);
        }

        return newGroups;
      });

      return updatedGroup;
    },
    deleteGroup: async (id: string) => {
      await deleteGroup(id);
      setGroups((groups) => groups.filter((group) => group.id !== id));
    },

    createAttraction: async (attractionData: CreateAttractionRequest) => {
      const newAttraction = await createAttraction(attractionData);
      setAttractions((attractions) => [...attractions, newAttraction]);
      return newAttraction;
    },
    updateAttraction: async (id: string, formData: UpdateAttractionRequest) => {
      const updatedAttraction = await updateAttraction(id, formData);

      setAttractions((attractions) => {
        const newAttractions = [...attractions];
        const index = attractions.findIndex((item) => item.id === id);

        if (index !== -1) {
          newAttractions.splice(index, 1, updatedAttraction);
        }

        return newAttractions;
      });

      return updatedAttraction;
    },
    deleteAttraction: async (id: string) => {
      await deleteAttraction(id);
      setAttractions((attractions) =>
        attractions.filter((attraction) => attraction.id !== id),
      );
    },
  };
};
